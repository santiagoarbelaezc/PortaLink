import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TtsVoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isHighQuality: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpanishTtsService {
  private http = inject(HttpClient);

  private isSpeakingSubject = new BehaviorSubject<boolean>(false);
  public isSpeaking$: Observable<boolean> = this.isSpeakingSubject.asObservable();

  private isPausedSubject = new BehaviorSubject<boolean>(false);
  public isPaused$: Observable<boolean> = this.isPausedSubject.asObservable();

  private currentEmotionSubject = new BehaviorSubject<'neutral' | 'happy' | 'talking' | 'thinking' | 'surprised'>('happy');
  public currentEmotion$: Observable<'neutral' | 'happy' | 'talking' | 'thinking' | 'surprised'> = this.currentEmotionSubject.asObservable();

  private voicesSubject = new BehaviorSubject<TtsVoiceOption[]>([]);
  public voices$: Observable<TtsVoiceOption[]> = this.voicesSubject.asObservable();

  private selectedVoice: SpeechSynthesisVoice | null = null;
  private currentChunks: string[] = [];
  private currentChunkIndex = 0;
  private isCanceled = false;

  private currentAudio: HTMLAudioElement | null = null;
  private currentHttpSub: Subscription | null = null;

  public rate: number = 1.0;
  public pitch: number = 1.0;

  constructor() {
    this.initVoices();
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingSubject.value;
  }

  public get isPaused(): boolean {
    return this.isPausedSubject.value;
  }

  public get currentEmotion(): 'neutral' | 'happy' | 'talking' | 'thinking' | 'surprised' {
    return this.currentEmotionSubject.value;
  }

  public setEmotion(emotion: 'neutral' | 'happy' | 'talking' | 'thinking' | 'surprised'): void {
    this.currentEmotionSubject.next(emotion);
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      const spanishVoices = allVoices.filter(v => 
        (v.lang && v.lang.toLowerCase().startsWith('es')) || 
        v.name.toLowerCase().includes('spanish') || 
        v.name.toLowerCase().includes('español')
      );

      const pool = spanishVoices.length > 0 ? spanishVoices : allVoices;

      const mapped: TtsVoiceOption[] = pool.map(voice => {
        const nameLower = voice.name.toLowerCase();
        const isNatural = nameLower.includes('natural') || 
                          nameLower.includes('neural') || 
                          nameLower.includes('online') || 
                          nameLower.includes('premium') ||
                          nameLower.includes('google');

        let display = voice.name
          .replace(/Microsoft /g, '')
          .replace(/Google /g, '')
          .replace(/ Online \(Natural\)/gi, ' ⭐ Natural')
          .replace(/ \(Natural\)/gi, ' ⭐ Natural')
          .replace(/ \(Neural\)/gi, ' ⭐ Neural');

        return {
          voice,
          displayName: `${display} (${voice.lang})`,
          isHighQuality: isNatural
        };
      });

      mapped.sort((a, b) => {
        if (a.isHighQuality && !b.isHighQuality) return -1;
        if (!a.isHighQuality && b.isHighQuality) return 1;
        return a.displayName.localeCompare(b.displayName);
      });

      this.voicesSubject.next(mapped);

      if (!this.selectedVoice && mapped.length > 0) {
        this.selectedVoice = mapped[0].voice;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public setSelectedVoice(voice: SpeechSynthesisVoice): void {
    this.selectedVoice = voice;
  }

  public setSelectedVoiceByName(voiceName: string): void {
    const list = this.voicesSubject.value;
    const match = list.find(v => v.voice.name === voiceName);
    if (match) {
      this.selectedVoice = match.voice;
    }
  }

  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    return rawText
      .replace(/<[^>]*>/g, ' ')
      .replace(/```[\s\S]*?```/g, ' bloque de código omitido ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>|]/g, ' ')
      .replace(/https?:\/\/\S+/g, ' enlace ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private splitIntoChunks(text: string): string[] {
    const rawChunks = text.match(/[^.!?;\n]+[.!?;\n]+|[^.!?;\n]+$/g) || [text];
    const result: string[] = [];

    let current = '';
    for (const chunk of rawChunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      if ((current + ' ' + trimmed).length > 160) {
        if (current) result.push(current.trim());
        current = trimmed;
      } else {
        current = current ? current + ' ' + trimmed : trimmed;
      }
    }

    if (current.trim()) {
      result.push(current.trim());
    }

    return result.length > 0 ? result : [text];
  }

  /**
   * Lee un texto en voz alta en español.
   * Prioriza el motor Neural de RotBot (mismo respaldo de alta fidelidad que usa RotBot cuando se agotan tokens),
   * y conmuta a speechSynthesis del navegador como respaldo instantáneo.
   */
  public speak(text: string, onEndCallback?: () => void): void {
    this.stop();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) return;

    this.isCanceled = false;
    this.isSpeakingSubject.next(true);
    this.isPausedSubject.next(false);
    this.currentEmotionSubject.next('talking');

    // 1. Intentar con el motor de voz neural de alta calidad de RotBot
    const ttsUrl = `${environment.apiUrl}/robot/tts`;
    this.currentHttpSub = this.http.post<{ ok: boolean; audio?: string }>(ttsUrl, {
      text: cleanText,
      lang: 'es'
    }).subscribe({
      next: (res) => {
        if (this.isCanceled) return;

        if (res && res.ok && res.audio) {
          try {
            this.currentAudio = new Audio(res.audio);
            this.currentAudio.playbackRate = this.rate;

            this.currentAudio.onended = () => {
              this.finishSpeaking(onEndCallback);
            };

            this.currentAudio.onerror = () => {
              if (!this.isCanceled) {
                this.fallbackSpeechSynthesis(cleanText, onEndCallback);
              }
            };

            this.currentAudio.play().catch(() => {
              if (!this.isCanceled) {
                this.fallbackSpeechSynthesis(cleanText, onEndCallback);
              }
            });
            return;
          } catch {
            this.fallbackSpeechSynthesis(cleanText, onEndCallback);
          }
        } else {
          this.fallbackSpeechSynthesis(cleanText, onEndCallback);
        }
      },
      error: () => {
        if (!this.isCanceled) {
          this.fallbackSpeechSynthesis(cleanText, onEndCallback);
        }
      }
    });
  }

  /**
   * Fallback nativo utilizando SpeechSynthesis del navegador
   */
  private fallbackSpeechSynthesis(cleanText: string, onEndCallback?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.finishSpeaking(onEndCallback);
      return;
    }

    this.currentChunks = this.splitIntoChunks(cleanText);
    this.currentChunkIndex = 0;
    this.speakNextChunk(onEndCallback);
  }

  private speakNextChunk(onEndCallback?: () => void): void {
    if (this.isCanceled || this.currentChunkIndex >= this.currentChunks.length) {
      this.finishSpeaking(onEndCallback);
      return;
    }

    const chunk = this.currentChunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.lang = this.selectedVoice?.lang || 'es-ES';

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onend = () => {
      if (this.isCanceled) return;
      this.currentChunkIndex++;
      this.speakNextChunk(onEndCallback);
    };

    utterance.onerror = () => {
      if (this.isCanceled) return;
      this.currentChunkIndex++;
      this.speakNextChunk(onEndCallback);
    };

    window.speechSynthesis.speak(utterance);
  }

  private finishSpeaking(onEndCallback?: () => void): void {
    this.isSpeakingSubject.next(false);
    this.isPausedSubject.next(false);
    this.currentEmotionSubject.next('happy');
    this.currentAudio = null;

    if (onEndCallback) {
      onEndCallback();
    }
  }

  public stop(): void {
    this.isCanceled = true;

    if (this.currentHttpSub) {
      this.currentHttpSub.unsubscribe();
      this.currentHttpSub = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.isSpeakingSubject.next(false);
    this.isPausedSubject.next(false);
    this.currentEmotionSubject.next('happy');
  }

  public pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPausedSubject.next(true);
      this.currentEmotionSubject.next('happy');
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.isPausedSubject.next(true);
      this.currentEmotionSubject.next('happy');
    }
  }

  public resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
      this.isPausedSubject.next(false);
      this.currentEmotionSubject.next('talking');
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.isPausedSubject.next(false);
      this.currentEmotionSubject.next('talking');
    }
  }

  public togglePause(): void {
    if (this.isPausedSubject.value) {
      this.resume();
    } else {
      this.pause();
    }
  }
}
