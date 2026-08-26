import { Component, Input, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RobotChatService, RobotChatResponse } from '../../../services/robot-chat.service';
import { AudioRecorderService, RecordedAudio } from '../../../services/audio-recorder.service';
import { CommandCenterService } from '../../../services/command-center.service';
import { Subscription } from 'rxjs';

interface ChatEntry {
  id: string;
  sender: 'user' | 'rotbot';
  text: string;
  emotion?: string;
  audio?: string | null;
  time: string;
}

@Component({
  selector: 'app-dash-rotbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Main Full-Level Container without page scroll -->
    <div class="w-full flex flex-col gap-4 tab-enter font-sans lg:h-[calc(100vh-170px)] lg:min-h-[560px] lg:max-h-[760px]">

      <!-- ═══════════════════════ 1. TOP HEADER (COMPACT & CLEAN) ═══════════════════════ -->
      <div class="flex-shrink-0 relative overflow-hidden rounded-[22px] sm:rounded-[26px] border px-4 py-3 sm:px-5 sm:py-3.5 transition-all duration-300"
           [ngClass]="isDark ? 'bg-[#090b10]/90 border-neutral-800 shadow-lg' : 'bg-white border-neutral-200/90 shadow-2xs'">
        
        <!-- Ambient Cyan Glow -->
        <div class="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none"></div>

        <div class="flex items-center justify-between gap-4 relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-inner">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zM9 10h.01M15 10h.01" />
              </svg>
            </div>
            <div>
              <h1 class="text-base sm:text-lg font-headline font-bold tracking-tight"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Chat de Rotbot
              </h1>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Habla con Rotbot
              </p>
            </div>
          </div>

          <!-- Controls: Voice Selector & Mute -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium"
                 [ngClass]="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'">
              <span class="text-[10px] font-mono text-cyan-400 uppercase font-bold">Voz:</span>
              <select [(ngModel)]="selectedVoiceId"
                      class="bg-transparent text-xs font-sans outline-none cursor-pointer">
                <option *ngFor="let v of voices" [value]="v.id" class="text-black dark:text-white bg-white dark:bg-neutral-900">{{ v.name }}</option>
              </select>
            </div>

            <button (click)="toggleMute()"
                    class="px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    [ngClass]="isMuted 
                      ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                      : (isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:text-black')"
                    [title]="isMuted ? 'Desmutear audio' : 'Silenciar audio'">
              <svg *ngIf="!isMuted" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.414 0-.75-.336-.75-.75V8.25c0-.414.336-.75.75-.75h2.24z" />
              </svg>
              <svg *ngIf="isMuted" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-1.5l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.414 0-.75-.336-.75-.75V8.25c0-.414.336-.75.75-.75h2.24z" />
              </svg>
              <span class="hidden sm:inline">{{ isMuted ? 'Silenciado' : 'Voz Activa' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════ 2. SAME-LEVEL 2-COLUMN GRID (EQUAL HEIGHT) ═══════════════════════ -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-0 overflow-hidden">

        <!-- ─────────── LEFT COLUMN: 3D ROTBOT HEAD STAGE (Col 5) ─────────── -->
        <div class="lg:col-span-5 h-full flex flex-col rounded-[24px] sm:rounded-[28px] border overflow-hidden transition-all duration-300 shadow-xl"
             [ngClass]="isDark ? 'bg-[#030508] border-neutral-800' : 'bg-[#060910] border-neutral-800 text-white'">
          
          <!-- Stage Top Header -->
          <div class="p-4 border-b flex items-center justify-between flex-shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/40' : 'border-neutral-800/80 bg-black/30'">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400" [ngClass]="isSpeaking ? 'animate-ping' : 'animate-pulse'"></span>
              <span class="text-xs font-headline font-bold uppercase tracking-wider text-cyan-300">
                Rotbot 3D Visor
              </span>
            </div>
            <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Online
            </span>
          </div>

          <!-- 3D Rotbot Head Centered Stage -->
          <div class="flex-1 relative flex items-center justify-center p-4 min-h-0 overflow-hidden">
            
            <!-- Ambient Blue Core Backlight -->
            <div class="absolute inset-0 bg-radial-gradient from-cyan-500/15 via-transparent to-transparent pointer-events-none"></div>

            <!-- Head Container with 1:1 Aspect Ratio -->
            <div class="relative w-full max-w-[290px] sm:max-w-[340px] aspect-square flex items-center justify-center my-auto select-none">
              
              <!-- 1. The Official 3D Rotbot Head Image -->
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/v1787626350/rotbot-img_j54b0d.png" 
                   alt="Rotbot Face" 
                   class="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter transition-transform duration-500 hover:scale-[1.02]" />

              <!-- 2. Overlay Visor Eyes Container (100% Exact Alignment) -->
              <div class="absolute top-[55.8%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[22%] flex items-center justify-center gap-[16%] pointer-events-none z-20">

                <!-- LEFT EYE -->
                <div class="eye-slot flex items-center justify-center w-1/2 h-full">
                  
                  <!-- Happy / Default Curved Eyes (^ ^) - Exact Rotbot SVG Style -->
                  <div *ngIf="currentEmotion === 'happy'" 
                       class="rotbot-eye-svg-box crescent"
                       [class.talking]="isSpeaking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" 
                            fill="#00f0ff" 
                            stroke="#00f0ff" 
                            stroke-width="5" 
                            stroke-linejoin="round" 
                            stroke-linecap="round" />
                    </svg>
                  </div>

                  <!-- Neutral Rounded Pill Eyes (- -) with Alive Blink -->
                  <div *ngIf="currentEmotion === 'neutral'" 
                       class="rotbot-eye-svg-box neutral"
                       [class.talking]="isSpeaking">
                    <div class="w-9 h-9 rounded-2xl bg-[#00f0ff] shadow-[0_0_16px_#00f0ff,0_0_35px_rgba(0,240,255,0.8)]"></div>
                  </div>

                  <!-- Thinking Eyes (Pulsing Ellipse) -->
                  <div *ngIf="currentEmotion === 'thinking'" 
                       class="rotbot-eye-svg-box thinking">
                    <div class="w-8 h-6 rounded-full bg-[#00f0ff] shadow-[0_0_16px_#00f0ff,0_0_35px_rgba(0,240,255,0.75)]"></div>
                  </div>

                  <!-- Surprised Big Round Eyes (O O) -->
                  <div *ngIf="currentEmotion === 'surprised'" 
                       class="rotbot-eye-svg-box surprised"
                       [class.talking]="isSpeaking">
                    <div class="w-10 h-10 rounded-full bg-[#00f0ff] shadow-[0_0_20px_#00f0ff,0_0_40px_rgba(0,240,255,0.9)]"></div>
                  </div>

                  <!-- Talking State -->
                  <div *ngIf="currentEmotion === 'talking'" 
                       class="rotbot-eye-svg-box crescent talking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" 
                            fill="#00f0ff" 
                            stroke="#00f0ff" 
                            stroke-width="5" 
                            stroke-linejoin="round" 
                            stroke-linecap="round" />
                    </svg>
                  </div>

                </div>

                <!-- RIGHT EYE -->
                <div class="eye-slot flex items-center justify-center w-1/2 h-full">
                  
                  <!-- Happy / Default Curved Eyes (^ ^) - Exact Rotbot SVG Style -->
                  <div *ngIf="currentEmotion === 'happy'" 
                       class="rotbot-eye-svg-box crescent"
                       [class.talking]="isSpeaking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" 
                            fill="#00f0ff" 
                            stroke="#00f0ff" 
                            stroke-width="5" 
                            stroke-linejoin="round" 
                            stroke-linecap="round" />
                    </svg>
                  </div>

                  <!-- Neutral Rounded Pill Eyes (- -) with Alive Blink -->
                  <div *ngIf="currentEmotion === 'neutral'" 
                       class="rotbot-eye-svg-box neutral"
                       [class.talking]="isSpeaking">
                    <div class="w-9 h-9 rounded-2xl bg-[#00f0ff] shadow-[0_0_16px_#00f0ff,0_0_35px_rgba(0,240,255,0.8)]"></div>
                  </div>

                  <!-- Thinking Eyes (Pulsing Ellipse) -->
                  <div *ngIf="currentEmotion === 'thinking'" 
                       class="rotbot-eye-svg-box thinking">
                    <div class="w-8 h-6 rounded-full bg-[#00f0ff] shadow-[0_0_16px_#00f0ff,0_0_35px_rgba(0,240,255,0.75)]"></div>
                  </div>

                  <!-- Surprised Big Round Eyes (O O) -->
                  <div *ngIf="currentEmotion === 'surprised'" 
                       class="rotbot-eye-svg-box surprised"
                       [class.talking]="isSpeaking">
                    <div class="w-10 h-10 rounded-full bg-[#00f0ff] shadow-[0_0_20px_#00f0ff,0_0_40px_rgba(0,240,255,0.9)]"></div>
                  </div>

                  <!-- Talking State -->
                  <div *ngIf="currentEmotion === 'talking'" 
                       class="rotbot-eye-svg-box crescent talking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" 
                            fill="#00f0ff" 
                            stroke="#00f0ff" 
                            stroke-width="5" 
                            stroke-linejoin="round" 
                            stroke-linecap="round" />
                    </svg>
                  </div>

                </div>

              </div>

            </div>

          </div>

          <!-- Bottom Voice Activity Status Bar -->
          <div class="p-3 border-t flex items-center justify-center flex-shrink-0 min-h-[44px]"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/40' : 'border-neutral-800/80 bg-black/30'">
            <ng-container *ngIf="isSpeaking">
              <div class="flex items-center justify-center gap-1.5">
                <span *ngFor="let _ of [1,2,3,4,5,6,7,8]" 
                      class="w-1 bg-cyan-400 rounded-full animate-voice-bar" 
                      [style.animation-delay]="(_ * 0.08) + 's'"></span>
                <span class="text-xs font-mono font-semibold text-cyan-400 ml-2 animate-pulse">Hablando por ElevenLabs...</span>
              </div>
            </ng-container>
            <ng-container *ngIf="!isSpeaking && isProcessing">
              <span class="text-xs font-mono text-cyan-300 animate-pulse">🧠 Procesando respuesta...</span>
            </ng-container>
            <ng-container *ngIf="!isSpeaking && !isProcessing">
              <span class="text-xs font-mono text-neutral-400">Listo para charlar</span>
            </ng-container>
          </div>

        </div>

        <!-- ─────────── RIGHT COLUMN: CONVERSATION CONSOLE (Col 7) ─────────── -->
        <div class="lg:col-span-7 h-full flex flex-col rounded-[24px] sm:rounded-[28px] border overflow-hidden transition-all duration-300 shadow-xl"
             [ngClass]="isDark ? 'bg-[#090b10]/90 border-neutral-800' : 'bg-white border-neutral-200/90'">

          <!-- Chat Top Header -->
          <div class="p-4 border-b flex items-center justify-between flex-shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/50' : 'border-neutral-200/80 bg-neutral-50/70'">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span class="text-xs font-headline font-bold uppercase tracking-wider"
                    [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                Consola de Conversación
              </span>
            </div>
            <button (click)="clearChat()" 
                    class="text-[11px] font-mono text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Limpiar</span>
            </button>
          </div>

          <!-- Chat Message Thread (Internal Scrollable Area) -->
          <div #chatContainer class="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar min-h-0">
            
            <div *ngFor="let entry of chatHistory" 
                 class="flex flex-col"
                 [ngClass]="entry.sender === 'user' ? 'items-end' : 'items-start'">
              
              <!-- Sender Header -->
              <div class="flex items-center gap-2 mb-1 px-1">
                <span class="text-[10px] font-mono uppercase tracking-wider font-bold"
                      [ngClass]="entry.sender === 'user' ? (isDark ? 'text-neutral-400' : 'text-neutral-500') : 'text-cyan-400'">
                  {{ entry.sender === 'user' ? 'Tú' : 'Rotbot IA' }}
                </span>
                <span class="text-[9px] text-neutral-400">{{ entry.time }}</span>
              </div>

              <!-- Message Bubble -->
              <div class="max-w-[90%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-sans leading-relaxed shadow-sm transition-all"
                   [ngClass]="entry.sender === 'user'
                     ? (isDark ? 'bg-neutral-800 text-white rounded-tr-xs' : 'bg-neutral-900 text-white rounded-tr-xs')
                     : (isDark ? 'bg-[#0d1017] border border-cyan-500/25 text-neutral-100 rounded-tl-xs shadow-[0_0_20px_rgba(0,229,255,0.06)]' : 'bg-cyan-50/60 border border-cyan-200 text-neutral-900 rounded-tl-xs')">
                
                <p class="whitespace-pre-line">{{ entry.text }}</p>

                <!-- Replay Audio Button -->
                <div *ngIf="entry.audio" class="mt-2.5 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between">
                  <button (click)="reproduceAudio(entry.audio)" 
                          class="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer font-bold">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    <span>Escuchar Voz ElevenLabs</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- Bottom Message Input Bar (Fixed at bottom of Card) -->
          <div class="p-3 sm:p-3.5 border-t flex-shrink-0"
               [ngClass]="isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50/90 border-neutral-200/90'">
            
            <div class="relative flex items-center gap-2">
              
              <!-- Voice Microphone Button -->
              <button (click)="toggleVoiceInput()"
                      [disabled]="isProcessing || isSpeaking"
                      class="p-2.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer disabled:opacity-40"
                      [ngClass]="isVoiceRecording 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse border-red-400' 
                        : (isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:text-black')"
                      [title]="isVoiceRecording ? 'Detener grabación' : 'Hablarle a Rotbot'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <!-- Text Input -->
              <input type="text"
                     [(ngModel)]="userMessage"
                     (keyup.enter)="send(userMessage)"
                     [disabled]="isProcessing || isSpeaking"
                     placeholder="Escríbele o háblale a Rotbot..."
                     class="flex-1 px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm outline-none transition-all font-sans"
                     [ngClass]="isDark ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400/60' : 'bg-white border-neutral-200 text-neutral-900 focus:border-cyan-500/60 shadow-2xs'" />

              <!-- Send Button -->
              <button (click)="send(userMessage)"
                      [disabled]="isProcessing || isSpeaking || !userMessage.trim()"
                      class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-95 flex items-center gap-1.5"
                      [ngClass]="isDark ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
                <span>{{ isProcessing ? '...' : 'Enviar' }}</span>
                <svg *ngIf="!isProcessing" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>

            </div>

            <!-- Voice Recording Indicator -->
            <div *ngIf="isVoiceRecording" class="flex items-center justify-center gap-2 mt-2 text-xs font-mono text-red-500 animate-pulse">
              <span>● Escuchando tu micrófono... habla ahora</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ═══════════════════════ SUBTLE VECTOR CYAN ROTBOT EYES ═══════════════════════ */
    .rotbot-eye-svg-box {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 0 8px #00f0ff) drop-shadow(0 0 20px rgba(0, 240, 255, 0.65));
    }

    /* 1. Signature Crescent Eye (^ ^) - Autonomous Blink & Gaze */
    .rotbot-eye-svg-box.crescent {
      animation: aliveCrescentBlink 4.2s infinite ease-in-out;
    }

    /* 2. Neutral Rounded Pill Eyes (- -) */
    .rotbot-eye-svg-box.neutral {
      animation: aliveNeutralBlink 3.8s infinite ease-in-out;
    }

    /* 3. Thinking Floating Ellipse Eyes */
    .rotbot-eye-svg-box.thinking {
      animation: thinkPulse 1.2s infinite alternate ease-in-out;
    }

    /* 4. Surprised Big Round Eyes (O O) */
    .rotbot-eye-svg-box.surprised {
      animation: aliveSurprise 4.5s infinite ease-in-out;
    }

    /* Talking Bounce Sync */
    .rotbot-eye-svg-box.talking {
      animation: talkingBounce 0.24s infinite alternate ease-in-out !important;
    }

    /* ═══════════════════════ AUTONOMOUS BLINK & GAZE ANIMATIONS ═══════════════════════ */
    @keyframes aliveCrescentBlink {
      0%, 82%, 100% {
        transform: translate(0, 0) scaleY(1);
      }
      25% {
        transform: translate(-2px, -1px) scaleY(1);
      }
      50% {
        transform: translate(2px, -1px) scaleY(1);
      }
      88% {
        transform: translate(0, 0) scaleY(0.08);
      }
      92% {
        transform: translate(0, 0) scaleY(1);
      }
      95% {
        transform: translate(0, 0) scaleY(0.08);
      }
    }

    @keyframes aliveNeutralBlink {
      0%, 80%, 100% {
        transform: translate(0, 0) scaleY(1);
      }
      30% {
        transform: translate(-3px, 0) scaleY(1);
      }
      60% {
        transform: translate(3px, 0) scaleY(1);
      }
      88% {
        transform: translate(0, 0) scaleY(0.06);
      }
      92% {
        transform: translate(0, 0) scaleY(1);
      }
    }

    @keyframes aliveSurprise {
      0%, 88%, 100% { transform: scale(1.1) translate(0, 0); }
      93% { transform: scale(1.1) scaleY(0.1); }
    }

    @keyframes thinkPulse {
      0% { transform: translateY(-5px) scale(0.85); opacity: 0.75; }
      100% { transform: translateY(4px) scale(1); opacity: 1; }
    }

    @keyframes talkingBounce {
      0% { transform: scaleY(1) scaleX(1); }
      50% { transform: scaleY(0.6) scaleX(1.08); }
      100% { transform: scaleY(1.15) scaleX(0.94); }
    }

    @keyframes voiceBar {
      0%, 100% { height: 4px; }
      50% { height: 18px; }
    }

    .animate-voice-bar {
      animation: voiceBar 0.45s ease-in-out infinite alternate;
    }
  `]
})
export class DashRotbotComponent implements OnInit, OnDestroy {
  @Input() theme = 'dark';

  private robotService = inject(RobotChatService);
  private audioRecorder = inject(AudioRecorderService);
  private commandCenter = inject(CommandCenterService);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  currentEmotion: string = 'happy';
  isSpeaking = false;
  isProcessing = false;
  isMuted = false;
  isVoiceRecording = false;

  userMessage = '';
  selectedVoiceId = 'iP95p4xoKVk53GoZ742B';
  voices = this.robotService.voices;

  chatHistory: ChatEntry[] = [
    {
      id: 'welcome',
      sender: 'rotbot',
      text: 'Hola, qué tal. Pregúntame lo que necesites o cuéntame lo que quieras.',
      emotion: 'happy',
      time: 'Ahora'
    }
  ];

  private currentAudio: HTMLAudioElement | null = null;
  private voiceSub!: Subscription;

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.voiceSub = this.audioRecorder.recordedAudio$.subscribe(rec => {
      this.handleVoiceTranscript(rec);
    });
  }

  ngOnDestroy() {
    this.stopAudio();
    if (this.voiceSub) this.voiceSub.unsubscribe();
  }

  clearChat() {
    this.chatHistory = [
      {
        id: 'welcome_' + Date.now(),
        sender: 'rotbot',
        text: 'Listo, conversación limpia. Cuéntame.',
        emotion: 'happy',
        time: 'Ahora'
      }
    ];
  }

  send(msg: string) {
    const text = msg.trim();
    if (!text || this.isProcessing || this.isSpeaking) return;

    this.userMessage = '';
    this.isProcessing = true;
    this.currentEmotion = 'thinking';

    // Añadir mensaje del usuario
    this.chatHistory.push({
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    });
    this.scrollToBottom();

    // Construir historial reciente para memoria conversacional
    const history = this.chatHistory.slice(-8).map(entry => ({
      role: entry.sender === 'user' ? 'user' : 'model',
      content: entry.text
    }));

    this.robotService.sendMessage(text, this.selectedVoiceId, history).subscribe({
      next: (res: RobotChatResponse) => {
        this.isProcessing = false;
        this.currentEmotion = res.emotion || 'happy';

        // Guardar mensaje de Rotbot
        this.chatHistory.push({
          id: 'bot_' + Date.now(),
          sender: 'rotbot',
          text: res.reply,
          emotion: res.emotion,
          audio: res.audio,
          time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        });
        this.scrollToBottom();

        // Reproducir voz si viene audio y no está silenciado
        if (res.audio && !this.isMuted) {
          this.reproduceAudio(res.audio);
        } else {
          setTimeout(() => {
            if (!this.isSpeaking) this.currentEmotion = 'happy';
          }, 3500);
        }
      },
      error: () => {
        this.isProcessing = false;
        this.currentEmotion = 'neutral';
      }
    });
  }

  reproduceAudio(audioBase64: string) {
    this.stopAudio();

    try {
      this.currentAudio = new Audio(audioBase64);
      this.isSpeaking = true;
      this.currentEmotion = 'talking';

      this.currentAudio.onended = () => {
        this.isSpeaking = false;
        this.currentEmotion = 'happy';
      };

      this.currentAudio.onerror = () => {
        this.isSpeaking = false;
        this.currentEmotion = 'happy';
      };

      this.currentAudio.play().catch(() => {
        this.isSpeaking = false;
        this.currentEmotion = 'happy';
      });
    } catch {
      this.isSpeaking = false;
      this.currentEmotion = 'happy';
    }
  }

  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isSpeaking = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopAudio();
  }

  toggleVoiceInput() {
    if (this.isVoiceRecording) {
      this.audioRecorder.stopRecording();
      this.isVoiceRecording = false;
    } else {
      this.isVoiceRecording = true;
      this.audioRecorder.startRecording();
    }
  }

  private handleVoiceTranscript(audio: RecordedAudio) {
    this.isVoiceRecording = false;
    this.isProcessing = true;
    this.currentEmotion = 'thinking';

    this.commandCenter.queryVoiceAudio(audio.base64, audio.mimeType).subscribe({
      next: (res) => {
        if (res && res.transcript) {
          this.send(res.transcript);
        } else {
          this.isProcessing = false;
          this.currentEmotion = 'happy';
        }
      },
      error: () => {
        this.isProcessing = false;
        this.currentEmotion = 'neutral';
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
