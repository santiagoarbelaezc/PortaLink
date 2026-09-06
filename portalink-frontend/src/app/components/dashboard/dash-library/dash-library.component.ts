import { Component, Input, OnInit, ViewChild, ElementRef, inject, HostListener, Directive, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LibraryService, NotebookFolder, NotebookModule, NotebookPage } from '../../../services/library.service';
import { LibraryAiService } from '../../../services/library-ai.service';

export interface SlashCommandItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
}

export interface LibraryTab {
  id: string;
  title: string;
  icon?: string;
  color?: string;
  folderId: number | null;
  notebookId: number | null;
  pageId: number | null;
  folderTitle?: string;
  notebookTitle?: string;
  pageTitle?: string;
}

export interface NoteBlockColumn {
  id: string;
  type: 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto';
  content: string;
  language?: string;
}

export interface NoteBlock {
  id: string;
  type: 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto' | 'columnas';
  content: string;
  language?: string;
  columns?: NoteBlockColumn[];
  columnRatio?: '50-50' | '33-66' | '66-33' | '40-60' | '60-40';
}

@Directive({
  selector: '[appContentEditable]',
  standalone: true
})
export class ContentEditableDirective implements OnChanges {
  @Input() appContentEditable: string = '';
  @Output() appContentEditableChange = new EventEmitter<string>();

  private isFocused = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appContentEditable'] && !this.isFocused) {
      let val = this.appContentEditable || '';
      val = val.replace(/<red>(.*?)<\/red>/gi, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
      val = val.replace(/\[red\](.*?)\[\/red\]/gi, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
      val = val.replace(/&lt;red&gt;(.*?)&lt;\/red&gt;/gi, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
      this.el.nativeElement.innerHTML = val;
    }
  }

  @HostListener('focus')
  onFocus() {
    this.isFocused = true;
  }

  @HostListener('blur')
  onBlur() {
    this.isFocused = false;
    this.appContentEditableChange.emit(this.el.nativeElement.innerHTML);
  }

  @HostListener('input')
  onInput() {
    this.appContentEditableChange.emit(this.el.nativeElement.innerHTML);
  }
}

@Component({
  selector: 'app-dash-library',
  standalone: true,
  imports: [CommonModule, FormsModule, ContentEditableDirective],
  templateUrl: './dash-library.component.html',
  host: { class: 'block w-full' }
})
export class DashLibraryComponent implements OnInit {
  @ViewChild('editorTextarea') editorTextarea?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('copilotMessagesContainer') copilotMessagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('copilotTextarea') copilotTextareaElement?: ElementRef<HTMLTextAreaElement>;

  @Input() theme: string = 'light';
  get isDark(): boolean {
    return this.theme === 'dark';
  }

  private libraryService = inject(LibraryService);
  private libraryAiService = inject(LibraryAiService);
  private sanitizer = inject(DomSanitizer);

  // Block-level AI action state
  activeAiBlockId: string | null = null;
  activeAiTargetColIndex: number | null = null;
  aiCustomInstruction = '';
  isAiLoading = false;
  aiResultPreview = '';
  aiError = '';

  // Floating Copilot State
  isCopilotOpen = false;
  isCopilotLoading = false;
  isResettingCopilot = false;
  showCopilotResetOverlay = false;
  copilotOverlayOpacity = '1';
  copilotInput = '';
  copilotMessages: { role: 'user' | 'assistant'; content: string }[] = [
    { role: 'assistant', content: '¡Hola! Soy **RotBot Apuntes IA**. ¿En qué puedo ayudarte a resumir, explicar o estructurar tus notas de estudio hoy?' }
  ];


  folders: NotebookFolder[] = [];
  notebooks: NotebookModule[] = [];
  pages: NotebookPage[] = [];

  selectedFolder: NotebookFolder | null = null;
  selectedNotebook: NotebookModule | null = null;
  selectedPage: NotebookPage | null = null;

  isLoading = false;
  searchQuery = '';
  searchResults: any[] = [];
  isPreviewMode = false;
  activeFilter: 'all' | 'favorites' | 'pinned' = 'all';

  // ── Folder Filtering & Sorting Suite ──────────────────────────────────
  showFolderFilters: boolean = false;
  folderSearchQuery: string = '';
  folderFilterStatus: 'all' | 'with-notebooks' | 'empty' | 'with-notes' = 'all';
  folderFilterColor: string = 'all';
  folderSortBy: 'name-asc' | 'name-desc' | 'notebooks-desc' | 'pages-desc' | 'recent' | 'oldest' = 'name-asc';
  folderViewLayout: 'grid' | 'list' = 'grid';

  get displayedFolders(): NotebookFolder[] {
    let list = [...this.folders];

    // 1. Text search
    if (this.folderSearchQuery.trim()) {
      const q = this.folderSearchQuery.toLowerCase().trim();
      list = list.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) || 
        (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // 2. Status filter
    if (this.folderFilterStatus === 'with-notebooks') {
      list = list.filter(f => (f.notebook_count || 0) > 0);
    } else if (this.folderFilterStatus === 'empty') {
      list = list.filter(f => (f.notebook_count || 0) === 0);
    } else if (this.folderFilterStatus === 'with-notes') {
      list = list.filter(f => (f.pages_count || 0) > 0);
    }

    // 3. Color filter
    if (this.folderFilterColor !== 'all') {
      list = list.filter(f => f.color?.toLowerCase() === this.folderFilterColor.toLowerCase());
    }

    // 4. Sorting
    list.sort((a, b) => {
      switch (this.folderSortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' });
        case 'notebooks-desc':
          return (b.notebook_count || 0) - (a.notebook_count || 0);
        case 'pages-desc':
          return (b.pages_count || 0) - (a.pages_count || 0);
        case 'recent': {
          const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
          const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
          return dateB - dateA;
        }
        case 'oldest': {
          const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
          const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
          return dateA - dateB;
        }
        default:
          return 0;
      }
    });

    return list;
  }

  get countWithNotebooks(): number {
    return this.folders.filter(f => (f.notebook_count || 0) > 0).length;
  }

  get countWithNotes(): number {
    return this.folders.filter(f => (f.pages_count || 0) > 0).length;
  }

  get countEmpty(): number {
    return this.folders.filter(f => (f.notebook_count || 0) === 0).length;
  }

  get availableFolderColors(): string[] {
    const colors = new Set<string>();
    for (const f of this.folders) {
      if (f.color) colors.add(f.color.toLowerCase());
    }
    return Array.from(colors);
  }

  get isFolderFilterActive(): boolean {
    return !!this.folderSearchQuery.trim() || this.folderFilterStatus !== 'all' || this.folderFilterColor !== 'all' || this.folderSortBy !== 'name-asc';
  }

  resetFolderFilters() {
    this.folderSearchQuery = '';
    this.folderFilterStatus = 'all';
    this.folderFilterColor = 'all';
    this.folderSortBy = 'name-asc';
    this.isSortDropdownOpen = false;
  }

  // ── Custom Dropdown Combobox Suite ──
  isSortDropdownOpen = false;
  sortOptions = [
    { id: 'name-asc', label: 'Nombre (A - Z)', desc: 'Orden alfabético normal', icon: 'az' },
    { id: 'name-desc', label: 'Nombre (Z - A)', desc: 'Orden alfabético inverso', icon: 'za' },
    { id: 'notebooks-desc', label: 'Más Cuadernos', desc: 'Por cantidad de módulos', icon: 'notebooks' },
    { id: 'pages-desc', label: 'Más Notas', desc: 'Por volumen de apuntes', icon: 'notes' },
    { id: 'recent', label: 'Más Recientes', desc: 'Editados recientemente', icon: 'recent' },
    { id: 'oldest', label: 'Más Antiguas', desc: 'Primeras materias creadas', icon: 'oldest' },
  ];

  get currentSortLabel(): string {
    return this.sortOptions.find(o => o.id === this.folderSortBy)?.label || 'Nombre (A - Z)';
  }

  toggleSortDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  selectSortOption(optionId: any, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.folderSortBy = optionId;
    this.isSortDropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.isSortDropdownOpen) {
      this.isSortDropdownOpen = false;
    }
    this.activeColTypeMenuId = null;
    this.activeColLangMenuId = null;
    this.activeTypeMenuBlockId = null;
  }

  // Toast feedback
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Form states (Create / Edit)
  isFolderModalOpen = false;
  editingFolderId: number | null = null;
  folderForm = { name: '', description: '', color: '#10b981', icon: 'folder' };

  isNotebookModalOpen = false;
  editingNotebookId: number | null = null;
  notebookForm = { title: '', description: '', color: '#3b82f6', icon: 'book' };

  // Confirmation Delete Modal state
  isDeleteModalOpen = false;
  deleteTargetType: 'folder' | 'notebook' | 'page' | null = null;
  deleteItemTitle = '';
  deleteItemRef: any = null;

  // Visual Block-Based Slate State
  blocks: NoteBlock[] = [];
  activeBlockId: string | null = null;
  activeTypeMenuBlockId: string | null = null;

  // ── Drag & Posicionamiento de la barra flotante de herramientas ──────
  toolbarPosition: 'top' | 'bottom' = 'top';
  toolbarOffsets: { [blockId: string]: { x: number; y: number } } = {};
  isDraggingToolbar = false;
  draggedToolbarBlockId: string | null = null;
  dragStartMouseX = 0;
  dragStartMouseY = 0;
  dragStartOffsetX = 0;
  dragStartOffsetY = 0;

  toggleToolbarPosition(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.toolbarPosition = this.toolbarPosition === 'top' ? 'bottom' : 'top';
  }

  onToolbarDragStart(blockId: string, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.isDraggingToolbar = true;
    this.draggedToolbarBlockId = blockId;
    this.dragStartMouseX = event.clientX;
    this.dragStartMouseY = event.clientY;
    const currentOffset = this.toolbarOffsets[blockId] || { x: 0, y: 0 };
    this.dragStartOffsetX = currentOffset.x;
    this.dragStartOffsetY = currentOffset.y;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDraggingToolbar || this.draggedToolbarBlockId !== blockId) return;
      const dx = e.clientX - this.dragStartMouseX;
      const dy = e.clientY - this.dragStartMouseY;
      this.toolbarOffsets[blockId] = {
        x: this.dragStartOffsetX + dx,
        y: this.dragStartOffsetY + dy
      };
    };

    const onMouseUp = () => {
      this.isDraggingToolbar = false;
      this.draggedToolbarBlockId = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { once: true });
  }

  getToolbarTransform(blockId: string): string {
    const offset = this.toolbarOffsets[blockId];
    if (!offset) return '';
    return `translate3d(${offset.x}px, ${offset.y}px, 0)`;
  }

  hasToolbarOffset(blockId: string): boolean {
    const offset = this.toolbarOffsets[blockId];
    return !!(offset && (offset.x !== 0 || offset.y !== 0));
  }

  resetToolbarPosition(blockId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    delete this.toolbarOffsets[blockId];
  }

  toggleBlockTypeMenu(blockId: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.activeTypeMenuBlockId = (this.activeTypeMenuBlockId === blockId) ? null : blockId;
    this.activeColTypeMenuId = null;
    this.activeColLangMenuId = null;
  }

  // ── CUSTOM COLUMN TYPE & LANGUAGE SELECTOR MENUS ──────────────
  activeColTypeMenuId: string | null = null;
  activeColLangMenuId: string | null = null;

  toggleColTypeMenu(colId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.activeColTypeMenuId = (this.activeColTypeMenuId === colId) ? null : colId;
    this.activeColLangMenuId = null;
    this.activeTypeMenuBlockId = null;
  }

  selectColType(col: NoteBlockColumn, newType: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.setColumnType(col, newType);
    this.activeColTypeMenuId = null;
  }

  toggleColLangMenu(colId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.activeColLangMenuId = (this.activeColLangMenuId === colId) ? null : colId;
    this.activeColTypeMenuId = null;
    this.activeTypeMenuBlockId = null;
  }

  selectColLang(col: NoteBlockColumn, newLang: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    col.language = newLang;
    this.syncBlocksToContent();
    this.activeColLangMenuId = null;
  }

  selectBlockType(block: NoteBlock, newType: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.changeBlockType(block, newType);
    this.activeTypeMenuBlockId = null;
  }

  // ── Helper para renderizar contenido con colores en contenteditable ──
  getSafeBlockHtml(block: NoteBlock): SafeHtml {
    if (!block.content) return '';
    let content = block.content;
    
    // Convertir etiquetas legadas <red>...</red> o [red]...[/red] a HTML estilizado en rojo
    content = content.replace(/<red>(.*?)<\/red>/gi, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
    content = content.replace(/\[red\](.*?)\[\/red\]/gi, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
    content = content.replace(/&lt;red&gt;(.*?)&lt;\/red&gt;/gi, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
    
    // Convertir etiquetas legadas [b]...[/b] y [i]...[/i]
    content = content.replace(/\[b\](.*?)\[\/b\]/gi, '<strong class="font-bold">$1</strong>');
    content = content.replace(/\[i\](.*?)\[\/i\]/gi, '<em class="italic">$1</em>');
    
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  onBlockContentEditableInput(block: NoteBlock, event: Event) {
    const el = event.target as HTMLElement;
    if (!el) return;
    block.content = el.innerHTML;
    this.syncBlocksToContent();
  }

  // ── Formateo de Texto Enriquecido: Negrilla, Cursiva y Rojo ──────────────
  applyTextStyleToSelection(type: 'bold' | 'italic' | 'red', block?: NoteBlock) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.showToast('Selecciona el texto con el cursor primero');
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    let container = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement as HTMLElement;
    }

    if (type === 'bold') {
      const boldElement = container?.closest('strong, b, .font-bold') as HTMLElement | null;
      if (boldElement) {
        // Deshacer negrilla
        const plainText = boldElement.innerText || boldElement.textContent || '';
        const textNode = document.createTextNode(plainText);
        boldElement.parentNode?.replaceChild(textNode, boldElement);
        this.showToast('Negrilla removida');
      } else if (selectedText && selectedText.trim().length > 0) {
        const strong = document.createElement('strong');
        strong.className = 'font-bold';
        try {
          range.surroundContents(strong);
        } catch (e) {
          const fragment = range.extractContents();
          strong.appendChild(fragment);
          range.insertNode(strong);
        }
        this.showToast('Texto en negrilla');
      } else {
        const strong = document.createElement('strong');
        strong.className = 'font-bold';
        strong.textContent = 'texto en negrilla';
        range.insertNode(strong);

        const newRange = document.createRange();
        newRange.selectNodeContents(strong);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.showToast('Negrilla insertada');
      }
    } else if (type === 'italic') {
      const italicElement = container?.closest('em, i, .italic') as HTMLElement | null;
      if (italicElement) {
        // Deshacer cursiva
        const plainText = italicElement.innerText || italicElement.textContent || '';
        const textNode = document.createTextNode(plainText);
        italicElement.parentNode?.replaceChild(textNode, italicElement);
        this.showToast('Cursiva removida');
      } else if (selectedText && selectedText.trim().length > 0) {
        const em = document.createElement('em');
        em.className = 'italic';
        try {
          range.surroundContents(em);
        } catch (e) {
          const fragment = range.extractContents();
          em.appendChild(fragment);
          range.insertNode(em);
        }
        this.showToast('Texto en cursiva');
      } else {
        const em = document.createElement('em');
        em.className = 'italic';
        em.textContent = 'texto en cursiva';
        range.insertNode(em);

        const newRange = document.createRange();
        newRange.selectNodeContents(em);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.showToast('Cursiva insertada');
      }
    } else if (type === 'red') {
      const redElement = container?.closest('.text-red-500, [style*="239, 68, 68"], [style*="#ef4444"], red') as HTMLElement | null;
      if (redElement) {
        // Toggle: Deshacer color rojo
        const plainText = redElement.innerText || redElement.textContent || '';
        const textNode = document.createTextNode(plainText);
        redElement.parentNode?.replaceChild(textNode, redElement);
        this.showToast('Color rojo removido');
      } else if (selectedText && selectedText.trim().length > 0) {
        const span = document.createElement('span');
        span.className = 'text-red-500 font-bold';
        span.style.color = '#ef4444';
        try {
          range.surroundContents(span);
        } catch (e) {
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
        }
        this.showToast('Texto colocado en rojo');
      } else {
        const span = document.createElement('span');
        span.className = 'text-red-500 font-bold';
        span.style.color = '#ef4444';
        span.textContent = 'texto en rojo';
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
        this.showToast('Texto en rojo insertado');
      }
    }

    // Sincronizar bloque activo
    const targetBlock = block || (this.activeBlockId ? this.blocks.find(b => b.id === this.activeBlockId) : null);
    if (targetBlock) {
      const blockEl = document.getElementById('block-' + targetBlock.id);
      if (blockEl) {
        targetBlock.content = blockEl.innerHTML;
      }
      this.syncBlocksToContent();
    }
  }

  // Métodos puente para compatibilidad
  applyRedTextColorToSelection(block?: NoteBlock) {
    this.applyTextStyleToSelection('red', block);
  }

  applyRedTextToActiveBlock() {
    this.applyTextStyleToSelection('red');
  }

  applyBoldTextToActiveBlock(block?: NoteBlock) {
    this.applyTextStyleToSelection('bold', block);
  }

  applyItalicTextToActiveBlock(block?: NoteBlock) {
    this.applyTextStyleToSelection('italic', block);
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalTypeMenuKeydown(event: KeyboardEvent) {
    // Atajo global Ctrl + Shift + D / Cmd + Shift + D (Rojo)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'D' || event.key === 'd')) {
      event.preventDefault();
      event.stopPropagation();
      this.applyTextStyleToSelection('red');
      return;
    }

    // Atajo global Ctrl + B / Cmd + B (Negrilla)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'B' || event.key === 'b') && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.applyTextStyleToSelection('bold');
      return;
    }

    // Atajo global Ctrl + I / Cmd + I (Cursiva)
    if ((event.ctrlKey || event.metaKey) && (event.key === 'I' || event.key === 'i') && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.applyTextStyleToSelection('italic');
      return;
    }

    if (!this.activeTypeMenuBlockId) return;

    const block = this.blocks.find(b => b.id === this.activeTypeMenuBlockId);
    if (!block) return;

    const key = event.key.toLowerCase();

    if (key === 't') {
      event.preventDefault();
      event.stopPropagation();
      this.selectBlockType(block, 'titulo');
    } else if (key === 's') {
      event.preventDefault();
      event.stopPropagation();
      this.selectBlockType(block, 'subtitulo');
    } else if (key === 'c') {
      event.preventDefault();
      event.stopPropagation();
      this.selectBlockType(block, 'codigo');
    } else if (key === 'a') {
      event.preventDefault();
      event.stopPropagation();
      this.selectBlockType(block, 'alerta');
    } else if (key === 'n') {
      event.preventDefault();
      event.stopPropagation();
      this.selectBlockType(block, 'texto');
    } else if (key === 'escape') {
      event.preventDefault();
      event.stopPropagation();
      this.activeTypeMenuBlockId = null;
    }
  }

  getBlockTypeLabel(type: string): string {
    switch (type) {
      case 'titulo': return 'Título';
      case 'subtitulo': return 'Subtítulo';
      case 'codigo': return 'Código / Tabla';
      case 'alerta': return 'Alerta';
      case 'texto': return 'Texto Normal';
      case 'columnas': return '2 Columnas';
      default: return 'Texto Normal';
    }
  }

  // Notion Slash Command State with Keyboard Selection
  showSlashMenu = false;
  slashMenuQuery = '';
  slashSelectedIndex = 0;
  slashCommands: SlashCommandItem[] = [
    { key: 'titulo', title: 'Título', desc: 'Encabezado principal de sección', icon: 'H1' },
    { key: 'subtitulo', title: 'Subtítulo', desc: 'Subtítulo secundario de sección', icon: 'H2' },
    { key: 'codigo', title: 'Código / Tabla', desc: 'Bloque de código o tabla estructurada', icon: '</>' },
    { key: 'alerta', title: 'Alerta / Nota', desc: 'Caja destacada con consejo o idea', icon: '!' },
    { key: 'texto', title: 'Texto normal', desc: 'Párrafo de texto libre', icon: 'T' },
    { key: 'columnas', title: '2 Columnas Paralelas', desc: 'Colocar dos tablas o bloques lado a lado', icon: '◫' }
  ];

  // Color Swatches Palette
  presetColors = [
    '#10b981', // Emerald
    '#3b82f6', // Sapphire Blue
    '#8b5cf6', // Violet Purple
    '#ec4899', // Rose Pink
    '#f59e0b', // Amber Gold
    '#ef4444', // Crimson Red
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#84cc16'  // Lime
  ];

  // Elegant Vector Icon Presets
  presetIcons = [
    'folder',
    'book',
    'code',
    'database',
    'tech',
    'globe',
    'academic',
    'layers',
    'star',
    'sparkles',
    'chart',
    'shield',
    'bookmark',
    'pencil'
  ];

  // Summary metrics for executive KPI grid
  get totalFoldersCount(): number {
    return this.folders.length;
  }

  get totalNotebooksCount(): number {
    return this.folders.reduce((acc, f) => acc + (f.notebook_count || 0), 0);
  }

  get totalPagesCount(): number {
    return this.folders.reduce((acc, f) => acc + (f.pages_count || 0), 0);
  }

  get totalPinnedPagesCount(): number {
    return this.pages.filter(p => p.is_pinned).length;
  }

  get filteredSlashCommands(): SlashCommandItem[] {
    if (!this.slashMenuQuery.trim()) return this.slashCommands;
    const q = this.slashMenuQuery.toLowerCase().replace('/', '');
    return this.slashCommands.filter(c => 
      c.title.toLowerCase().includes(q) || c.key.toLowerCase().includes(q)
    );
  }

  isMobileScreen: boolean = false;

  @HostListener('window:resize')
  onResize() {
    this.checkMobileScreen();
  }

  checkMobileScreen() {
    this.isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    if (this.isMobileScreen && this.editorViewMode === 'split') {
      this.editorViewMode = 'edit';
    }
    if (this.isMobileScreen) {
      this.isSidebarCollapsed = true;
    }
  }

  loadCopilotChatFromStorage() {
    if (typeof window === 'undefined') return;
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

  saveCopilotChatToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('portalink_copilot_chat', JSON.stringify(this.copilotMessages));
    } catch (e) {
      console.error('Error guardando chat copilot en localStorage:', e);
    }
  }

  ngOnInit() {
    this.checkMobileScreen();
    const savedRatio = localStorage.getItem('portalink_lib_split_ratio');
    if (savedRatio) {
      this.editorSplitRatio = parseInt(savedRatio, 10) || 50;
    }
    if (!this.isMobileScreen) {
      const savedSidebar = localStorage.getItem('portalink_lib_sidebar_collapsed');
      if (savedSidebar === 'true') {
        this.isSidebarCollapsed = true;
      }
    }
    this.loadCopilotChatFromStorage();
    try {
      const savedWidth = localStorage.getItem('portalink_copilot_width');
      if (savedWidth) {
        const parsedW = parseInt(savedWidth, 10);
        if (parsedW >= 360 && parsedW <= 1000) {
          this.copilotWidth = parsedW;
        }
      }
    } catch {}
    this.initTabs();
    this.loadFolders();
  }

  // ── MULTI-TAB WORKSPACE NAVIGATION ──────────────────────────
  tabs: LibraryTab[] = [];
  activeTabId: string = '';

  initTabs() {
    try {
      const savedTabs = localStorage.getItem('portalink_lib_tabs');
      const savedActiveTabId = localStorage.getItem('portalink_lib_active_tab_id');
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tabs = parsed;
          this.activeTabId = (savedActiveTabId && this.tabs.some(t => t.id === savedActiveTabId)) 
            ? savedActiveTabId 
            : this.tabs[0].id;
          return;
        }
      }
    } catch (e) {
      console.error('Error cargando pestañas:', e);
    }

    const defaultTab: LibraryTab = {
      id: 'tab_' + Date.now(),
      title: 'Biblioteca',
      icon: 'folder',
      color: '#10b981',
      folderId: null,
      notebookId: null,
      pageId: null
    };
    this.tabs = [defaultTab];
    this.activeTabId = defaultTab.id;
    this.saveTabsToStorage();
  }

  saveTabsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('portalink_lib_tabs', JSON.stringify(this.tabs));
      localStorage.setItem('portalink_lib_active_tab_id', this.activeTabId);
    } catch (e) {}
  }

  syncActiveTabMeta() {
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (!tab) return;

    tab.folderId = this.selectedFolder?.id || null;
    tab.folderTitle = this.selectedFolder?.name;
    tab.notebookId = this.selectedNotebook?.id || null;
    tab.notebookTitle = this.selectedNotebook?.title;
    tab.pageId = this.selectedPage?.id || null;
    tab.pageTitle = this.selectedPage?.title;

    tab.color = this.selectedNotebook?.color || this.selectedFolder?.color || '#10b981';
    tab.icon = this.selectedNotebook?.icon || this.selectedFolder?.icon || 'folder';

    if (this.selectedPage && this.selectedPage.title) {
      tab.title = this.selectedPage.title;
    } else if (this.selectedNotebook && this.selectedNotebook.title) {
      tab.title = this.selectedNotebook.title;
    } else if (this.selectedFolder && this.selectedFolder.name) {
      tab.title = this.selectedFolder.name;
    } else {
      tab.title = 'Biblioteca';
    }

    this.saveTabsToStorage();
  }

  openNewTab(folderId?: number | null, notebookId?: number | null, pageId?: number | null) {
    this.syncActiveTabMeta();

    const newTabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    let title = 'Nueva Pestaña';
    let color = '#10b981';
    let icon = 'folder';

    if (notebookId && this.notebooks.length > 0) {
      const nb = this.notebooks.find(n => n.id === notebookId);
      if (nb) {
        title = nb.title;
        color = nb.color || color;
        icon = nb.icon || icon;
      }
    } else if (folderId && this.folders.length > 0) {
      const f = this.folders.find(fold => fold.id === folderId);
      if (f) {
        title = f.name;
        color = f.color || color;
        icon = f.icon || icon;
      }
    }

    const newTab: LibraryTab = {
      id: newTabId,
      title,
      icon,
      color,
      folderId: folderId ?? null,
      notebookId: notebookId ?? null,
      pageId: pageId ?? null
    };

    this.tabs.push(newTab);
    this.switchTab(newTabId);
  }

  openNotebookInNewTab(notebook: NotebookModule, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.openNewTab(this.selectedFolder?.id, notebook.id, null);
  }

  switchTab(tabId: string) {
    if (this.activeTabId === tabId && this.selectedNotebook) return;

    this.syncActiveTabMeta();
    this.activeTabId = tabId;
    this.saveTabsToStorage();

    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (tab.folderId) {
      const folder = this.folders.find(f => f.id === tab.folderId);
      this.selectedFolder = folder || null;

      if (this.selectedFolder && tab.notebookId) {
        this.libraryService.getNotebooks(tab.folderId).subscribe({
          next: (res) => {
            if (res.ok) {
              this.notebooks = res.data;
              const nb = this.notebooks.find(n => n.id === tab.notebookId);
              this.selectedNotebook = nb || null;
              if (this.selectedNotebook && typeof this.selectedNotebook.id === 'number') {
                this.loadPages(this.selectedNotebook.id, tab.pageId || undefined);
              }
            }
          }
        });
      } else if (this.selectedFolder) {
        this.selectedNotebook = null;
        this.selectedPage = null;
        this.pages = [];
        this.loadNotebooks(tab.folderId);
      }
    } else {
      this.selectedFolder = null;
      this.selectedNotebook = null;
      this.selectedPage = null;
      this.notebooks = [];
      this.pages = [];
    }
  }

  closeTab(tabId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.tabs.length <= 1) {
      // Si solo queda una pestaña, reiniciar a la vista raíz de Biblioteca
      this.selectedFolder = null;
      this.selectedNotebook = null;
      this.selectedPage = null;
      this.notebooks = [];
      this.pages = [];
      this.syncActiveTabMeta();
      return;
    }

    const idx = this.tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;

    if (this.activeTabId === tabId) {
      const nextIdx = idx === this.tabs.length - 1 ? idx - 1 : idx + 1;
      const nextTab = this.tabs[nextIdx];
      this.tabs.splice(idx, 1);
      this.switchTab(nextTab.id);
    } else {
      this.tabs.splice(idx, 1);
      this.saveTabsToStorage();
    }
  }

  closeOtherTabs(keepTabId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.tabs = this.tabs.filter(t => t.id === keepTabId);
    this.switchTab(keepTabId);
    this.saveTabsToStorage();
    this.showToast('Pestañas secundarias cerradas');
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMessage === msg) this.toastMessage = '';
    }, 3500);
  }

  saveStateInLocalStorage() {
    this.syncActiveTabMeta();

    if (this.selectedFolder?.id) {
      localStorage.setItem('portalink_lib_folder_id', this.selectedFolder.id.toString());
    } else {
      localStorage.removeItem('portalink_lib_folder_id');
    }

    if (this.selectedNotebook?.id) {
      localStorage.setItem('portalink_lib_notebook_id', this.selectedNotebook.id.toString());
    } else {
      localStorage.removeItem('portalink_lib_notebook_id');
    }

    if (this.selectedPage?.id) {
      localStorage.setItem('portalink_lib_page_id', this.selectedPage.id.toString());
    } else {
      localStorage.removeItem('portalink_lib_page_id');
    }
  }

  restoreSavedState() {
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    const targetFolderId = activeTab?.folderId ?? (localStorage.getItem('portalink_lib_folder_id') ? parseInt(localStorage.getItem('portalink_lib_folder_id')!, 10) : null);
    const targetNotebookId = activeTab?.notebookId ?? (localStorage.getItem('portalink_lib_notebook_id') ? parseInt(localStorage.getItem('portalink_lib_notebook_id')!, 10) : null);
    const targetPageId = activeTab?.pageId ?? (localStorage.getItem('portalink_lib_page_id') ? parseInt(localStorage.getItem('portalink_lib_page_id')!, 10) : undefined);

    if (!targetFolderId) return;
    const folder = this.folders.find(f => f.id === targetFolderId);

    if (folder) {
      this.selectedFolder = folder;
      if (!targetNotebookId) return;

      this.libraryService.getNotebooks(targetFolderId).subscribe({
        next: (res) => {
          if (res.ok) {
            this.notebooks = res.data;
            const nb = this.notebooks.find(n => n.id === targetNotebookId);
            if (nb) {
              this.selectedNotebook = nb;
              this.loadPages(targetNotebookId, targetPageId);
            }
          }
        }
      });
    }
  }

  loadFolders() {
    this.isLoading = true;
    this.libraryService.getFolders().subscribe({
      next: (res) => {
        if (res.ok) {
          this.folders = res.data;
          this.restoreSavedState();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Error al cargar carpetas', 'error');
      }
    });
  }

  selectFolder(folder: NotebookFolder | null) {
    this.selectedFolder = folder;
    this.selectedNotebook = null;
    this.selectedPage = null;
    this.notebooks = [];
    this.pages = [];
    this.saveStateInLocalStorage();

    if (folder && folder.id) {
      this.loadNotebooks(folder.id);
    } else {
      this.loadFolders();
    }
  }

  loadNotebooks(folderId: number) {
    this.isLoading = true;
    this.libraryService.getNotebooks(folderId).subscribe({
      next: (res) => {
        if (res.ok) this.notebooks = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Error al cargar cuadernos', 'error');
      }
    });
  }

  selectNotebook(notebook: NotebookModule | null) {
    this.selectedNotebook = notebook;
    this.selectedPage = null;
    this.pages = [];

    if (notebook && notebook.id) {
      this.loadPages(notebook.id);
    }
    this.saveStateInLocalStorage();
  }

  loadPages(notebookId: number, targetPageId?: number) {
    this.libraryService.getPages(notebookId).subscribe({
      next: (res) => {
        if (res.ok) {
          this.pages = res.data;
          if (this.pages.length > 0) {
            if (targetPageId) {
              const found = this.pages.find(p => p.id === targetPageId);
              this.selectedPage = found || this.pages[0];
            } else if (!this.selectedPage) {
              this.selectedPage = this.pages[0];
            }
          }
          if (this.selectedPage) {
            this.blocks = this.parseContentToBlocks(this.selectedPage.content || '');
          }
          this.saveStateInLocalStorage();
        }
      }
    });
  }

  selectPage(page: NotebookPage) {
    this.selectedPage = page;
    this.showSlashMenu = false;
    this.blocks = this.parseContentToBlocks(page.content || '');
    if (this.isMobileScreen) {
      this.isSidebarCollapsed = true;
    }
    this.saveStateInLocalStorage();
  }

  editorViewMode: 'edit' | 'split' | 'preview' = 'edit';
  editorSplitRatio: number = 50;
  isSidebarCollapsed: boolean = false;
  private autoSaveTimer: any = null;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('portalink_lib_sidebar_collapsed', this.isSidebarCollapsed ? 'true' : 'false');
  }

  setSplitRatio(ratio: number) {
    this.editorSplitRatio = Math.max(25, Math.min(75, ratio));
    localStorage.setItem('portalink_lib_split_ratio', this.editorSplitRatio.toString());
  }

  onTitleInput() {
    if (!this.selectedPage) return;
    const match = this.pages.find(p => p.id === this.selectedPage?.id);
    if (match) {
      match.title = this.selectedPage.title;
    }
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.autoSavePage();
    }, 400);
  }

  // ── BLOCK-BASED SLATE ENGINE (NO RAW MD VISIBLE ON CANVAS) ──────
  generateBlockId(): string {
    return 'blk_' + Math.random().toString(36).substring(2, 9);
  }

  parseContentToBlocks(content: string): NoteBlock[] {
    if (!content || !content.trim()) {
      return [{ id: this.generateBlockId(), type: 'texto', content: '' }];
    }

    const blocks: NoteBlock[] = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Bloque de Columnas Paralelas: :::columns ratio=50-50 ... :::
      if (line.trim().startsWith(':::columns')) {
        const ratioMatch = line.trim().match(/ratio=([0-9-]+)/);
        const columnRatio = (ratioMatch && ratioMatch[1]) ? (ratioMatch[1] as any) : '50-50';
        const colBlocks: NoteBlockColumn[] = [];
        i++; // avanzar después de :::columns

        let currentColType: 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto' = 'texto';
        let currentColLang: string | undefined = undefined;
        let currentColLines: string[] = [];
        let hasActiveCol = false;

        const flushCol = () => {
          if (hasActiveCol) {
            colBlocks.push({
              id: this.generateBlockId(),
              type: currentColType,
              language: currentColLang,
              content: currentColLines.join('\n')
            });
            currentColLines = [];
            currentColType = 'texto';
            currentColLang = undefined;
            hasActiveCol = false;
          }
        };

        while (i < lines.length && lines[i].trim() !== ':::' && !lines[i].trim().startsWith(':::columns')) {
          const l = lines[i];
          if (l.trim().startsWith(':::column')) {
            flushCol();
            hasActiveCol = true;
            const typeMatch = l.trim().match(/type=([a-z]+)/);
            if (typeMatch && ['titulo', 'subtitulo', 'codigo', 'alerta', 'texto'].includes(typeMatch[1])) {
              currentColType = typeMatch[1] as any;
            }
            const langMatch = l.trim().match(/language=([a-zA-Z0-9_-]+)/);
            if (langMatch) currentColLang = langMatch[1];
            i++;
            continue;
          }
          if (hasActiveCol) {
            currentColLines.push(l);
          }
          i++;
        }
        flushCol();

        if (i < lines.length && lines[i].trim() === ':::') {
          i++;
        }

        // Asegurar que siempre tenga exactamente 2 columnas
        while (colBlocks.length < 2) {
          colBlocks.push({
            id: this.generateBlockId(),
            type: 'texto',
            content: ''
          });
        }

        blocks.push({
          id: this.generateBlockId(),
          type: 'columnas',
          content: '',
          columnRatio: columnRatio || '50-50',
          columns: colBlocks.slice(0, 2)
        });
        continue;
      }

      // Bloque de Código: ```lang ... ```
      if (line.trim().startsWith('```')) {
        const langMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)/);
        const language = (langMatch && langMatch[1]) ? langMatch[1] : 'typescript';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].trim().startsWith('```')) {
          i++;
        }
        blocks.push({
          id: this.generateBlockId(),
          type: 'codigo',
          language,
          content: codeLines.join('\n')
        });
        continue;
      }

      // Título (# o ##)
      if (line.startsWith('# ') || line.startsWith('## ')) {
        const text = line.replace(/^#{1,2}\s+/, '');
        blocks.push({
          id: this.generateBlockId(),
          type: 'titulo',
          content: text
        });
        i++;
        continue;
      }

      // Subtítulo (### o ####)
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        const text = line.replace(/^#{3,4}\s+/, '');
        blocks.push({
          id: this.generateBlockId(),
          type: 'subtitulo',
          content: text
        });
        i++;
        continue;
      }

      // Alerta (> o > 💡)
      if (line.startsWith('> ')) {
        const alertLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('> ')) {
          alertLines.push(lines[i].replace(/^>\s*(💡\s*|⚠️\s*|ℹ️\s*)?/, ''));
          i++;
        }
        blocks.push({
          id: this.generateBlockId(),
          type: 'alerta',
          content: alertLines.join('\n')
        });
        continue;
      }

      // Skip blank lines outside blocks
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Texto normal
      const textLines: string[] = [];
      while (
        i < lines.length &&
        !lines[i].trim().startsWith(':::columns') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].startsWith('# ') &&
        !lines[i].startsWith('## ') &&
        !lines[i].startsWith('### ') &&
        !lines[i].startsWith('#### ') &&
        !lines[i].startsWith('> ') &&
        lines[i].trim() !== ''
      ) {
        textLines.push(lines[i]);
        i++;
      }

      if (textLines.length > 0) {
        blocks.push({
          id: this.generateBlockId(),
          type: 'texto',
          content: textLines.join('\n')
        });
      }
    }

    if (blocks.length === 0) {
      blocks.push({ id: this.generateBlockId(), type: 'texto', content: '' });
    }

    return blocks;
  }

  syncBlocksToContent() {
    if (!this.selectedPage) return;

    const mdParts = this.blocks.map(b => {
      const rawContent = (b.content || '').trim();
      if (b.type === 'titulo') {
        return `# ${rawContent}`;
      } else if (b.type === 'subtitulo') {
        return `### ${rawContent}`;
      } else if (b.type === 'codigo') {
        const lang = b.language || 'typescript';
        return `\`\`\`${lang}\n${b.content || ''}\n\`\`\``;
      } else if (b.type === 'alerta') {
        const lines = (b.content || '').split('\n');
        return lines.map(l => `> 💡 ${l}`).join('\n');
      } else if (b.type === 'columnas') {
        const ratio = b.columnRatio || '50-50';
        const cols = (b.columns || []).slice(0, 2);
        const colsStr = cols.map(c => {
          const langAttr = c.language ? ` language=${c.language}` : '';
          return `:::column type=${c.type || 'texto'}${langAttr}\n${c.content || ''}`;
        }).join('\n');
        return `:::columns ratio=${ratio}\n${colsStr}\n:::`;
      } else {
        return rawContent;
      }
    });

    this.selectedPage.content = mdParts.join('\n\n');
    this.onTitleInput();
  }

  onBlockInput(block: NoteBlock, event?: any) {
    if (event && event.target && event.target.tagName === 'TEXTAREA') {
      const el = event.target as HTMLTextAreaElement;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }

    if (event && event.target && typeof event.target.value === 'string' && event.target.value.includes('/')) {
      const val: string = event.target.value;
      if (val.trim().startsWith('/')) {
        this.showSlashMenu = true;
        this.slashMenuQuery = val.trim();
        this.slashSelectedIndex = 0;
        this.activeBlockId = block.id;
      }
    }
    this.syncBlocksToContent();
  }

  getLineCount(content: string, minRows: number = 1, type: string = 'texto'): number {
    if (!content) return minRows;

    const isMobile = this.isMobileScreen || (typeof window !== 'undefined' && window.innerWidth < 768);

    let maxCharsPerLine = isMobile ? 38 : 110;
    if (type === 'titulo') maxCharsPerLine = isMobile ? 20 : 55;
    else if (type === 'subtitulo') maxCharsPerLine = isMobile ? 26 : 75;
    else if (type === 'alerta') maxCharsPerLine = isMobile ? 34 : 100;
    else if (type === 'codigo') maxCharsPerLine = isMobile ? 32 : 90;

    const lines = content.split('\n');
    let totalRows = 0;

    for (const line of lines) {
      if (line.length === 0) {
        totalRows += 1;
      } else {
        totalRows += Math.max(1, Math.ceil(line.length / maxCharsPerLine));
      }
    }

    return Math.max(minRows, totalRows);
  }

  onBlockKeydown(event: KeyboardEvent, block: NoteBlock, index: number) {
    if (this.showSlashMenu) {
      this.onTextareaKeydown(event);
      return;
    }

    // Atajo Ctrl + Shift + D / Cmd + Shift + D para colorear texto en rojo
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'D' || event.key === 'd')) {
      event.preventDefault();
      event.stopPropagation();
      this.applyRedTextColorToSelection(block);
      return;
    }

    // Atajo Ctrl + B / Cmd + B para Negrilla
    if ((event.ctrlKey || event.metaKey) && (event.key === 'B' || event.key === 'b') && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.applyBoldTextToActiveBlock(block);
      return;
    }

    // Atajo Ctrl + I / Cmd + I para Cursiva
    if ((event.ctrlKey || event.metaKey) && (event.key === 'I' || event.key === 'i') && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.applyItalicTextToActiveBlock(block);
      return;
    }

    if (event.key === 'Enter') {
      if (block.type === 'titulo' || block.type === 'subtitulo') {
        if (!event.shiftKey) {
          event.preventDefault();
          this.addBlock('texto', index);
        }
      }
    } else if (event.key === 'Backspace') {
      const blockEl = document.getElementById('block-' + block.id);
      const isContentEmpty = !block.content || block.content.trim() === '' || (blockEl && (blockEl.innerText.trim() === '' || blockEl.innerHTML === '<br>'));
      if (isContentEmpty && this.blocks.length > 1) {
        event.preventDefault();
        this.removeBlock(index);
      }
    }
  }

  addBlock(type: string, index?: number) {
    const validTypes: ('titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto' | 'columnas')[] = [
      'titulo', 'subtitulo', 'codigo', 'alerta', 'texto', 'columnas'
    ];
    const blockType = validTypes.includes(type as any) ? (type as any) : 'texto';

    let newBlock: NoteBlock;
    if (blockType === 'columnas') {
      newBlock = {
        id: this.generateBlockId(),
        type: 'columnas',
        content: '',
        columnRatio: '50-50',
        columns: [
          {
            id: this.generateBlockId(),
            type: 'codigo',
            language: 'sql',
            content: ''
          },
          {
            id: this.generateBlockId(),
            type: 'codigo',
            language: 'sql',
            content: ''
          }
        ]
      };
    } else {
      newBlock = {
        id: this.generateBlockId(),
        type: blockType,
        content: blockType === 'codigo' ? '// Tu código aquí\n' : '',
        language: blockType === 'codigo' ? 'typescript' : undefined
      };
    }

    if (typeof index === 'number') {
      this.blocks.splice(index + 1, 0, newBlock);
    } else {
      this.blocks.push(newBlock);
    }

    this.activeBlockId = newBlock.id;
    this.syncBlocksToContent();
  }

  removeBlock(index: number) {
    if (this.blocks.length <= 1) {
      this.blocks[0] = { id: this.generateBlockId(), type: 'texto', content: '' };
    } else {
      this.blocks.splice(index, 1);
    }
    this.syncBlocksToContent();
  }

  draggedBlockIndex: number | null = null;
  dragOverBlockIndex: number | null = null;

  onBlockDragStart(index: number, event: DragEvent) {
    this.draggedBlockIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onBlockDragOver(index: number, event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverBlockIndex = index;
  }

  onBlockDragLeave() {
    this.dragOverBlockIndex = null;
  }

  onBlockDrop(targetIndex: number, event: DragEvent) {
    event.preventDefault();
    this.dragOverBlockIndex = null;
    if (this.draggedBlockIndex === null || this.draggedBlockIndex === targetIndex) return;

    const movedBlock = this.blocks.splice(this.draggedBlockIndex, 1)[0];
    this.blocks.splice(targetIndex, 0, movedBlock);

    this.draggedBlockIndex = null;
    this.syncBlocksToContent();
  }

  onBlockDragEnd() {
    this.draggedBlockIndex = null;
    this.dragOverBlockIndex = null;
  }

  moveBlock(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index > 0) {
      const temp = this.blocks[index];
      this.blocks[index] = this.blocks[index - 1];
      this.blocks[index - 1] = temp;
    } else if (direction === 'down' && index < this.blocks.length - 1) {
      const temp = this.blocks[index];
      this.blocks[index] = this.blocks[index + 1];
      this.blocks[index + 1] = temp;
    }
    this.syncBlocksToContent();
  }

  duplicateBlock(index: number) {
    const target = this.blocks[index];
    if (!target) return;
    const clone: NoteBlock = {
      id: this.generateBlockId(),
      type: target.type,
      content: target.content,
      language: target.language,
      columnRatio: target.columnRatio,
      columns: target.columns ? target.columns.map(c => ({ ...c, id: this.generateBlockId() })) : undefined
    };
    this.blocks.splice(index + 1, 0, clone);
    this.syncBlocksToContent();
  }

  changeBlockType(block: NoteBlock, newType: string) {
    if (newType === 'columnas') {
      this.convertToColumns(block);
      return;
    }
    const validTypes: ('titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto')[] = [
      'titulo', 'subtitulo', 'codigo', 'alerta', 'texto'
    ];
    block.type = validTypes.includes(newType as any) ? (newType as any) : 'texto';
    if (block.type === 'codigo' && !block.language) {
      block.language = 'typescript';
    }
    // Si viene de columnas, limpiar estructura de columnas
    if (block.columns) {
      if (block.columns[0] && block.columns[0].content) {
        block.content = block.columns[0].content;
      }
      delete block.columns;
      delete block.columnRatio;
    }
    this.syncBlocksToContent();
  }

  convertToColumns(block: NoteBlock) {
    if (block.type === 'columnas') return;
    const currentContent = block.content || '';
    const currentType = block.type;
    const currentLang = block.language;

    block.type = 'columnas';
    block.columnRatio = '50-50';
    block.content = '';
    block.columns = [
      {
        id: this.generateBlockId(),
        type: currentType,
        language: currentLang,
        content: currentContent
      },
      {
        id: this.generateBlockId(),
        type: 'codigo',
        language: 'sql',
        content: ''
      }
    ];
    this.syncBlocksToContent();
  }

  setColumnRatio(block: NoteBlock, ratio: '50-50' | '33-66' | '66-33' | '40-60' | '60-40') {
    block.columnRatio = ratio;
    this.syncBlocksToContent();
  }

  setColumnType(col: NoteBlockColumn, newType: string) {
    const validTypes: ('titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto')[] = [
      'titulo', 'subtitulo', 'codigo', 'alerta', 'texto'
    ];
    col.type = validTypes.includes(newType as any) ? (newType as any) : 'texto';
    if (col.type === 'codigo' && !col.language) {
      col.language = 'sql';
    }
    this.syncBlocksToContent();
  }

  onColumnInput(col: NoteBlockColumn, event: Event) {
    const target = event.target as HTMLElement;
    if (target) {
      col.content = target.innerText || target.innerHTML || '';
    }
    this.syncBlocksToContent();
  }

  copyCodeBlock(content: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content || '').then(() => {
        this.showToast('Código copiado al portapapeles');
      });
    }
  }

  createNewPage() {
    if (!this.selectedNotebook || !this.selectedNotebook.id) return;

    const tempId = Date.now();
    const sampleContent = '# Título de la Lección de Estudio\n\nEste es un párrafo de texto normal. Escribe tus apuntes sin código markdown visible.\n\n### Subtítulo de Conceptos\n\n> 💡 **Nota:** Utiliza únicamente los 5 tipos de texto: Título, Subtítulo, Código, Alerta y Texto Normal.\n\n```typescript\n// Ejemplo de código fuente\nconst mensaje = "PortaLink - Apuntes Inteligentes";\nconsole.log(mensaje);\n```\n';

    const tempPage: NotebookPage = {
      id: tempId,
      notebook_id: this.selectedNotebook.id,
      title: 'Nuevo Apunte de Estudio',
      content: sampleContent,
      tags: 'apuntes,estudio',
      is_pinned: false
    };

    // ⚡ INSTANT OPTIMISTIC CREATION IN UI (0 ms)
    this.pages.unshift(tempPage);
    this.selectedPage = tempPage;
    this.blocks = this.parseContentToBlocks(tempPage.content || '');
    this.showToast('Apunte creado exitosamente');

    this.libraryService.createPage({
      notebook_id: this.selectedNotebook.id,
      title: tempPage.title,
      content: tempPage.content,
      tags: tempPage.tags,
      is_pinned: false
    }).subscribe({
      next: (res) => {
        if (res.ok && res.data) {
          const idx = this.pages.findIndex(p => p.id === tempId);
          
          const currentTitle = (this.selectedPage && this.selectedPage.id === tempId) ? this.selectedPage.title : tempPage.title;
          const currentContent = (this.selectedPage && this.selectedPage.id === tempId) ? this.selectedPage.content : tempPage.content;
          const currentTags = (this.selectedPage && this.selectedPage.id === tempId) ? this.selectedPage.tags : tempPage.tags;

          const mergedPage: NotebookPage = {
            ...res.data,
            title: currentTitle,
            content: currentContent,
            tags: currentTags
          };

          if (idx !== -1) {
            this.pages[idx] = mergedPage;
          }
          if (this.selectedPage && this.selectedPage.id === tempId) {
            this.selectedPage = mergedPage;
            if (currentTitle !== res.data.title || currentContent !== res.data.content) {
              this.autoSavePage();
            }
          }
          this.saveStateInLocalStorage();
        }
      },
      error: () => {
        this.pages = this.pages.filter(p => p.id !== tempId);
        if (this.selectedPage?.id === tempId) {
          this.selectedPage = this.pages.length > 0 ? this.pages[0] : null;
        }
        this.showToast('Error al crear apunte en servidor', 'error');
      }
    });
  }

  autoSavePage() {
    if (!this.selectedPage || !this.selectedPage.id || typeof this.selectedPage.id === 'number' && this.selectedPage.id > 1000000000000) return;
    this.libraryService.updatePage(this.selectedPage.id, {
      title: this.selectedPage.title,
      content: this.selectedPage.content,
      tags: this.selectedPage.tags,
      is_pinned: this.selectedPage.is_pinned
    }).subscribe({
      error: (err) => console.error('Error autoguardando apunte:', err)
    });
  }

  togglePinPage(page: NotebookPage) {
    if (!page.id) return;
    page.is_pinned = !page.is_pinned;
    this.libraryService.updatePage(page.id, { is_pinned: page.is_pinned }).subscribe(() => {
      this.showToast(page.is_pinned ? 'Apunte fijado al inicio' : 'Apunte desfijado');
      if (this.selectedNotebook?.id) this.loadPages(this.selectedNotebook.id);
    });
  }

  // ── NOTION SLASH COMMANDS MENU WITH ARROW + ENTER NAVIGATION ────
  onTextareaInput(e: any) {
    this.autoSavePage();
  }

  onTextareaKeydown(event: KeyboardEvent) {
    if (!this.showSlashMenu) return;

    const list = this.filteredSlashCommands;
    if (list.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.slashSelectedIndex = (this.slashSelectedIndex + 1) % list.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.slashSelectedIndex = (this.slashSelectedIndex - 1 + list.length) % list.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selectedItem = list[this.slashSelectedIndex];
      if (selectedItem) {
        this.executeSlashCommand(selectedItem.key);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.showSlashMenu = false;
    }
  }

  executeSlashCommand(cmdKey: string) {
    if (cmdKey === 'columnas') {
      if (this.activeBlockId) {
        const targetBlock = this.blocks.find(b => b.id === this.activeBlockId);
        if (targetBlock) {
          this.convertToColumns(targetBlock);
        } else {
          this.addBlock('columnas');
        }
      } else {
        this.addBlock('columnas');
      }
      this.showSlashMenu = false;
      this.slashMenuQuery = '';
      this.slashSelectedIndex = 0;
      return;
    }

    const validTypes: ('titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto')[] = [
      'titulo', 'subtitulo', 'codigo', 'alerta', 'texto'
    ];
    const targetType = validTypes.includes(cmdKey as any) ? (cmdKey as 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto') : 'texto';

    if (this.activeBlockId) {
      const targetBlock = this.blocks.find(b => b.id === this.activeBlockId);
      if (targetBlock) {
        if (targetBlock.content.startsWith('/')) {
          targetBlock.content = targetBlock.content.substring(1);
        }
        targetBlock.type = targetType;
      } else {
        this.addBlock(targetType);
      }
    } else {
      this.addBlock(targetType);
    }

    this.showSlashMenu = false;
    this.slashMenuQuery = '';
    this.slashSelectedIndex = 0;
    this.syncBlocksToContent();
  }

  // ── CONFIRMATION DELETE MODAL HELPERS ─────────────────────────
  openDeleteModal(type: 'folder' | 'notebook' | 'page', item: any) {
    this.deleteTargetType = type;
    this.deleteItemRef = item;
    if (type === 'folder') this.deleteItemTitle = item.name;
    else if (type === 'notebook') this.deleteItemTitle = item.title;
    else if (type === 'page') this.deleteItemTitle = item.title;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deleteTargetType = null;
    this.deleteItemTitle = '';
    this.deleteItemRef = null;
  }

  executeDelete() {
    if (!this.deleteTargetType || !this.deleteItemRef) return;

    if (this.deleteTargetType === 'folder') {
      const folder = this.deleteItemRef as NotebookFolder;
      if (!folder.id) return;
      this.libraryService.deleteFolder(folder.id).subscribe({
        next: () => {
          this.loadFolders();
          this.showToast('Carpeta eliminada permanentemente');
          this.closeDeleteModal();
        },
        error: () => this.showToast('Error al eliminar la carpeta', 'error')
      });

    } else if (this.deleteTargetType === 'notebook') {
      const nb = this.deleteItemRef as NotebookModule;
      if (!nb.id) return;
      this.libraryService.deleteNotebook(nb.id).subscribe({
        next: () => {
          if (this.selectedFolder?.id) this.loadNotebooks(this.selectedFolder.id);
          this.showToast('Cuaderno eliminado permanentemente');
          this.closeDeleteModal();
        },
        error: () => this.showToast('Error al eliminar el cuaderno', 'error')
      });

    } else if (this.deleteTargetType === 'page') {
      const page = this.deleteItemRef as NotebookPage;
      if (!page.id) return;
      this.libraryService.deletePage(page.id).subscribe({
        next: () => {
          this.pages = this.pages.filter(p => p.id !== page.id);
          if (this.selectedPage?.id === page.id) {
            this.selectedPage = null;
            this.blocks = [];
            this.activeBlockId = null;
          }
          this.showToast('Apunte eliminado correctamente');
          this.closeDeleteModal();
        },
        error: () => this.showToast('Error al eliminar el apunte', 'error')
      });
    }
  }

  // ── MODAL CARPETAS ──────────────────────────────────────────────
  openFolderModal(folder?: NotebookFolder) {
    if (folder && folder.id) {
      this.editingFolderId = folder.id;
      this.folderForm = {
        name: folder.name,
        description: folder.description || '',
        color: folder.color || '#10b981',
        icon: folder.icon || 'folder'
      };
    } else {
      this.editingFolderId = null;
      this.folderForm = { name: '', description: '', color: '#10b981', icon: 'folder' };
    }
    this.isFolderModalOpen = true;
  }

  selectFolderColor(color: string) {
    this.folderForm.color = color;
  }

  selectFolderIcon(icon: string) {
    this.folderForm.icon = icon;
  }

  saveFolder() {
    if (!this.folderForm.name.trim()) {
      this.showToast('Ingresa un nombre para la carpeta', 'error');
      return;
    }

    if (this.editingFolderId) {
      this.libraryService.updateFolder(this.editingFolderId, this.folderForm).subscribe({
        next: (res) => {
          if (res.ok) {
            this.loadFolders();
            this.isFolderModalOpen = false;
            this.showToast('Carpeta actualizada');
          }
        }
      });
    } else {
      this.libraryService.createFolder(this.folderForm).subscribe({
        next: (res) => {
          if (res.ok) {
            this.loadFolders();
            this.isFolderModalOpen = false;
            this.showToast('Carpeta creada exitosamente');
          }
        }
      });
    }
  }

  // ── MODAL CUADERNOS ──────────────────────────────────────────────
  openNotebookModal(notebook?: NotebookModule) {
    if (notebook && notebook.id) {
      this.editingNotebookId = notebook.id;
      this.notebookForm = {
        title: notebook.title,
        description: notebook.description || '',
        color: notebook.color || '#3b82f6',
        icon: notebook.icon || 'book'
      };
    } else {
      this.editingNotebookId = null;
      this.notebookForm = { title: '', description: '', color: '#3b82f6', icon: 'book' };
    }
    this.isNotebookModalOpen = true;
  }

  selectNotebookColor(color: string) {
    this.notebookForm.color = color;
  }

  selectNotebookIcon(icon: string) {
    this.notebookForm.icon = icon;
  }

  saveNotebook() {
    if (!this.notebookForm.title.trim() || !this.selectedFolder?.id) {
      this.showToast('Ingresa un título para el cuaderno', 'error');
      return;
    }

    if (this.editingNotebookId) {
      this.libraryService.updateNotebook(this.editingNotebookId, this.notebookForm).subscribe({
        next: (res) => {
          if (res.ok && this.selectedFolder?.id) {
            this.loadNotebooks(this.selectedFolder.id);
            this.isNotebookModalOpen = false;
            this.showToast('Cuaderno actualizado');
          }
        }
      });
    } else {
      const data = { ...this.notebookForm, folder_id: this.selectedFolder.id };
      this.libraryService.createNotebook(data).subscribe({
        next: (res) => {
          if (res.ok && this.selectedFolder?.id) {
            this.loadNotebooks(this.selectedFolder.id);
            this.isNotebookModalOpen = false;
            this.showToast('Cuaderno creado exitosamente');
          }
        }
      });
    }
  }

  toggleFavoriteNotebook(nb: NotebookModule) {
    if (!nb.id) return;
    nb.is_favorite = !nb.is_favorite;
    this.libraryService.updateNotebook(nb.id, { is_favorite: nb.is_favorite }).subscribe({
      next: () => this.showToast(nb.is_favorite ? 'Agregado a favoritos' : 'Removido de favoritos')
    });
  }

  // ── BUSCADOR & UTILIDADES ───────────────────────────────────────
  onSearchInput() {
    if (this.searchQuery.trim().length === 0) {
      this.searchResults = [];
      return;
    }
    this.libraryService.search(this.searchQuery).subscribe({
      next: (res) => {
        if (res.ok) this.searchResults = res.data;
      }
    });
  }

  selectSearchResult(item: any) {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedFolder = { id: item.folder_id, name: item.folder_name, color: '#10b981', icon: 'folder' };
    this.selectedNotebook = { id: item.notebook_id, folder_id: item.folder_id, title: item.notebook_title, color: item.notebook_color || '#3b82f6', icon: 'book' };
    this.loadPages(item.notebook_id, item.page_id);
    this.saveStateInLocalStorage();
  }

  goToBreadcrumb(target: 'root' | 'folder') {
    if (target === 'root') {
      this.selectedFolder = null;
      this.selectedNotebook = null;
      this.selectedPage = null;
      this.saveStateInLocalStorage();
      this.loadFolders();
    } else if (target === 'folder') {
      this.selectedNotebook = null;
      this.selectedPage = null;
      this.saveStateInLocalStorage();
      if (this.selectedFolder?.id) this.loadNotebooks(this.selectedFolder.id);
    }
  }

  getTagsArray(tagsStr?: string): string[] {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  }

  exportPageToMarkdown() {
    if (!this.selectedPage) return;
    const blob = new Blob([this.selectedPage.content || ''], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${this.selectedPage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    this.showToast('Archivo Markdown exportado');
  }

  printPage() {
    window.print();
  }

  getNotebookColor(): string {
    return this.selectedNotebook?.color || '#737373';
  }

  formatMarkdown(content: string, darkTheme: boolean = this.isDark): string {
    if (!content) return '';
    const headingTextClass = darkTheme ? 'text-white' : 'text-neutral-900';
    const borderClass = darkTheme ? 'border-neutral-800/80' : 'border-neutral-200';
    const codeBgClass = darkTheme ? 'bg-[#09090b]' : 'bg-neutral-100 text-neutral-900';
    const codeTextClass = darkTheme ? 'text-neutral-200 font-bold' : 'text-neutral-800 font-bold';

    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings (COMPACT & ELEGANT NOTION SPACING WITH DYNAMIC DARK/LIGHT TEXT COLOR)
    html = html.replace(/^### (.*$)/gim, `<h3 class="text-base sm:text-lg font-bold mt-2.5 mb-1 ${headingTextClass} font-headline">$1</h3>`);
    html = html.replace(/^## (.*$)/gim, `<h2 class="text-lg sm:text-xl font-bold mt-3 mb-1.5 pb-1 border-b ${borderClass} font-headline ${headingTextClass}">$1</h2>`);
    html = html.replace(/^# (.*$)/gim, `<h1 class="text-xl sm:text-2xl font-black mt-4 mb-2 ${headingTextClass} font-headline tracking-tight border-b pb-1 ${borderClass}">$1</h1>`);

    // Horizontal Divider ---
    html = html.replace(/^---$/gim, `<hr class="my-3 ${borderClass}">`);

    // Red Highlight / Text Color (<red>...</red> o [red]...[/red])
    html = html.replace(/<red>(.*?)<\/red>/gim, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
    html = html.replace(/\[red\](.*?)\[\/red\]/gim, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
    html = html.replace(/&lt;red&gt;(.*?)&lt;\/red&gt;/gim, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');
    html = html.replace(/&lt;\[red\]&gt;(.*?)&lt;\[\/red\]&gt;/gim, '<span class="text-red-500 font-bold" style="color: #ef4444 !important;">$1</span>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold ${headingTextClass}">$1</strong>`);
    html = html.replace(/\*(.*?)\*/g, '<em class="italic opacity-80">$1</em>');

    // Callouts / Blockquotes
    html = html.replace(/^> (.*$)/gim, `<blockquote class="p-3 my-2 rounded-xl bg-neutral-800/40 border-l-4 border-neutral-600 text-xs sm:text-sm ${headingTextClass} font-medium flex items-start gap-2 shadow-sm">$1</blockquote>`);

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, `<pre class="p-4 my-2.5 rounded-xl ${codeBgClass} border ${borderClass} ${codeTextClass} font-mono text-xs sm:text-sm overflow-x-auto shadow-inner relative group"><code>$2</code></pre>`);

    // Checkboxes
    html = html.replace(/- \[ \]/g, ' <input type="checkbox" disabled class="mr-2 rounded text-neutral-500 w-3.5 h-3.5">');
    html = html.replace(/- \[x\]/g, ' <input type="checkbox" checked disabled class="mr-2 rounded text-neutral-500 w-3.5 h-3.5">');

    // Line breaks conversion
    html = html.replace(/\n/g, '<br>');

    // Clean up excess breaks surrounding block elements (<h1-3>, <blockquote>, <pre>, <hr>)
    html = html.replace(/(<\/h[1-3]>|<\/blockquote>|<\/pre>|<hr[^>]*>)\s*(<br\s*\/?>)+/gim, '$1');
    html = html.replace(/(<br\s*\/?>)+\s*(<h[1-3]>|<blockquote|<pre|<hr)/gim, '$2');
    html = html.replace(/(<br\s*\/?>){3,}/gim, '<br><br>');

    return html;
  }

  // ════════════════════════════════════════════════════════
  // GROQ AI INTEGRATION METHODS (Bloque e IA Flotante)
  // ════════════════════════════════════════════════════════

  toggleAiBlockMenu(blockId: string, event: Event, targetColIndex?: number) {
    event.stopPropagation();
    if (this.activeAiBlockId === blockId && this.activeAiTargetColIndex === (targetColIndex ?? null)) {
      this.activeAiBlockId = null;
      this.activeAiTargetColIndex = null;
    } else {
      this.activeAiBlockId = blockId;
      this.activeAiTargetColIndex = targetColIndex ?? null;
    }
    this.activeTypeMenuBlockId = null;
    this.aiCustomInstruction = '';
    this.aiResultPreview = '';
    this.aiError = '';
  }

  applyAiTransform(block: NoteBlock, presetInstruction: string) {
    const instruction = presetInstruction || this.aiCustomInstruction.trim();
    if (!instruction) return;

    this.isAiLoading = true;
    this.aiResultPreview = '';
    this.aiError = '';

    let contentToSend = block.content || '';
    let blockTypeToSend = block.type;

    if (block.type === 'columnas' && block.columns) {
      if (this.activeAiTargetColIndex !== null && block.columns[this.activeAiTargetColIndex]) {
        const targetCol = block.columns[this.activeAiTargetColIndex];
        contentToSend = targetCol.content || '';
        blockTypeToSend = targetCol.type || 'codigo';
      } else {
        const c1 = block.columns[0];
        const c2 = block.columns[1];
        contentToSend = `[COLUMNA IZQUIERDA (${c1?.type || 'texto'}${c1?.language ? ' ' + c1.language : ''})]:\n${c1?.content || ''}\n\n[COLUMNA DERECHA (${c2?.type || 'texto'}${c2?.language ? ' ' + c2.language : ''})]:\n${c2?.content || ''}`;
      }
    }

    this.libraryAiService.transformBlockContent(contentToSend, blockTypeToSend, instruction).subscribe(res => {
      this.isAiLoading = false;
      if (res.success) {
        this.aiResultPreview = res.result;
      } else {
        this.aiError = res.error || 'No se pudo procesar la solicitud con la IA.';
        this.showToast(this.aiError, 'error');
      }
    });
  }

  replaceBlockContentWithAi(block: NoteBlock, targetColIndex?: number) {
    if (!this.aiResultPreview) return;
    const colIdx = targetColIndex !== undefined ? targetColIndex : this.activeAiTargetColIndex;

    if (block.type === 'columnas' && block.columns) {
      if (colIdx !== null && colIdx !== undefined && block.columns[colIdx]) {
        // Update specific target column
        block.columns[colIdx].content = this.aiResultPreview;
        if (this.aiResultPreview.startsWith('|') && this.aiResultPreview.includes('-|')) {
          block.columns[colIdx].type = 'codigo';
          if (!block.columns[colIdx].language) block.columns[colIdx].language = 'sql';
        } else if (this.aiResultPreview.startsWith('```')) {
          block.columns[colIdx].type = 'codigo';
        }
        this.showToast(`Columna ${colIdx + 1} actualizada con IA`);
      } else {
        // Check if AI output formatted both columns
        if (this.aiResultPreview.includes('[COLUMNA IZQUIERDA') || this.aiResultPreview.includes('[COLUMNA DERECHA')) {
          const parts = this.aiResultPreview.split(/\[COLUMNA DERECHA[^\]]*\]:?/i);
          if (parts.length >= 2) {
            const leftText = parts[0].replace(/\[COLUMNA IZQUIERDA[^\]]*\]:?/i, '').trim();
            const rightText = parts[1].trim();
            block.columns[0].content = leftText;
            block.columns[1].content = rightText;
            this.showToast('Ambas columnas actualizadas con IA');
          }
        } else {
          // Default to first column or column 2 if column 1 has content
          const destCol = (block.columns[0].content && !block.columns[1].content) ? 1 : 0;
          block.columns[destCol].content = this.aiResultPreview;
          if (this.aiResultPreview.startsWith('|')) {
            block.columns[destCol].type = 'codigo';
            if (!block.columns[destCol].language) block.columns[destCol].language = 'sql';
          }
          this.showToast(`Columna ${destCol + 1} actualizada con IA`);
        }
      }
    } else {
      block.content = this.aiResultPreview;
      // Auto detect block type if AI generated a Markdown table or Code
      if (this.aiResultPreview.startsWith('|') && this.aiResultPreview.includes('-|')) {
        block.type = 'codigo';
      } else if (this.aiResultPreview.startsWith('```')) {
        block.type = 'codigo';
      }
      this.showToast('Contenido actualizado por la IA');
    }

    this.activeAiBlockId = null;
    this.activeAiTargetColIndex = null;
    this.aiResultPreview = '';
    this.syncBlocksToContent();
  }

  insertAiResultAsNewBlock(blockIndex: number) {
    if (!this.aiResultPreview) return;
    
    let blockType: 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto' = 'texto';
    if (this.aiResultPreview.startsWith('|') && this.aiResultPreview.includes('-|')) {
      blockType = 'codigo';
    } else if (this.aiResultPreview.startsWith('```')) {
      blockType = 'codigo';
    }

    const newBlock: NoteBlock = {
      id: 'block-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: blockType,
      content: this.aiResultPreview
    };

    this.blocks.splice(blockIndex + 1, 0, newBlock);
    this.activeAiBlockId = null;
    this.aiResultPreview = '';
    this.syncBlocksToContent();
    this.showToast('Nuevo bloque insertado por la IA');
  }

  // Copilot Assistant Methods
  toggleCopilot() {
    this.isCopilotOpen = !this.isCopilotOpen;
    if (this.isCopilotOpen) {
      this.scrollToBottomCopilot();
    }
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
          content: '¡Hola! Soy **RotBot Apuntes IA**. ¿En qué puedo ayudarte a resumir, explicar o estructurar tus notas de estudio hoy?'
        }
      ];
      this.saveCopilotChatToStorage();
      this.scrollToBottomCopilot();
    }, 300);

    setTimeout(() => {
      this.copilotOverlayOpacity = '0';
      setTimeout(() => {
        this.showCopilotResetOverlay = false;
        this.isResettingCopilot = false;
      }, 500);
    }, 1600);
  }

  formatCopilotMessage(content: string): string {
    if (!content) return '';
    
    // 1. Escapar caracteres HTML especiales
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Formatear encabezados markdown (###, ##, #)
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs sm:text-sm font-bold mt-2 mb-1 text-blue-500">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-sm sm:text-base font-bold mt-2 mb-1 text-blue-500">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-base sm:text-lg font-extrabold mt-2 mb-1 text-blue-500">$1</h1>');

    // 3. Separadores horizontales (--- o ***)
    html = html.replace(/^---+$/gm, '<hr class="my-2 border-neutral-200 dark:border-neutral-700/80">');

    // 4. Formatear **texto en negrilla** -> negrilla con color azul destacado
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-600 dark:text-blue-400">$1</strong>');

    // 5. Formatear *texto en cursiva/destacado* -> texto semi-negrilla azul
    html = html.replace(/\*(.*?)\*/g, '<span class="font-semibold text-blue-600 dark:text-blue-400">$1</span>');

    // 6. Limpiar cualquier asterisco suelto sobrante
    html = html.replace(/\*/g, '');

    // 7. Convertir saltos de línea \n a <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  focusCopilotInput() {
    setTimeout(() => {
      if (this.copilotTextareaElement?.nativeElement) {
        this.copilotTextareaElement.nativeElement.focus();
      }
    }, 50);
  }

  scrollToBottomCopilot() {
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
    this.saveCopilotChatToStorage();
    this.copilotInput = '';
    if (this.copilotTextareaElement?.nativeElement) {
      this.copilotTextareaElement.nativeElement.style.height = 'auto';
    }
    this.focusCopilotInput();
    this.isCopilotLoading = true;
    this.scrollToBottomCopilot();

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
        this.showToast(errorText, 'error');
      }
      this.saveCopilotChatToStorage();
      this.scrollToBottomCopilot();
      this.focusCopilotInput();
    });
  }

  // ── COPILOT DRAG & RESIZE LOGIC ─────────────────────────────
  copilotWidth = 400;
  isDraggingCopilot = false;
  isResizingCopilot = false;
  copilotPos = { x: 0, y: 0 };
  isCopilotCustomPositioned = false;
  private dragStartOffset = { x: 0, y: 0 };
  private resizeStartX = 0;
  private resizeStartWidth = 400;

  startResizeCopilot(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.isResizingCopilot = true;
    this.resizeStartX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.resizeStartWidth = this.copilotWidth;
  }

  toggleCopilotWidthPreset() {
    if (this.copilotWidth < 500) {
      this.copilotWidth = 650;
    } else if (this.copilotWidth < 760) {
      this.copilotWidth = 840;
    } else {
      this.copilotWidth = 400;
    }
    try {
      localStorage.setItem('portalink_copilot_width', String(this.copilotWidth));
    } catch {}
  }

  startDragCopilot(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    this.isDraggingCopilot = true;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const chatEl = document.querySelector('.chat-panel') as HTMLElement;
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
  onDragCopilotMove(event: MouseEvent | TouchEvent) {
    if (this.isResizingCopilot) {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const deltaX = this.resizeStartX - clientX; // Arrastrar hacia la izquierda incrementa el ancho
      const minW = 360;
      const maxW = Math.min(window.innerWidth - 30, 920);
      const newWidth = Math.max(minW, Math.min(this.resizeStartWidth + deltaX, maxW));
      this.copilotWidth = newWidth;
      try {
        localStorage.setItem('portalink_copilot_width', String(newWidth));
      } catch {}
      return;
    }

    if (!this.isDraggingCopilot) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const chatEl = document.querySelector('.chat-panel') as HTMLElement;
    const chatWidth = chatEl ? chatEl.offsetWidth : this.copilotWidth;
    const chatHeight = chatEl ? chatEl.offsetHeight : 630;

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
  onDragCopilotEnd() {
    this.isDraggingCopilot = false;
    this.isResizingCopilot = false;
  }
}
