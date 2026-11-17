import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  QuizData,
  QuizQuestion,
  isQuizComplete,
  quizAnsweredCount,
  quizScore,
  resetQuizAnswers
} from '../quiz.utils';

type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

/**
 * Bloque visual de Cuestionario para la pizarra de apuntes.
 * Muta el objeto `quiz` recibido (propiedad del bloque) y avisa con `changed`
 * para que el padre persista el apunte (syncBlocksToContent).
 */
@Component({
  selector: 'app-quiz-block',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="my-2 rounded-2xl border overflow-hidden w-full max-w-full text-left select-none"
       [ngClass]="isDark
         ? 'bg-[#121215] border-[#222226] text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
         : 'bg-white border-neutral-300 text-neutral-900 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]'">

    <!-- Línea superior roja -->
    <div class="h-[3px] w-full bg-red-600"></div>

    <!-- Cabecera -->
    <div class="px-4 sm:px-5 pt-4 pb-3 flex items-start gap-3">
      <div class="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0"
           [ngClass]="isDark ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-red-50 border-red-200 text-red-600'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                [ngClass]="isDark ? 'bg-[#0e0e12] border-red-500/30 text-neutral-300' : 'bg-red-50/70 border-red-200 text-neutral-700'">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Cuestionario
          </span>
          <span class="text-[11px] font-mono font-semibold" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
            {{ answered }} / {{ total }} respondidas
          </span>
        </div>
        <h3 class="mt-1.5 m-0 font-headline font-extrabold tracking-tight text-lg sm:text-xl leading-snug"
            [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">{{ quiz.title }}</h3>
        <p *ngIf="quiz.topic" class="m-0 mt-0.5 text-xs" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">{{ quiz.topic }}</p>
      </div>
    </div>

    <!-- Barra de progreso -->
    <div class="mx-4 sm:mx-5 mb-1 h-1 rounded-full overflow-hidden" [ngClass]="isDark ? 'bg-[#222226]' : 'bg-neutral-200'">
      <div class="h-full rounded-full bg-red-600 transition-all duration-500 ease-out" [style.width.%]="progress"></div>
    </div>

    <!-- Preguntas -->
    <div *ngFor="let q of quiz.questions; let qi = index; trackBy: trackQuestion"
         class="px-4 sm:px-5 py-4 border-t"
         [ngClass]="isDark ? 'border-[#222226]' : 'border-neutral-200'">

      <div class="flex items-start gap-3">
        <span class="font-mono text-[11px] font-bold pt-1 shrink-0 tabular-nums"
              [ngClass]="q.selectedIndex === null ? 'text-red-500' : (isDark ? 'text-neutral-500' : 'text-neutral-400')">
          {{ pad(qi + 1) }}
        </span>
        <p class="m-0 font-headline font-bold text-[15px] sm:text-base leading-snug"
           [ngClass]="isDark ? 'text-neutral-100' : 'text-neutral-900'"
           [innerHTML]="fmt(q.question)"></p>
      </div>

      <div class="mt-3 space-y-2 sm:pl-7">
        <button *ngFor="let opt of q.options; let oi = index" type="button"
                (click)="select(q, oi)"
                [disabled]="q.selectedIndex !== null"
                class="w-full flex items-center gap-3 text-left px-3 sm:px-3.5 py-2.5 rounded-xl border transition-all duration-200 active:scale-[0.995]"
                [ngClass]="optionClasses(q, oi)">
          <span class="w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-mono font-bold transition-colors"
                [ngClass]="letterClasses(q, oi)">
            <ng-container [ngSwitch]="optionState(q, oi)">
              <svg *ngSwitchCase="'correct'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <svg *ngSwitchCase="'reveal'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <svg *ngSwitchCase="'wrong'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <ng-container *ngSwitchDefault>{{ letter(oi) }}</ng-container>
            </ng-container>
          </span>
          <span class="flex-1 min-w-0 text-[13.5px] sm:text-sm leading-snug font-medium break-words [overflow-wrap:anywhere]"
                [innerHTML]="fmt(opt)"></span>
          <span *ngIf="optionState(q, oi) === 'reveal'"
                class="shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">Correcta</span>
        </button>
      </div>

      <!-- Feedback inmediato -->
      <div *ngIf="q.selectedIndex !== null"
           class="mt-3 sm:ml-7 rounded-xl border-l-2 px-3.5 py-2.5 animate-fade-in"
           [ngClass]="isCorrect(q)
             ? (isDark ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200' : 'bg-emerald-50 border-emerald-500 text-emerald-900')
             : (isDark ? 'bg-red-500/10 border-red-500 text-red-200' : 'bg-red-50 border-red-500 text-red-900')">
        <p class="m-0 text-[13px] font-headline font-bold">
          <ng-container *ngIf="isCorrect(q)">Correcto</ng-container>
          <ng-container *ngIf="!isCorrect(q)">Incorrecto. La respuesta correcta es la {{ letter(q.correctIndex) }}.</ng-container>
        </p>
        <p *ngIf="q.explanation" class="m-0 mt-1 text-[12.5px] leading-relaxed opacity-90" [innerHTML]="fmt(q.explanation)"></p>
      </div>
    </div>

    <!-- Resultado final -->
    <div *ngIf="complete"
         class="px-4 sm:px-5 py-5 border-t flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in"
         [ngClass]="isDark ? 'border-[#222226] bg-[#0e0e12]' : 'border-neutral-200 bg-neutral-50'">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="w-16 h-16 rounded-2xl border flex flex-col items-center justify-center shrink-0"
             [ngClass]="isDark ? 'bg-[#121215] border-red-500/30' : 'bg-white border-red-200'">
          <span class="font-headline font-black text-2xl leading-none tabular-nums" [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">{{ score }}</span>
          <span class="mt-0.5 text-[10px] font-mono font-bold text-red-500">de {{ total }}</span>
        </div>
        <div class="min-w-0">
          <p class="m-0 font-headline font-extrabold text-base" [ngClass]="isDark ? 'text-white' : 'text-neutral-950'">{{ resultTitle }}</p>
          <p class="m-0 mt-0.5 text-xs leading-relaxed" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-600'">{{ resultHint }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button type="button" (click)="reset()"
                class="px-3.5 py-2 rounded-xl border text-xs font-headline font-bold transition-all cursor-pointer active:scale-95"
                [ngClass]="isDark ? 'border-[#2c2c36] bg-[#121215] text-neutral-200 hover:border-red-500/50 hover:text-white' : 'border-neutral-300 bg-white text-neutral-800 hover:border-red-400'">
          Reintentar
        </button>
        <button type="button" (click)="regenerate.emit()"
                class="px-3.5 py-2 rounded-xl border border-red-600 bg-red-600 hover:bg-red-500 text-xs font-headline font-bold shadow-sm shadow-red-600/30 transition-all cursor-pointer active:scale-95"
                style="color: #ffffff !important;">
          <span style="color: #ffffff !important;">Generar otro</span>
        </button>
      </div>
    </div>
  </div>
  `
})
export class QuizBlockComponent {
  private sanitizer = inject(DomSanitizer);

  @Input({ required: true }) quiz!: QuizData;
  @Input() isDark = true;

  /** Se emite tras cada cambio (responder / reintentar) para que el padre persista el apunte. */
  @Output() changed = new EventEmitter<void>();
  /** El usuario pidió un cuestionario nuevo. */
  @Output() regenerate = new EventEmitter<void>();

  private readonly letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  private htmlCache = new Map<string, SafeHtml>();

  get total(): number { return this.quiz?.questions.length || 0; }
  get answered(): number { return quizAnsweredCount(this.quiz); }
  get score(): number { return quizScore(this.quiz); }
  get complete(): boolean { return isQuizComplete(this.quiz); }
  get progress(): number { return this.total ? (this.answered / this.total) * 100 : 0; }

  get resultTitle(): string {
    const ratio = this.total ? this.score / this.total : 0;
    if (ratio === 1) return 'Perfecto, dominas el tema';
    if (ratio >= 0.8) return 'Muy bien';
    if (ratio >= 0.6) return 'Vas por buen camino';
    return 'Conviene repasar el tema';
  }

  get resultHint(): string {
    const ratio = this.total ? this.score / this.total : 0;
    if (ratio === 1) return 'Respondiste todo correctamente. Puedes pedir otro cuestionario más difícil.';
    if (ratio >= 0.6) return 'Revisa las explicaciones de las preguntas falladas y vuelve a intentarlo.';
    return 'Repasa el apunte, lee las explicaciones de cada pregunta y reintenta.';
  }

  trackQuestion = (_: number, q: QuizQuestion) => q.id;
  pad(n: number): string { return n < 10 ? '0' + n : String(n); }
  letter(i: number): string { return this.letters[i] || String(i + 1); }
  isCorrect(q: QuizQuestion): boolean { return q.selectedIndex !== null && q.selectedIndex === q.correctIndex; }

  select(q: QuizQuestion, optionIndex: number): void {
    if (q.selectedIndex !== null) return; // una sola vez por pregunta
    q.selectedIndex = optionIndex;
    this.changed.emit();
  }

  reset(): void {
    resetQuizAnswers(this.quiz);
    this.changed.emit();
  }

  optionState(q: QuizQuestion, oi: number): OptionState {
    if (q.selectedIndex === null) return 'idle';
    if (oi === q.selectedIndex) return oi === q.correctIndex ? 'correct' : 'wrong';
    if (oi === q.correctIndex) return 'reveal';
    return 'dim';
  }

  optionClasses(q: QuizQuestion, oi: number): string {
    const dark = this.isDark;
    switch (this.optionState(q, oi)) {
      case 'correct':
        return dark ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-100' : 'bg-emerald-50 border-emerald-500 text-emerald-900';
      case 'wrong':
        return dark ? 'bg-red-500/10 border-red-500/60 text-red-100' : 'bg-red-50 border-red-500 text-red-900';
      case 'reveal':
        return dark ? 'bg-emerald-500/[0.06] border-emerald-500/40 text-emerald-100' : 'bg-emerald-50/60 border-emerald-400 text-emerald-900';
      case 'dim':
        return dark ? 'bg-[#0e0e12] border-[#1c1c22] text-neutral-500 opacity-60 cursor-default' : 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60 cursor-default';
      default:
        return dark
          ? 'bg-[#0e0e12] border-[#262630] text-neutral-200 hover:border-red-500/50 hover:bg-[#15151a] cursor-pointer'
          : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:border-red-400 hover:bg-white cursor-pointer';
    }
  }

  letterClasses(q: QuizQuestion, oi: number): string {
    const dark = this.isDark;
    switch (this.optionState(q, oi)) {
      case 'correct':
      case 'reveal':
        return 'bg-emerald-500 border-emerald-500 text-white';
      case 'wrong':
        return 'bg-red-500 border-red-500 text-white';
      case 'dim':
        return dark ? 'bg-transparent border-[#2c2c36] text-neutral-600' : 'bg-transparent border-neutral-300 text-neutral-400';
      default:
        return dark ? 'bg-[#16161b] border-[#2c2c36] text-neutral-300' : 'bg-white border-neutral-300 text-neutral-700';
    }
  }

  /** Escapa HTML y convierte `código` y **negrita** a etiquetas seguras (con caché para no reasignar innerHTML). */
  fmt(text: string): SafeHtml {
    const key = (this.isDark ? 'd:' : 'l:') + text;
    const cached = this.htmlCache.get(key);
    if (cached) return cached;
    if (this.htmlCache.size > 300) this.htmlCache.clear();

    const codeClass = this.isDark
      ? 'bg-neutral-800 text-red-400 border border-neutral-700/70'
      : 'bg-neutral-200/90 text-red-600 border border-neutral-300/80';

    const escaped = (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const html = escaped
      .replace(/`([^`\n]+)`/g, (_m, c) => `<code class="px-1.5 py-0.5 rounded-md text-[12.5px] font-mono font-medium ${codeClass}">${c}</code>`)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-bold">$1</strong>');

    const safe = this.sanitizer.bypassSecurityTrustHtml(html);
    this.htmlCache.set(key, safe);
    return safe;
  }
}
