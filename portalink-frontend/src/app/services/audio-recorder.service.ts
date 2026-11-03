import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface RecordedAudio {
  blob: Blob;
  base64: string;
  mimeType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {
  private zone = inject(NgZone);

  readonly isRecording$ = new BehaviorSubject<boolean>(false);
  readonly audioVolume$ = new BehaviorSubject<number>(0);
  readonly recordedAudio$ = new Subject<RecordedAudio>();
  readonly error$ = new Subject<string>();

  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private silenceTimer: any = null;
  private recordingTimeout: any = null;
  private selectedMimeType = 'audio/webm';

  /**
   * Verifica si el navegador soporta getUserMedia y MediaRecorder
   */
  get isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  /**
   * Inicia la captura de audio del micrófono con visualizador de volumen en tiempo real
   */
  async startRecording(): Promise<void> {
    if (!this.isSupported || this.isRecording$.value) return;

    try {
      this.audioChunks = [];
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Detectar el formato de audio soportado por el navegador (Chrome/Edge: webm, Safari: mp4)
      this.selectedMimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          this.selectedMimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          this.selectedMimeType = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          this.selectedMimeType = 'audio/aac';
        } else {
          this.selectedMimeType = '';
        }
      }

      const options = this.selectedMimeType ? { mimeType: this.selectedMimeType } : undefined;
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const actualMime = this.mediaRecorder?.mimeType || this.selectedMimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: actualMime });
        this.cleanupAudioContext();

        if (audioBlob.size > 1000) {
          const base64 = await this.blobToBase64(audioBlob);
          this.zone.run(() => {
            this.recordedAudio$.next({
              blob: audioBlob,
              base64,
              mimeType: actualMime
            });
          });
        }
      };

      // Iniciar captura de audio
      this.mediaRecorder.start(100);
      this.zone.run(() => this.isRecording$.next(true));

      // Configurar Analizador de Volumen en Tiempo Real
      this.setupAudioAnalyser(this.mediaStream);

      // Auto-límite máximo de 10 segundos para comandos de voz
      this.recordingTimeout = setTimeout(() => {
        this.stopRecording();
      }, 10000);

    } catch (err: any) {
      this.cleanup();
      this.zone.run(() => {
        this.isRecording$.next(false);
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          this.error$.next('Permiso de micrófono denegado. Permítelo en tu navegador.');
        } else {
          this.error$.next('No se pudo acceder al micrófono.');
        }
      });
    }
  }

  /**
   * Detiene la grabación y procesa el audio
   */
  stopRecording(): void {
    if (!this.isRecording$.value) return;

    clearTimeout(this.recordingTimeout);
    clearTimeout(this.silenceTimer);

    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    } catch {}

    this.cleanup();
    this.zone.run(() => {
      this.isRecording$.next(false);
      this.audioVolume$.next(0);
    });
  }

  toggle(): void {
    if (this.isRecording$.value) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private setupAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let consecutiveSilenceCount = 0;
      let hasSpoken = false;

      const updateVolume = () => {
        if (!this.analyser || !this.isRecording$.value) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        this.zone.run(() => this.audioVolume$.next(normalized));

        // Detección inteligente de silencio tras haber hablado
        if (normalized > 12) {
          hasSpoken = true;
          consecutiveSilenceCount = 0;
        } else if (hasSpoken) {
          consecutiveSilenceCount++;
          // Tras ~1.8 segundos de silencio después de hablar, auto-detener
          if (consecutiveSilenceCount > 55) {
            this.stopRecording();
            return;
          }
        }

        this.animFrameId = requestAnimationFrame(updateVolume);
      };

      this.animFrameId = requestAnimationFrame(updateVolume);
    } catch {}
  }

  private cleanupAudioContext() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch {}
    }
    this.audioContext = null;
    this.analyser = null;
  }

  private cleanup() {
    this.cleanupAudioContext();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        const base64 = res.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
