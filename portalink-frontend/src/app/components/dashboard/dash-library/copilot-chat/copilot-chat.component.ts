import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { LibraryAiService } from '../../../../services/library-ai.service';
import { CopilotMarkdownService } from '../../../../services/copilot-markdown.service';
import { NotebookPage } from '../../../../services/library.service';
import { NoteBlock } from '../dash-library.component';

@Component({
  selector: 'app-copilot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './copilot-chat.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class CopilotChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() theme: string = 'dark';
  @Input() isDark: boolean = true;
  @Input() selectedPage: NotebookPage | null = null;
  @Input() blocks: NoteBlock[] = [];
  @Input() isMobileScreen: boolean = false;

  @Output() closeChat = new EventEmitter<void>();
  @Output() toast = new EventEmitter<{ message: string; type: 'success' | 'error' }>();

  private libraryAiService = inject(LibraryAiService);
  private markdownService = inject(CopilotMarkdownService);

  @ViewChild('copilotMessagesContainer') copilotMessagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('copilotTextarea') copilotTextareaElement?: ElementRef<HTMLTextAreaElement>;

  // Floating Copilot State
  isCopilotLoading = false;
  isResettingCopilot = false;
  showCopilotResetOverlay = false;
  copilotOverlayOpacity = '1';
  copilotInput = '';
  copilotMessages: { role: 'user' | 'assistant'; content: string }[] = [
    {
      role: 'assistant',
      content: '¡Hola! Soy **RotBot**, tu copiloto de notas de PortaLink. Puedo ayudarte a resumir el apunte actual, extraer conceptos clave, generar cuestionarios de estudio o responder dudas. ¿Qué deseas explorar hoy?'
    }
  ];

  // Drag & Resize State
  copilotWidth = 400;
  copilotHeight = 575;
  isCopilotFullscreen = false;
  isDraggingCopilot = false;
  isResizingCopilot = false;
  showCopilotSizeMenu = false;
  copilotResizeDir: 'width' | 'height' | 'both' = 'width';
  copilotPos = { x: 0, y: 0 };
  isCopilotCustomPositioned = false;

  private dragStartOffset = { x: 0, y: 0 };
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 400;
  private resizeStartHeight = 575;
  private resizeStartPosY = 0;
  private resizeRafId: number | null = null;

  // Presets recomendados para asistencia magnética
  readonly copilotWidthPresets = [
    { label: 'Compacto', width: 400, desc: '400px' },
    { label: 'Equilibrado', width: 540, desc: '540px' },
    { label: 'Amplio', width: 680, desc: '680px' },
    { label: 'Panorámico', width: 860, desc: '860px' }
  ];

  get copilotMaxHeight(): number {
    return Math.max(500, Math.min(window.innerHeight - 70, 880));
  }

  get copilotHeightPresets() {
    return [
      { label: 'Compacto', height: 440, desc: '440px' },
      { label: 'Estándar', height: 575, desc: '575px' },
      { label: 'Alto', height: 720, desc: '720px' },
      { label: 'Máximo', height: this.copilotMaxHeight, desc: `${this.copilotMaxHeight}px` }
    ];
  }

  copilotResizeInfo = {
    isSnappedWidth: false,
    isSnappedHeight: false,
    activeSnapWidth: null as number | null,
    activeSnapHeight: null as number | null
  };

  get isCopilotSnapped(): boolean {
    return this.copilotResizeInfo.isSnappedWidth || this.copilotResizeInfo.isSnappedHeight;
  }

  get copilotCurrentSizeLabel(): string {
    const matchedW = this.copilotWidthPresets.find(p => Math.abs(p.width - this.copilotWidth) <= 14);
    const matchedH = this.copilotHeightPresets.find(p => Math.abs(p.height - this.copilotHeight) <= 14);

    if (matchedW && matchedH) {
      return `${matchedW.label} • ${matchedH.label}`;
    }
    if (matchedW) {
      return `Ancho ${matchedW.label}`;
    }
    if (matchedH) {
      return `Alto ${matchedH.label}`;
    }
    return 'Libre';
  }

  ngOnInit() {
    this.loadChatFromStorage();
    try {
      const savedWidth = localStorage.getItem('portalink_copilot_width');
      if (savedWidth) {
        const parsedW = parseInt(savedWidth, 10);
        if (!isNaN(parsedW) && parsedW >= 360 && parsedW <= 1200) {
          this.copilotWidth = parsedW;
        }
      }
      const savedHeight = localStorage.getItem('portalink_copilot_height');
      if (savedHeight) {
        const parsedH = parseInt(savedHeight, 10);
        if (!isNaN(parsedH) && parsedH >= 340 && parsedH <= 1100) {
          this.copilotHeight = parsedH;
        }
      }
    } catch {}
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    this.focusInput();
  }

  ngOnDestroy() {
    if (this.resizeRafId) {
      cancelAnimationFrame(this.resizeRafId);
    }
    document.body.classList.remove('is-chat-dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapeKey(event?: KeyboardEvent) {
    if (this.showCopilotSizeMenu) {
      this.showCopilotSizeMenu = false;
      return;
    }
    if (this.isCopilotFullscreen) {
      this.toggleCopilotFullscreen();
      return;
    }
    this.closeChat.emit();
  }

  loadChatFromStorage() {
    try {
      const saved = localStorage.getItem('portalink_copilot_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.copilotMessages = parsed;
        }
      }
    } catch (e) {
      console.error('Error cargando chat copilot de localStorage:', e);
    }
  }

  saveChatToStorage() {
    try {
      localStorage.setItem('portalink_copilot_chat', JSON.stringify(this.copilotMessages));
    } catch (e) {
      console.error('Error guardando chat copilot en localStorage:', e);
    }
  }

  formatCopilotMessage(content: string): SafeHtml {
    return this.markdownService.format(content, this.isDark);
  }

  resetCopilotWithEffect() {
    if (this.isResettingCopilot) return;
    this.isResettingCopilot = true;
    this.showCopilotResetOverlay = true;
    this.copilotOverlayOpacity = '1';

    setTimeout(() => {
      this.copilotMessages = [
        {
          role: 'assistant',
          content: '¡Hola! Soy **RotBot**. ¿En qué puedo ayudarte a resumir, explicar o estructurar tus notas de estudio hoy?'
        }
      ];
      this.saveChatToStorage();
      this.scrollToBottom();
    }, 300);

    setTimeout(() => {
      this.copilotOverlayOpacity = '0';
      setTimeout(() => {
        this.showCopilotResetOverlay = false;
        this.isResettingCopilot = false;
      }, 500);
    }, 1600);
  }

  handleCopilotContainerClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const copyBtn = target.closest('.copilot-copy-code-btn') as HTMLElement;
    if (copyBtn) {
      event.preventDefault();
      event.stopPropagation();
      const codeToCopy = copyBtn.getAttribute('data-code');
      if (codeToCopy) {
        const decoded = decodeURIComponent(codeToCopy);
        navigator.clipboard.writeText(decoded).then(() => {
          const originalContent = copyBtn.innerHTML;
          copyBtn.innerHTML = `
            <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            <span class="text-emerald-400 font-medium">¡Copiado!</span>
          `;
          copyBtn.classList.add('bg-emerald-500/20');
          setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.remove('bg-emerald-500/20');
          }, 2000);
        }).catch(() => {
          this.toast.emit({ message: 'No se pudo copiar el código al portapapeles', type: 'error' });
        });
      }
    }
  }

  focusInput() {
    setTimeout(() => {
      if (this.copilotTextareaElement?.nativeElement) {
        this.copilotTextareaElement.nativeElement.focus();
      }
    }, 50);
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.copilotMessagesContainer?.nativeElement) {
        const el = this.copilotMessagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 80);
  }

  adjustCopilotTextareaHeight(event?: Event) {
    const el = this.copilotTextareaElement?.nativeElement || (event?.target as HTMLTextAreaElement);
    if (el) {
      el.style.height = 'auto';
      const newHeight = Math.min(Math.max(el.scrollHeight, 24), 140);
      el.style.height = `${newHeight}px`;
    }
  }

  onCopilotKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendCopilotMessage();
    } else if (event.key === 'Enter' && event.shiftKey) {
      setTimeout(() => this.adjustCopilotTextareaHeight(), 0);
    }
  }

  sendCopilotMessage() {
    const text = this.copilotInput.trim();
    if (!text || this.isCopilotLoading) return;

    this.copilotMessages.push({ role: 'user', content: text });
    this.saveChatToStorage();
    this.copilotInput = '';
    if (this.copilotTextareaElement?.nativeElement) {
      this.copilotTextareaElement.nativeElement.style.height = 'auto';
    }
    this.focusInput();
    this.isCopilotLoading = true;
    this.scrollToBottom();

    const historyPayload = this.copilotMessages.slice(1, -1);

    let noteContentSnapshot = '';
    if (this.selectedPage) {
      noteContentSnapshot = this.blocks.map((b, idx) => {
        if (b.type === 'columnas') {
          const col1 = b.columns?.[0];
          const col2 = b.columns?.[1];
          return `[BLOQUE ${idx + 1}: 2 COLUMNAS PARALELAS (Proporción ${b.columnRatio || '50-50'})]\n` +
                 `  ◀ COLUMNA IZQUIERDA (Tipo: ${col1?.type || 'texto'}${col1?.language ? ', Lenguaje: ' + col1.language : ''}):\n` +
                 `${col1?.content || '(vacía)'}\n\n` +
                 `  ▶ COLUMNA DERECHA (Tipo: ${col2?.type || 'texto'}${col2?.language ? ', Lenguaje: ' + col2.language : ''}):\n` +
                 `${col2?.content || '(vacía)'}`;
        } else if (b.type === 'codigo') {
          return `[BLOQUE ${idx + 1}: CÓDIGO / TABLA (${b.language || 'sql'})]:\n${b.content || ''}`;
        } else if (b.type === 'alerta') {
          return `[BLOQUE ${idx + 1}: ALERTA / CONSEJO]:\n${b.content || ''}`;
        } else if (b.type === 'titulo') {
          return `[BLOQUE ${idx + 1}: TÍTULO]:\n# ${b.content || ''}`;
        } else if (b.type === 'subtitulo') {
          return `[BLOQUE ${idx + 1}: SUBTÍTULO]:\n### ${b.content || ''}`;
        } else {
          return `[BLOQUE ${idx + 1}: TEXTO]:\n${b.content || ''}`;
        }
      }).join('\n\n------------------------\n\n');
    }

    this.libraryAiService.askCopilot(text, this.selectedPage?.title, historyPayload, noteContentSnapshot).subscribe(res => {
      this.isCopilotLoading = false;
      if (res.success) {
        this.copilotMessages.push({ role: 'assistant', content: res.result });
      } else {
        const errorText = res.error || 'El servicio de IA ha alcanzado su límite temporal de consultas. Intenta de nuevo en unos momentos.';
        this.copilotMessages.push({ role: 'assistant', content: '⚠️ **Aviso de IA**: ' + errorText });
        this.toast.emit({ message: errorText, type: 'error' });
      }
      this.saveChatToStorage();
      this.scrollToBottom();
      this.focusInput();
    });
  }

  // ── Drag & Resize Handlers ────────────────────────────────
  private snapToPoints(value: number, points: number[], threshold: number = 20): { value: number; isSnapped: boolean; snapPoint: number | null } {
    for (const point of points) {
      const dist = Math.abs(value - point);
      if (dist <= 6) {
        return { value: point, isSnapped: true, snapPoint: point };
      }
      if (dist <= threshold) {
        const attraction = point + (value - point) * 0.45;
        return { value: Math.round(attraction), isSnapped: true, snapPoint: point };
      }
    }
    return { value, isSnapped: false, snapPoint: null };
  }

  toggleCopilotSizeMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showCopilotSizeMenu = !this.showCopilotSizeMenu;
  }

  applyCopilotPreset(width: number, height?: number) {
    this.copilotWidth = width;
    if (height) {
      this.copilotHeight = height;
      try { localStorage.setItem('portalink_copilot_height', String(height)); } catch {}
    }
    try { localStorage.setItem('portalink_copilot_width', String(width)); } catch {}
    this.showCopilotSizeMenu = false;
    this.scrollToBottom();
  }

  applyCopilotWidth(width: number) {
    this.copilotWidth = width;
    try { localStorage.setItem('portalink_copilot_width', String(width)); } catch {}
    this.scrollToBottom();
  }

  applyCopilotHeight(height: number) {
    this.copilotHeight = height;
    try { localStorage.setItem('portalink_copilot_height', String(height)); } catch {}
    this.scrollToBottom();
  }

  isCurrentWidth(w: number): boolean {
    return Math.abs(this.copilotWidth - w) <= 8;
  }

  isCurrentHeight(h: number): boolean {
    return Math.abs(this.copilotHeight - h) <= 8;
  }

  startResizeCopilot(event: MouseEvent | TouchEvent, dir: 'width' | 'height' | 'both' = 'width') {
    event.stopPropagation();
    event.preventDefault();
    this.isResizingCopilot = true;
    this.showCopilotSizeMenu = false;
    this.copilotResizeDir = dir;
    this.resizeStartX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.resizeStartY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.resizeStartWidth = this.copilotWidth;
    this.resizeStartHeight = this.copilotHeight;
    this.resizeStartPosY = this.copilotPos.y;
    this.copilotResizeInfo.isSnappedWidth = false;
    this.copilotResizeInfo.isSnappedHeight = false;
    document.body.classList.add('is-chat-dragging');
    if (dir === 'height') {
      document.body.style.cursor = 'ns-resize';
    } else if (dir === 'both') {
      document.body.style.cursor = 'nwse-resize';
    } else {
      document.body.style.cursor = 'ew-resize';
    }
    document.body.style.userSelect = 'none';
  }

  toggleCopilotWidthPreset() {
    if (this.copilotWidth < 480) {
      this.copilotWidth = 540;
    } else if (this.copilotWidth < 620) {
      this.copilotWidth = 680;
    } else if (this.copilotWidth < 800) {
      this.copilotWidth = 860;
    } else {
      this.copilotWidth = 400;
    }
    try {
      localStorage.setItem('portalink_copilot_width', String(this.copilotWidth));
    } catch {}
  }

  toggleCopilotHeightPreset() {
    if (this.copilotHeight < 510) {
      this.copilotHeight = 575;
    } else if (this.copilotHeight < 650) {
      this.copilotHeight = 720;
    } else if (this.copilotHeight < 800) {
      this.copilotHeight = this.copilotMaxHeight;
    } else {
      this.copilotHeight = 440;
    }
    try {
      localStorage.setItem('portalink_copilot_height', String(this.copilotHeight));
    } catch {}
  }

  toggleCopilotFullscreen() {
    this.isCopilotFullscreen = !this.isCopilotFullscreen;
    this.showCopilotSizeMenu = false;
    this.scrollToBottom();
  }

  startDragCopilot(event: MouseEvent | TouchEvent) {
    if (this.isMobileScreen || this.isCopilotFullscreen) return;
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    this.isDraggingCopilot = true;
    document.body.classList.add('is-chat-dragging');
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const chatEl = document.querySelector('.copilot-panel') as HTMLElement;
    if (chatEl) {
      const rect = chatEl.getBoundingClientRect();
      this.dragStartOffset = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
      if (!this.isCopilotCustomPositioned) {
        this.copilotPos = { x: rect.left, y: rect.top };
        this.isCopilotCustomPositioned = true;
      }
    }
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent) {
    if (this.isResizingCopilot) {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      if (this.resizeRafId) {
        cancelAnimationFrame(this.resizeRafId);
      }

      this.resizeRafId = requestAnimationFrame(() => {
        if (!this.isResizingCopilot) return;

        if (this.copilotResizeDir === 'width' || this.copilotResizeDir === 'both') {
          const deltaX = this.resizeStartX - clientX;
          const minW = 360;
          const maxW = Math.min(window.innerWidth - 30, 1100);
          const rawW = Math.max(minW, Math.min(this.resizeStartWidth + deltaX, maxW));
          
          const snap = this.snapToPoints(rawW, this.copilotWidthPresets.map(p => p.width), 20);
          this.copilotWidth = snap.value;
          this.copilotResizeInfo.isSnappedWidth = snap.isSnapped;
          this.copilotResizeInfo.activeSnapWidth = snap.snapPoint;
        }

        if (this.copilotResizeDir === 'height' || this.copilotResizeDir === 'both') {
          const deltaY = this.resizeStartY - clientY;
          const minH = 340;
          const maxH = Math.max(minH, window.innerHeight - 50);
          const rawH = Math.max(minH, Math.min(this.resizeStartHeight + deltaY, maxH));

          const snap = this.snapToPoints(rawH, this.copilotHeightPresets.map(p => p.height), 20);
          const newHeight = snap.value;
          this.copilotHeight = newHeight;
          this.copilotResizeInfo.isSnappedHeight = snap.isSnapped;
          this.copilotResizeInfo.activeSnapHeight = snap.snapPoint;

          if (this.isCopilotCustomPositioned) {
            const heightDiff = newHeight - this.resizeStartHeight;
            const newY = Math.max(12, this.resizeStartPosY - heightDiff);
            this.copilotPos.y = newY;
          }
        }
      });
      return;
    }

    if (!this.isDraggingCopilot) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const chatEl = document.querySelector('.copilot-panel') as HTMLElement;
    const chatWidth = chatEl ? chatEl.offsetWidth : this.copilotWidth;
    const chatHeight = chatEl ? chatEl.offsetHeight : this.copilotHeight;

    const margin = 12;
    const maxX = window.innerWidth - chatWidth - margin;
    const maxY = window.innerHeight - chatHeight - margin;

    let newX = clientX - this.dragStartOffset.x;
    let newY = clientY - this.dragStartOffset.y;

    newX = Math.max(margin, Math.min(newX, maxX));
    newY = Math.max(margin, Math.min(newY, maxY));

    this.copilotPos = { x: newX, y: newY };
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onDragEnd() {
    if (this.resizeRafId) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }

    if (this.isResizingCopilot) {
      if (this.copilotResizeInfo.activeSnapWidth) {
        this.copilotWidth = this.copilotResizeInfo.activeSnapWidth;
      }
      if (this.copilotResizeInfo.activeSnapHeight) {
        this.copilotHeight = this.copilotResizeInfo.activeSnapHeight;
      }
      try {
        localStorage.setItem('portalink_copilot_width', String(this.copilotWidth));
        localStorage.setItem('portalink_copilot_height', String(this.copilotHeight));
      } catch {}
    }

    this.isDraggingCopilot = false;
    this.isResizingCopilot = false;
    this.copilotResizeInfo.isSnappedWidth = false;
    this.copilotResizeInfo.isSnappedHeight = false;
    this.copilotResizeInfo.activeSnapWidth = null;
    this.copilotResizeInfo.activeSnapHeight = null;
    document.body.classList.remove('is-chat-dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  onClose() {
    this.closeChat.emit();
  }
}
