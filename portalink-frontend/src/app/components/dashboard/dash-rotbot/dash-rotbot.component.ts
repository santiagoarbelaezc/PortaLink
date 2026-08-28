import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RobotChatService, RobotChatResponse, RotbotMode } from '../../../services/robot-chat.service';
import { AudioRecorderService, RecordedAudio } from '../../../services/audio-recorder.service';
import { CommandCenterService } from '../../../services/command-center.service';
import { Subscription } from 'rxjs';
import { DashStudyPlanComponent } from './dash-study-plan.component';

interface ChatEntry {
  id: string;
  sender: 'user' | 'rotbot';
  text: string;
  emotion?: string;
  audio?: string | null;
  phrase?: string | null;
  phrase_audio?: string | null;
  score?: number | null;
  time: string;
}

@Component({
  selector: 'app-dash-rotbot',
  standalone: true,
  imports: [CommonModule, FormsModule, DashStudyPlanComponent],
  template: `
    <!-- Main Cockpit Container (Full Width & Locked Scroll) -->
    <div class="w-full h-full flex flex-col justify-center tab-enter font-sans min-h-0 my-auto">

      <!-- ═══════════════════════ STUDY PLAN HUB VIEW ═══════════════════════ -->
      <app-dash-study-plan
        *ngIf="currentMode === 'study-plan'"
        class="w-full h-full flex flex-col min-h-0"
        [theme]="theme"
        (switchMode)="switchMode($event)">
      </app-dash-study-plan>

      <!-- ═══════════════════════ 2-COLUMN ROTBOT COCKPIT (CHAT / LEARN / LISTENING) ═══════════════════════ -->
      <div *ngIf="currentMode !== 'study-plan'"
           class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch min-h-0 h-full w-full overflow-hidden">

        <!-- ─────────── LEFT COLUMN: LARGER 3D ROTBOT HEAD STAGE (Col 5) ─────────── -->
        <div class="lg:col-span-5 h-full flex flex-col justify-center items-center rounded-[24px] sm:rounded-[28px] border overflow-hidden transition-all duration-300 shadow-xl relative"
             [ngClass]="isDark ? 'bg-[#030508] border-neutral-800' : 'bg-[#060910] border-neutral-800 text-white'">
          
          <!-- Ambient Radial Cyan Core Backlight -->
          <div class="absolute inset-0 bg-radial-gradient from-cyan-500/20 via-transparent to-transparent pointer-events-none"></div>

          <!-- 3D Rotbot Head Stage (Enlarged & Prominent) -->
          <div class="w-full h-full relative flex items-center justify-center p-6 min-h-0 overflow-hidden select-none">
            
            <!-- Head Container with Scaled Dimensions -->
            <div class="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] aspect-square flex items-center justify-center my-auto">
              
              <!-- 1. The Official 3D Rotbot Head Image -->
              <img src="https://res.cloudinary.com/doxdjiyvi/image/upload/v1787626350/rotbot-img_j54b0d.png" 
                   alt="Rotbot Face" 
                   class="w-full h-full object-contain pointer-events-none drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)] filter transition-transform duration-500 hover:scale-[1.02]" />

              <!-- 2. Overlay Visor Eyes Container -->
              <div class="absolute top-[55.8%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[22%] flex items-center justify-center gap-[16%] pointer-events-none z-20">

                <!-- LEFT EYE -->
                <div class="eye-slot flex items-center justify-center w-1/2 h-full">
                  <div *ngIf="currentEmotion === 'happy'" class="rotbot-eye-svg-box crescent" [class.talking]="isSpeaking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" fill="#00f0ff" stroke="#00f0ff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div *ngIf="currentEmotion === 'neutral'" class="rotbot-eye-svg-box neutral" [class.talking]="isSpeaking">
                    <div class="w-10 h-10 rounded-2xl bg-[#00f0ff] shadow-[0_0_18px_#00f0ff,0_0_40px_rgba(0,240,255,0.85)]"></div>
                  </div>
                  <div *ngIf="currentEmotion === 'thinking'" class="rotbot-eye-svg-box thinking">
                    <div class="w-9 h-7 rounded-full bg-[#00f0ff] shadow-[0_0_18px_#00f0ff,0_0_40px_rgba(0,240,255,0.8)]"></div>
                  </div>
                  <div *ngIf="currentEmotion === 'surprised'" class="rotbot-eye-svg-box surprised" [class.talking]="isSpeaking">
                    <div class="w-11 h-11 rounded-full bg-[#00f0ff] shadow-[0_0_22px_#00f0ff,0_0_45px_rgba(0,240,255,0.95)]"></div>
                  </div>
                  <div *ngIf="currentEmotion === 'talking'" class="rotbot-eye-svg-box crescent talking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" fill="#00f0ff" stroke="#00f0ff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>

                <!-- RIGHT EYE -->
                <div class="eye-slot flex items-center justify-center w-1/2 h-full">
                  <div *ngIf="currentEmotion === 'happy'" class="rotbot-eye-svg-box crescent" [class.talking]="isSpeaking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" fill="#00f0ff" stroke="#00f0ff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div *ngIf="currentEmotion === 'neutral'" class="rotbot-eye-svg-box neutral" [class.talking]="isSpeaking">
                    <div class="w-10 h-10 rounded-2xl bg-[#00f0ff] shadow-[0_0_18px_#00f0ff,0_0_40px_rgba(0,240,255,0.85)]"></div>
                  </div>
                  <div *ngIf="currentEmotion === 'thinking'" class="rotbot-eye-svg-box thinking">
                    <div class="w-9 h-7 rounded-full bg-[#00f0ff] shadow-[0_0_18px_#00f0ff,0_0_40px_rgba(0,240,255,0.8)]"></div>
                  </div>
                  <div *ngIf="currentEmotion === 'surprised'" class="rotbot-eye-svg-box surprised" [class.talking]="isSpeaking">
                    <div class="w-11 h-11 rounded-full bg-[#00f0ff] shadow-[0_0_22px_#00f0ff,0_0_45px_rgba(0,240,255,0.95)]"></div>
                  </div>
                  <div *ngIf="currentEmotion === 'talking'" class="rotbot-eye-svg-box crescent talking">
                    <svg viewBox="0 0 100 52" class="w-full h-full">
                      <path d="M 14 36 C 24 10, 76 10, 86 36 C 74 22, 26 22, 14 36 Z" fill="#00f0ff" stroke="#00f0ff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- Dynamic Speech & Thinking Floating Indicator (Visible ONLY when active) -->
          <div *ngIf="isSpeaking || isProcessing" 
               class="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border bg-black/80 backdrop-blur-md border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.2)] flex items-center gap-2 z-30 transition-all">
            <ng-container *ngIf="isSpeaking">
              <div class="flex items-center gap-1">
                <span *ngFor="let _ of [1,2,3,4,5,6]" 
                      class="w-1 bg-cyan-400 rounded-full animate-voice-bar" 
                      [style.animation-delay]="(_ * 0.08) + 's'"></span>
              </div>
              <span class="text-xs font-mono font-semibold text-cyan-300">Speaking...</span>
            </ng-container>
            <ng-container *ngIf="!isSpeaking && isProcessing">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span class="text-xs font-mono text-cyan-300">Thinking...</span>
            </ng-container>
          </div>

        </div>

        <!-- ─────────── RIGHT COLUMN: CONVERSATION & PRACTICE CONSOLE (Col 7) ─────────── -->
        <div class="lg:col-span-7 h-full flex flex-col rounded-[24px] sm:rounded-[28px] border overflow-hidden transition-all duration-300 shadow-xl"
             [ngClass]="isDark ? 'bg-[#090b10]/90 border-neutral-800' : 'bg-white border-neutral-200/90'">

          <!-- Chat Top Header -->
          <div class="px-5 py-3 border-b flex items-center justify-between flex-shrink-0 relative z-30"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/50' : 'border-neutral-200/80 bg-neutral-50/70'">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <span class="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider truncate"
                    [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                {{ currentMode === 'charla' ? 'English Lounge' : (currentMode === 'ensenanza' ? 'Classroom' : 'Listening Lab') }}
              </span>
            </div>

            <!-- Right Header Controls: Reset Button -->
            <button (click)="clearChat()" 
                    class="text-xs font-mono text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-neutral-800 hover:bg-neutral-900/50"
                    title="Reiniciar conversación">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Reset</span>
            </button>
          </div>

          <!-- 📌 ACTIVE STUDY PLAN BANNER -->
          <div *ngIf="isStudyPlanActive && studyPlanText.trim()" 
               class="mx-4 sm:mx-5 mt-3 px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs transition-all shadow-xs"
               [ngClass]="isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-900'">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <span class="font-bold truncate">Daily Plan Grounded:</span>
              <span class="truncate opacity-80 font-mono text-[11px]">{{ getStudyPlanPreview() }}</span>
            </div>
            <button (click)="switchMode('study-plan')" class="underline hover:text-cyan-400 font-bold shrink-0 cursor-pointer ml-2">
              Manage Plans
            </button>
          </div>

          <!-- 🎧 SPECIAL INTERACTIVE CARD FOR ESCUCHA (LISTENING & SPEAKING) MODE -->
          <div *ngIf="currentMode === 'escucha' && currentPhrase" 
               class="mx-4 sm:mx-5 mt-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden"
               [ngClass]="isDark ? 'bg-[#04121a] border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.12)]' : 'bg-gradient-to-r from-cyan-50 to-sky-100/90 border-cyan-300 shadow-sm'">
            
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span class="text-[11px] font-mono font-bold tracking-wider uppercase"
                      [ngClass]="isDark ? 'text-cyan-400' : 'text-cyan-800'">
                  Target Phrase
                </span>
              </div>

              <!-- Score Badge if available -->
              <div *ngIf="lastScore !== null" 
                   class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-bold border shadow-2xs"
                   [ngClass]="lastScore >= 80 
                     ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-900 border-emerald-300') 
                     : (lastScore >= 60 
                       ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-900 border-amber-300') 
                       : (isDark ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-red-100 text-red-900 border-red-300'))">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Score: {{ lastScore }}%</span>
              </div>
            </div>

            <!-- Target English Sentence Display (Enlarged) -->
            <p class="text-base sm:text-lg lg:text-xl font-headline font-bold leading-relaxed my-3"
               [ngClass]="isDark ? 'text-cyan-50' : 'text-neutral-900'">
              "{{ currentPhrase }}"
            </p>

            <!-- Action buttons: Listen again & Request new -->
            <div class="flex items-center justify-between gap-3 mt-3 pt-3"
                 [ngClass]="isDark ? 'border-t border-cyan-500/20' : 'border-t border-cyan-200'">
              <div class="flex items-center gap-2">
                <button (click)="pronouncePhrase(currentPhrase, lastPhraseAudio)" 
                        class="px-4 py-2 rounded-xl border text-xs sm:text-sm font-mono font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        [ngClass]="isDark 
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300' 
                          : 'bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white shadow-xs'">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Listen to Phrase</span>
                </button>
              </div>

              <button (click)="requestNewListeningPhrase()" 
                      [disabled]="isProcessing"
                      class="text-xs sm:text-sm font-mono flex items-center gap-1.5 cursor-pointer transition-colors font-semibold disabled:opacity-40"
                      [ngClass]="isDark ? 'text-neutral-300 hover:text-cyan-300' : 'text-neutral-700 hover:text-cyan-700'">
                <span>Next Phrase</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>

          <!-- Chat Message Thread (Internal Scrollable Area) -->
          <div #chatContainer class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 no-scrollbar min-h-0">
            
            <div *ngFor="let entry of chatHistory" 
                 class="flex flex-col"
                 [ngClass]="entry.sender === 'user' ? 'items-end' : 'items-start'">
              
              <!-- Sender Header -->
              <div class="flex items-center gap-2 mb-1.5 px-1">
                <span class="text-[11px] font-mono uppercase tracking-wider font-bold"
                      [ngClass]="entry.sender === 'user' ? (isDark ? 'text-neutral-400' : 'text-neutral-500') : (isDark ? 'text-cyan-400' : 'text-cyan-700')">
                  {{ entry.sender === 'user' ? 'You' : 'Rotbot AI' }}
                </span>
                <span *ngIf="entry.score !== null && entry.score !== undefined" 
                      class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border"
                      [ngClass]="entry.score >= 80 
                        ? (isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300') 
                        : (entry.score >= 60 
                          ? (isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-900 border-amber-300') 
                          : (isDark ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-red-100 text-red-900 border-red-300'))">
                  Score: {{ entry.score }}%
                </span>
                <span class="text-[10px] text-neutral-400">{{ entry.time }}</span>
              </div>

              <!-- Message Bubble (Higher Font Size & Better Readability) -->
              <div class="max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-4.5 text-[15px] sm:text-[16px] font-sans leading-relaxed shadow-sm transition-all"
                   [ngClass]="entry.sender === 'user'
                     ? (isDark ? 'bg-neutral-800 text-white rounded-tr-xs' : 'bg-neutral-900 text-white rounded-tr-xs')
                     : (isDark ? 'bg-[#0d1017] border border-cyan-500/25 text-neutral-100 rounded-tl-xs shadow-[0_0_20px_rgba(0,229,255,0.06)]' : 'bg-cyan-50/70 border border-cyan-200/90 text-neutral-900 rounded-tl-xs')">
                
                <p class="whitespace-pre-line m-0">{{ entry.text }}</p>

                <!-- High-Contrast Target Phrase Box in chat -->
                <div *ngIf="entry.phrase" 
                     class="mt-3.5 p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all"
                     [ngClass]="isDark 
                       ? 'bg-[#04121a] border-cyan-500/40 text-cyan-100 shadow-[0_0_20px_rgba(0,240,255,0.08)]' 
                       : 'bg-gradient-to-r from-cyan-50 to-sky-100/80 border-cyan-300 text-neutral-900 shadow-2xs'">
                  <div class="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider"
                       [ngClass]="isDark ? 'text-cyan-400' : 'text-cyan-800'">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0v7.5a3 3 0 01-3 3z" />
                    </svg>
                    <span>Target phrase to practice:</span>
                  </div>
                  <p class="font-headline font-bold text-[15px] sm:text-[17px] tracking-wide m-0"
                     [ngClass]="isDark ? 'text-cyan-100' : 'text-neutral-900'">
                    "{{ entry.phrase }}"
                  </p>
                </div>

                <!-- Replay Audio Button -->
                <div *ngIf="entry.phrase || entry.audio" class="mt-3.5 pt-3 flex items-center justify-between"
                     [ngClass]="isDark ? 'border-t border-cyan-500/20' : 'border-t border-cyan-200/80'">
                  <button (click)="entry.phrase ? pronouncePhrase(entry.phrase, entry.phrase_audio) : reproduceAudio(entry.audio!)" 
                          class="px-4 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 shadow-2xs"
                          [ngClass]="isDark 
                            ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/35 text-cyan-300' 
                            : 'bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white shadow-xs'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{{ entry.phrase ? 'Listen to Pronunciation' : 'Listen to Voice' }}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- Bottom Message Input Bar (Fixed at bottom of Card) -->
          <div class="p-3.5 sm:p-4 border-t flex-shrink-0"
               [ngClass]="isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50/90 border-neutral-200/90'">
            
            <div class="relative flex items-center gap-2.5">
              
              <!-- High-Visibility Microphone Action Button -->
              <button (click)="toggleVoiceInput()"
                      [disabled]="isProcessing || isSpeaking"
                      class="w-12 h-12 rounded-2xl border transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 relative group"
                      [ngClass]="isVoiceRecording 
                        ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.65)] border-rose-400 scale-105' 
                        : (isDark ? 'bg-neutral-900 border-neutral-700/80 text-cyan-400 hover:bg-neutral-800 hover:border-cyan-500/50 hover:text-cyan-300 shadow-sm' : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-50 hover:border-cyan-500 shadow-xs')"
                      [title]="isVoiceRecording ? 'Stop recording' : (currentMode === 'escucha' ? 'Speak the phrase' : 'Speak in English')">
                
                <!-- Radar Ping Ripples while active -->
                <span *ngIf="isVoiceRecording" class="absolute -inset-1 rounded-2xl bg-rose-500/40 animate-ping pointer-events-none"></span>
                <span *ngIf="isVoiceRecording" class="absolute -inset-0.5 rounded-2xl bg-rose-400/30 animate-pulse pointer-events-none"></span>

                <!-- Crisp SVG Microphone Vector Icon -->
                <svg class="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V4.5a3 3 0 00-6 0V12a3 3 0 003 3z" />
                </svg>
              </button>

              <!-- Text Input -->
              <input type="text"
                     [(ngModel)]="userMessage"
                     (keyup.enter)="send(userMessage)"
                     [disabled]="isProcessing || isSpeaking"
                     [placeholder]="getInputPlaceholder()"
                     class="flex-1 px-4 py-3 rounded-2xl border text-sm sm:text-base outline-none transition-all font-sans"
                     [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-800 text-white focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20' : 'bg-white border-neutral-300 text-neutral-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-xs'" />

              <!-- Send Button -->
              <button (click)="send(userMessage)"
                      [disabled]="isProcessing || isSpeaking || !userMessage.trim()"
                      class="px-5 sm:px-6 py-3 rounded-2xl font-headline font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                      [ngClass]="isDark ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'bg-neutral-900 text-white hover:bg-neutral-800'">
                <span>{{ isProcessing ? '...' : (currentMode === 'escucha' ? 'Evaluate' : 'Send') }}</span>
                <svg *ngIf="!isProcessing" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>

            </div>

            <!-- Voice Recording Live Audio Visualizer Banner -->
            <div *ngIf="isVoiceRecording" 
                 class="mt-2.5 px-4 py-2.5 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-fadeIn"
                 [ngClass]="isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'">
              
              <div class="flex items-center gap-3">
                <span class="relative flex h-3 w-3 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span class="text-xs font-headline font-bold uppercase tracking-wider">Listening to microphone...</span>
                  <span class="text-[11px] opacity-80 font-sans hidden sm:inline">{{ currentMode === 'escucha' ? 'Repeat target sentence now' : 'Speak clearly in English' }}</span>
                </div>
              </div>

              <!-- Dynamic 5-Bar Equalizer Animation -->
              <div class="flex items-center gap-1 h-4 shrink-0">
                <span class="w-1 bg-rose-500 rounded-full animate-mic-bar" style="animation-delay: 0.05s"></span>
                <span class="w-1 bg-rose-500 rounded-full animate-mic-bar" style="animation-delay: 0.25s"></span>
                <span class="w-1 bg-rose-500 rounded-full animate-mic-bar" style="animation-delay: 0.12s"></span>
                <span class="w-1 bg-rose-500 rounded-full animate-mic-bar" style="animation-delay: 0.35s"></span>
                <span class="w-1 bg-rose-500 rounded-full animate-mic-bar" style="animation-delay: 0.18s"></span>
              </div>

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

    .rotbot-eye-svg-box.crescent {
      animation: aliveCrescentBlink 4.2s infinite ease-in-out;
    }

    .rotbot-eye-svg-box.neutral {
      animation: aliveNeutralBlink 3.8s infinite ease-in-out;
    }

    .rotbot-eye-svg-box.thinking {
      animation: thinkPulse 1.2s infinite alternate ease-in-out;
    }

    .rotbot-eye-svg-box.surprised {
      animation: aliveSurprise 4.5s infinite ease-in-out;
    }

    .rotbot-eye-svg-box.talking {
      animation: talkingBounce 0.24s infinite alternate ease-in-out !important;
    }

    @keyframes aliveCrescentBlink {
      0%, 82%, 100% { transform: translate(0, 0) scaleY(1); }
      25% { transform: translate(-2px, -1px) scaleY(1); }
      50% { transform: translate(2px, -1px) scaleY(1); }
      88% { transform: translate(0, 0) scaleY(0.08); }
      92% { transform: translate(0, 0) scaleY(1); }
      95% { transform: translate(0, 0) scaleY(0.08); }
    }

    @keyframes aliveNeutralBlink {
      0%, 80%, 100% { transform: translate(0, 0) scaleY(1); }
      30% { transform: translate(-3px, 0) scaleY(1); }
      60% { transform: translate(3px, 0) scaleY(1); }
      88% { transform: translate(0, 0) scaleY(0.06); }
      92% { transform: translate(0, 0) scaleY(1); }
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

    @keyframes micBar {
      0%, 100% { height: 4px; }
      50% { height: 16px; }
    }

    .animate-mic-bar {
      animation: micBar 0.4s ease-in-out infinite alternate;
    }
  `]
})
export class DashRotbotComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() theme = 'dark';
  @Input() currentMode: RotbotMode = 'charla';
  @Output() currentModeChange = new EventEmitter<RotbotMode>();
  @Input() isMuted = false;
  @Output() isMutedChange = new EventEmitter<boolean>();
  @Input() isStudyPlanActive = false;
  @Output() isStudyPlanActiveChange = new EventEmitter<boolean>();

  private robotService = inject(RobotChatService);
  private audioRecorder = inject(AudioRecorderService);
  private commandCenter = inject(CommandCenterService);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  currentEmotion: string = 'happy';
  isSpeaking = false;
  isProcessing = false;
  isVoiceRecording = false;

  currentPhrase: string = '';
  lastScore: number | null = null;
  lastAudio: string | null = null;
  lastPhraseAudio: string | null = null;

  studyPlanText = '';

  userMessage = '';
  selectedVoiceId = 'bIHbv24MWmeRgasZH58o';

  chatHistory: ChatEntry[] = [
    {
      id: 'welcome',
      sender: 'rotbot',
      text: 'Hey! Ready to practice English? Talk to me about anything — we can chat, learn grammar, or practice pronunciation.',
      emotion: 'happy',
      time: 'Just now'
    }
  ];

  private currentAudio: HTMLAudioElement | null = null;
  private voiceSub!: Subscription;
  private recognition: any = null;
  private englishVoice: any = null;

  get isDark() { return this.theme === 'dark'; }

  ngOnInit() {
    this.initVoices();
    this.refreshActiveStudyPlan();
    const loaded = this.loadChatFromStorage(this.currentMode);
    if (!loaded) {
      this.initDefaultChat(this.currentMode);
    }
    this.voiceSub = this.audioRecorder.recordedAudio$.subscribe(rec => {
      this.handleVoiceTranscript(rec);
    });
    this.scrollToBottom(true);
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const findEng = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.englishVoice = voices.find(v => (v.lang === 'en-US' || v.lang.startsWith('en')) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Guy') || v.name.includes('English')))
                          || voices.find(v => v.lang === 'en-US')
                          || voices.find(v => v.lang.startsWith('en'))
                          || null;
      }
    };
    findEng();
    window.speechSynthesis.onvoiceschanged = () => findEng();
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  private saveChatToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const toSave = this.chatHistory.map(entry => ({
        id: entry.id,
        sender: entry.sender,
        text: entry.text,
        emotion: entry.emotion,
        phrase: entry.phrase,
        score: entry.score,
        time: entry.time
      }));
      localStorage.setItem(`rotbot_chat_${this.currentMode}`, JSON.stringify(toSave));
    } catch (e) {
      console.warn('[DashRotbot] Error saving chat to localStorage:', e);
    }
  }

  private loadChatFromStorage(mode: RotbotMode): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(`rotbot_chat_${mode}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.chatHistory = parsed;
          return true;
        }
      }
    } catch (e) {
      console.warn('[DashRotbot] Error loading chat from localStorage:', e);
    }
    return false;
  }

  private initDefaultChat(mode: RotbotMode) {
    if (mode === 'charla') {
      this.chatHistory = [
        {
          id: 'welcome_' + Date.now(),
          sender: 'rotbot',
          text: "Welcome to English Chat mode! I'll talk with you like a native friend. What's on your mind today?",
          emotion: 'happy',
          time: 'Just now'
        }
      ];
    } else if (mode === 'ensenanza') {
      this.chatHistory = [
        {
          id: 'welcome_' + Date.now(),
          sender: 'rotbot',
          text: 'Welcome to Grammar & Lesson mode! Ask me about grammar rules, vocabulary distinctions, verb tenses, idioms, or sentence structures.',
          emotion: 'happy',
          time: 'Just now'
        }
      ];
    } else if (mode === 'escucha') {
      this.chatHistory = [
        {
          id: 'welcome_' + Date.now(),
          sender: 'rotbot',
          text: 'Welcome to Listening & Pronunciation mode! I will give you practical English sentences to listen to and repeat via microphone. Let’s practice!',
          emotion: 'happy',
          time: 'Just now'
        }
      ];
      this.requestNewListeningPhrase();
    }
    this.saveChatToStorage();
  }

  refreshActiveStudyPlan() {
    this.robotService.fetchActiveMaterial().subscribe({
      next: (res: any) => {
        const mat = res?.data || res;
        if (mat && mat.content) {
          this.robotService.setCachedActive(mat);
          this.studyPlanText = mat.content;
          this.isStudyPlanActive = true;
        } else {
          this.robotService.setCachedActive(null);
          this.studyPlanText = '';
          this.isStudyPlanActive = false;
        }
        this.isStudyPlanActiveChange.emit(this.isStudyPlanActive);
      },
      error: () => {
        const plan = this.robotService.getStudyPlan();
        this.studyPlanText = plan.text;
        this.isStudyPlanActive = plan.active && plan.text.trim().length > 0;
        this.isStudyPlanActiveChange.emit(this.isStudyPlanActive);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentMode'] && !changes['currentMode'].firstChange) {
      this.switchMode(this.currentMode, false);
    }
  }

  ngOnDestroy() {
    this.stopAudio();
    if (this.recognition) {
      try { this.recognition.abort(); } catch {}
    }
    if (this.voiceSub) this.voiceSub.unsubscribe();
  }

  getStudyPlanPreview(): string {
    if (!this.studyPlanText) return '';
    const firstLine = this.studyPlanText.trim().split('\n')[0].replace(/^#+\s*/, '');
    return firstLine.length > 45 ? firstLine.substring(0, 42) + '...' : firstLine;
  }

  switchMode(mode: RotbotMode, emit = true) {
    this.refreshActiveStudyPlan();

    if (this.currentMode === mode && !emit && this.chatHistory.length > 1) return;
    this.currentMode = mode;
    if (emit) {
      this.currentModeChange.emit(mode);
    }
    this.stopAudio();
    this.currentPhrase = '';
    this.lastScore = null;
    this.lastAudio = null;
    this.lastPhraseAudio = null;

    const loaded = this.loadChatFromStorage(mode);
    if (!loaded) {
      this.initDefaultChat(mode);
    }
    setTimeout(() => this.scrollToBottom(), 50);
  }

  clearChat() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(`rotbot_chat_${this.currentMode}`);
      } catch {}
    }
    this.initDefaultChat(this.currentMode);
  }

  getInputPlaceholder(): string {
    if (this.currentMode === 'charla') return 'Write or speak to Rotbot in English...';
    if (this.currentMode === 'ensenanza') return 'Ask Rotbot (e.g., When should I use "make" vs "do"?)...';
    return this.currentPhrase ? 'Repeat the phrase via microphone or type it...' : 'Request a practice sentence...';
  }

  requestNewListeningPhrase() {
    this.isProcessing = true;
    this.currentEmotion = 'thinking';

    const activePlan = (this.isStudyPlanActive && this.studyPlanText.trim()) ? this.studyPlanText.trim() : undefined;

    this.robotService.sendMessage('Give me a new practice phrase', this.selectedVoiceId, [], 'escucha', undefined, activePlan).subscribe({
      next: (res: RobotChatResponse) => {
        this.isProcessing = false;
        this.currentEmotion = res.emotion || 'happy';
        this.currentPhrase = res.phrase || 'Practice makes perfect.';
        this.lastScore = null;
        this.lastAudio = res.audio || null;
        this.lastPhraseAudio = res.phrase_audio || null;

        this.chatHistory.push({
          id: 'bot_' + Date.now(),
          sender: 'rotbot',
          text: res.reply,
          phrase: res.phrase,
          phrase_audio: res.phrase_audio,
          emotion: res.emotion,
          audio: res.audio,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
        this.saveChatToStorage();
        this.scrollToBottom();

        // Rotbot habla en voz alta su mensaje de instrucción/bienvenida automáticamente
        if (res.audio && !this.isMuted) {
          this.reproduceAudio(res.audio);
        } else if (!this.isMuted && (res.phrase || res.reply)) {
          this.pronouncePhrase(res.phrase || res.reply);
        }
      },
      error: () => {
        this.isProcessing = false;
        this.currentEmotion = 'neutral';
      }
    });
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
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    this.saveChatToStorage();
    this.scrollToBottom();

    // Construir historial reciente para memoria conversacional
    const history = this.chatHistory.slice(-8).map(entry => ({
      role: entry.sender === 'user' ? 'user' : 'model',
      content: entry.text
    }));

    const phraseToEvaluate = (this.currentMode === 'escucha' && this.currentPhrase) ? this.currentPhrase : undefined;
    const activePlan = (this.isStudyPlanActive && this.studyPlanText.trim()) ? this.studyPlanText.trim() : undefined;

    this.robotService.sendMessage(text, this.selectedVoiceId, history, this.currentMode, phraseToEvaluate, activePlan).subscribe({
      next: (res: RobotChatResponse) => {
        this.isProcessing = false;
        this.currentEmotion = res.emotion || 'happy';
        if (res.phrase) {
          this.currentPhrase = res.phrase;
        }
        if (res.score !== null && res.score !== undefined) {
          this.lastScore = res.score;
        }
        if (res.audio) {
          this.lastAudio = res.audio;
        }
        if (res.phrase_audio) {
          this.lastPhraseAudio = res.phrase_audio;
        }

        // Guardar mensaje de Rotbot
        this.chatHistory.push({
          id: 'bot_' + Date.now(),
          sender: 'rotbot',
          text: res.reply,
          phrase: res.phrase,
          phrase_audio: res.phrase_audio,
          score: res.score,
          emotion: res.emotion,
          audio: res.audio,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
        this.saveChatToStorage();
        this.scrollToBottom();

        // Reproducir voz si viene audio y no está silenciado
        if (res.audio && !this.isMuted) {
          this.reproduceAudio(res.audio);
        } else if (!this.isMuted && res.reply) {
          this.pronouncePhrase(res.reply);
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

  private getEnglishVoice(): any {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Filtrar todas las voces en inglés (en-US, en-GB, en-AU, en_US, etc.)
    const englishVoices = voices.filter(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      return lang.startsWith('en');
    });

    if (englishVoices.length > 0) {
      // Prioridad 1: Voces Naturales / Google US / Edge Natural / David / Zira / Jenny / Guy
      const topVoice = englishVoices.find(v => 
        v.name.includes('Natural') || 
        v.name.includes('Google US') || 
        v.name.includes('Google UK') || 
        v.name.includes('Online') ||
        v.name.includes('Jenny') || 
        v.name.includes('Guy') || 
        v.name.includes('Aria') ||
        v.name.includes('David') || 
        v.name.includes('Zira') || 
        v.name.includes('Mark') ||
        v.name.includes('George')
      );
      if (topVoice) return topVoice;

      // Prioridad 2: Cualquier voz con locale en-US
      const usVoice = englishVoices.find(v => (v.lang || '').toLowerCase().replace('_', '-').includes('en-us'));
      if (usVoice) return usVoice;

      return englishVoices[0];
    }

    // 2. Búsqueda por nombre de voz si el idioma no fue reportado con código 'en'
    const byName = voices.find(v => 
      v.name.toLowerCase().includes('english') || 
      v.name.toLowerCase().includes('united states') || 
      v.name.toLowerCase().includes('united kingdom')
    );
    if (byName) return byName;

    // 3. Fallback a la primera voz que NO sea español para evitar pronunciación errónea
    const nonSpanish = voices.find(v => !(v.lang || '').toLowerCase().startsWith('es'));
    if (nonSpanish) return nonSpanish;

    return null;
  }

  private cleanSpeechText(text: string): string {
    if (!text) return '';
    return text
      .replace(/(\*\[.*?\]\*|\[.*?\]|\(.*?\))/g, '')
      .replace(/[*#`_~>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Pronuncia EXCLUSIVAMENTE la frase en inglés seleccionada.
   * Utiliza el audio sintetizado de ElevenLabs o el motor de síntesis de voz nativo en inglés.
   */
  pronouncePhrase(phrase?: string | null, phraseAudio?: string | null) {
    this.stopAudio();

    if (phraseAudio) {
      this.reproduceAudio(phraseAudio);
      return;
    }

    const rawText = (phrase || this.currentPhrase || '').trim();
    if (!rawText) return;
    const textToSpeak = this.cleanSpeechText(rawText);
    if (!textToSpeak) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const doSpeak = () => {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 0.92;
          utterance.pitch = 1.0;

          const voice = this.getEnglishVoice();
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang || 'en-US';
          } else {
            utterance.lang = 'en-US';
          }

          this.isSpeaking = true;
          this.currentEmotion = 'talking';

          utterance.onend = () => {
            this.isSpeaking = false;
            this.currentEmotion = 'happy';
          };

          utterance.onerror = () => {
            this.isSpeaking = false;
            this.currentEmotion = 'happy';
          };

          window.speechSynthesis.speak(utterance);
        };

        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            doSpeak();
          };
        } else {
          doSpeak();
        }
      } catch {
        this.isSpeaking = false;
        this.currentEmotion = 'happy';
      }
    }
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
      this.isVoiceRecording = false;
      this.audioRecorder.stopRecording();
      return;
    }

    this.userMessage = '';
    this.isVoiceRecording = true;
    this.audioRecorder.startRecording();
  }

  private handleVoiceTranscript(audio: RecordedAudio) {
    this.isVoiceRecording = false;
    this.isProcessing = true;
    this.currentEmotion = 'thinking';

    // Transcribir audio con el backend y colocar el texto en el input
    this.robotService.transcribeAudio(audio.base64, audio.mimeType).subscribe({
      next: (res) => {
        if (res && res.transcript && res.transcript.trim()) {
          // 1. Colocar lo interpretado dentro de la caja de texto (input)
          this.userMessage = res.transcript.trim();
          this.isProcessing = false;
          this.currentEmotion = 'happy';

          // 2. Despachar el mensaje a Rotbot
          setTimeout(() => {
            if (this.userMessage.trim()) {
              this.send(this.userMessage);
            }
          }, 450);
        } else {
          this.isProcessing = false;
          this.currentEmotion = 'happy';
        }
      },
      error: (err) => {
        console.warn('[DashRotbot] Transcribe error:', err);
        this.isProcessing = false;
        this.currentEmotion = 'neutral';
      }
    });
  }

  private scrollToBottom(instant = false) {
    const doScroll = () => {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        const el = this.chatContainer.nativeElement;
        if (instant) {
          el.scrollTop = el.scrollHeight;
        } else {
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    };

    doScroll();
    setTimeout(doScroll, 40);
    setTimeout(doScroll, 150);
    setTimeout(doScroll, 350);
  }
}
