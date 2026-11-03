import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private zone = inject(NgZone);
  private recognition: any = null;

  /** Whether the browser supports speech recognition */
  readonly isSupported: boolean;

  /** Reactive listening state */
  readonly isListening$ = new BehaviorSubject<boolean>(false);

  /** Emits interim transcripts (updates as user speaks) */
  readonly transcript$ = new Subject<string>();

  /** Emits only the final confirmed transcript */
  readonly finalTranscript$ = new Subject<string>();

  /** Emits errors */
  readonly error$ = new Subject<string>();

  constructor() {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'es-CO';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        this.zone.run(() => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final = transcript.trim();
            } else {
              interim = transcript;
            }
          }

          if (interim) {
            this.transcript$.next(interim);
          }

          if (final) {
            this.transcript$.next(final);
            this.finalTranscript$.next(final);
          }
        });
      };

      this.recognition.onend = () => {
        this.zone.run(() => {
          this.isListening$.next(false);
        });
      };

      this.recognition.onerror = (event: any) => {
        this.zone.run(() => {
          this.isListening$.next(false);

          // Silently handle expected/non-critical errors
          const silenced = ['no-speech', 'aborted', 'network', 'audio-capture', 'not-allowed'];
          if (!silenced.includes(event.error)) {
            this.error$.next(event.error);
          }

          // For network errors, emit a specific user-facing message
          if (event.error === 'network') {
            this.error$.next('voice-unavailable');
          }
        });
      };

      this.recognition.onspeechend = () => {
        // Browser detected end of speech — recognition will fire onend automatically
      };
    }
  }

  startListening(): void {
    if (!this.isSupported || this.isListening$.value) return;

    try {
      this.recognition.start();
      this.isListening$.next(true);
    } catch (e) {
      // Already started — ignore
      console.warn('[Speech] Could not start:', e);
    }
  }

  stopListening(): void {
    if (!this.isSupported || !this.isListening$.value) return;

    try {
      this.recognition.stop();
    } catch (e) {
      // Not started — ignore
    }
    this.isListening$.next(false);
  }

  toggle(): void {
    if (this.isListening$.value) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }
}
