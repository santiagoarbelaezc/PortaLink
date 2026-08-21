import { Component, Input, OnInit, ViewChild, ElementRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibraryService, NotebookFolder, NotebookModule, NotebookPage } from '../../../services/library.service';
import { LibraryAiService } from '../../../services/library-ai.service';

export interface SlashCommandItem {
  key: string;
  title: string;
  desc: string;
  icon: string;
}

export interface NoteBlock {
  id: string;
  type: 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto';
  content: string;
  language?: string;
}

@Component({
  selector: 'app-dash-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dash-library.component.html'
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

  // Block-level AI action state
  activeAiBlockId: string | null = null;
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

  toggleBlockTypeMenu(blockId: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.activeTypeMenuBlockId = (this.activeTypeMenuBlockId === blockId) ? null : blockId;
  }

  selectBlockType(block: NoteBlock, newType: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.changeBlockType(block, newType);
    this.activeTypeMenuBlockId = null;
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalTypeMenuKeydown(event: KeyboardEvent) {
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
      case 'codigo': return 'Código';
      case 'alerta': return 'Alerta';
      case 'texto': return 'Texto Normal';
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
    { key: 'codigo', title: 'Código', desc: 'Bloque de código formateado', icon: '</>' },
    { key: 'alerta', title: 'Alerta / Nota', desc: 'Caja destacada con consejo o idea', icon: '!' },
    { key: 'texto', title: 'Texto normal', desc: 'Párrafo de texto libre', icon: 'T' }
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
    this.loadFolders();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMessage === msg) this.toastMessage = '';
    }, 3500);
  }

  saveStateInLocalStorage() {
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
    const savedFolderId = localStorage.getItem('portalink_lib_folder_id');
    const savedNotebookId = localStorage.getItem('portalink_lib_notebook_id');
    const savedPageId = localStorage.getItem('portalink_lib_page_id');

    if (!savedFolderId) return;
    const folderId = parseInt(savedFolderId, 10);
    const folder = this.folders.find(f => f.id === folderId);

    if (folder) {
      this.selectedFolder = folder;

      if (!savedNotebookId) return;
      const notebookId = parseInt(savedNotebookId, 10);

      this.libraryService.getNotebooks(folderId).subscribe({
        next: (res) => {
          if (res.ok) {
            this.notebooks = res.data;
            const nb = this.notebooks.find(n => n.id === notebookId);
            if (nb) {
              this.selectedNotebook = nb;
              const targetPageId = savedPageId ? parseInt(savedPageId, 10) : undefined;
              this.loadPages(notebookId, targetPageId);
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

    if (event.key === 'Enter') {
      if (block.type === 'titulo' || block.type === 'subtitulo') {
        if (!event.shiftKey) {
          event.preventDefault();
          this.addBlock('texto', index);
        }
      } else if (block.type === 'texto' || block.type === 'alerta') {
        if (!event.shiftKey && block.content.trim() === '') {
          event.preventDefault();
          this.addBlock('texto', index);
        }
      }
    } else if (event.key === 'Backspace' && block.content === '' && this.blocks.length > 1) {
      event.preventDefault();
      this.removeBlock(index);
    }
  }

  addBlock(type: string, index?: number) {
    const validTypes: ('titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto')[] = [
      'titulo', 'subtitulo', 'codigo', 'alerta', 'texto'
    ];
    const blockType = validTypes.includes(type as any) ? (type as 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto') : 'texto';

    const newBlock: NoteBlock = {
      id: this.generateBlockId(),
      type: blockType,
      content: blockType === 'codigo' ? '// Tu código aquí\n' : '',
      language: blockType === 'codigo' ? 'typescript' : undefined
    };

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
      language: target.language
    };
    this.blocks.splice(index + 1, 0, clone);
    this.syncBlocksToContent();
  }

  changeBlockType(block: NoteBlock, newType: string) {
    const validTypes: ('titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto')[] = [
      'titulo', 'subtitulo', 'codigo', 'alerta', 'texto'
    ];
    block.type = validTypes.includes(newType as any) ? (newType as 'titulo' | 'subtitulo' | 'codigo' | 'alerta' | 'texto') : 'texto';
    if (block.type === 'codigo' && !block.language) {
      block.language = 'typescript';
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
            this.selectedPage = this.pages.length > 0 ? this.pages[0] : null;
          }
          this.showToast('Apunte eliminado permanentemente');
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
    return this.selectedNotebook?.color || '#10b981';
  }

  formatMarkdown(content: string, darkTheme: boolean = this.isDark): string {
    if (!content) return '';
    const headingTextClass = darkTheme ? 'text-white' : 'text-neutral-900';
    const borderClass = darkTheme ? 'border-neutral-800/80' : 'border-neutral-200';
    const codeBgClass = darkTheme ? 'bg-[#09090b]' : 'bg-neutral-100 text-neutral-900';
    const codeTextClass = darkTheme ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold';

    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings (COMPACT & ELEGANT NOTION SPACING WITH DYNAMIC DARK/LIGHT TEXT COLOR)
    html = html.replace(/^### (.*$)/gim, `<h3 class="text-base sm:text-lg font-bold mt-2.5 mb-1 text-emerald-500 font-headline">$1</h3>`);
    html = html.replace(/^## (.*$)/gim, `<h2 class="text-lg sm:text-xl font-bold mt-3 mb-1.5 pb-1 border-b ${borderClass} font-headline ${headingTextClass}">$1</h2>`);
    html = html.replace(/^# (.*$)/gim, `<h1 class="text-xl sm:text-2xl font-black mt-4 mb-2 ${headingTextClass} font-headline tracking-tight border-b pb-1 border-emerald-500/30">$1</h1>`);

    // Horizontal Divider ---
    html = html.replace(/^---$/gim, `<hr class="my-3 ${borderClass}">`);

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-emerald-500">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic opacity-80">$1</em>');

    // Callouts / Blockquotes
    html = html.replace(/^> (.*$)/gim, `<blockquote class="p-3 my-2 rounded-xl bg-emerald-500/10 border-l-4 border-emerald-500 text-xs sm:text-sm ${headingTextClass} font-medium flex items-start gap-2 shadow-sm">$1</blockquote>`);

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, `<pre class="p-4 my-2.5 rounded-xl ${codeBgClass} border ${borderClass} ${codeTextClass} font-mono text-xs sm:text-sm overflow-x-auto shadow-inner relative group"><code>$2</code></pre>`);

    // Checkboxes
    html = html.replace(/- \[ \]/g, ' <input type="checkbox" disabled class="mr-2 rounded text-emerald-500 w-3.5 h-3.5">');
    html = html.replace(/- \[x\]/g, ' <input type="checkbox" checked disabled class="mr-2 rounded text-emerald-500 w-3.5 h-3.5">');

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

  toggleAiBlockMenu(blockId: string, event: Event) {
    event.stopPropagation();
    this.activeAiBlockId = this.activeAiBlockId === blockId ? null : blockId;
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

    this.libraryAiService.transformBlockContent(block.content, block.type, instruction).subscribe(res => {
      this.isAiLoading = false;
      if (res.success) {
        this.aiResultPreview = res.result;
      } else {
        this.aiError = res.error || 'No se pudo procesar la solicitud con la IA.';
      }
    });
  }

  replaceBlockContentWithAi(block: NoteBlock) {
    if (!this.aiResultPreview) return;
    block.content = this.aiResultPreview;
    
    // Auto detect block type if AI generated a Markdown table or Code
    if (this.aiResultPreview.startsWith('|') && this.aiResultPreview.includes('-|')) {
      block.type = 'codigo';
    } else if (this.aiResultPreview.startsWith('```')) {
      block.type = 'codigo';
    }

    this.activeAiBlockId = null;
    this.aiResultPreview = '';
    this.syncBlocksToContent();
    this.showToast('Contenido actualizado por la IA');
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

    // 2. Formatear **texto en negrilla** -> negrilla con color azul destacado
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-600 dark:text-blue-400">$1</strong>');

    // 3. Formatear *texto en cursiva/destacado* -> texto semi-negrilla azul
    html = html.replace(/\*(.*?)\*/g, '<span class="font-semibold text-blue-600 dark:text-blue-400">$1</span>');

    // 4. Limpiar cualquier asterisco suelto sobrante
    html = html.replace(/\*/g, '');

    // 5. Convertir saltos de línea \n a <br>
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
    this.libraryAiService.askCopilot(text, this.selectedPage?.title, historyPayload).subscribe(res => {
      this.isCopilotLoading = false;
      if (res.success) {
        this.copilotMessages.push({ role: 'assistant', content: res.result });
      } else {
        this.copilotMessages.push({ role: 'assistant', content: '❌ Error: ' + (res.error || 'No se pudo obtener respuesta de la IA.') });
      }
      this.saveCopilotChatToStorage();
      this.scrollToBottomCopilot();
      this.focusCopilotInput();
    });
  }

  // ── COPILOT DRAG & KEYBOARD LOGIC ─────────────────────────────
  isDraggingCopilot = false;
  copilotPos = { x: 0, y: 0 };
  isCopilotCustomPositioned = false;
  private dragStartOffset = { x: 0, y: 0 };

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
    if (!this.isDraggingCopilot) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const chatEl = document.querySelector('.chat-panel') as HTMLElement;
    const chatWidth = chatEl ? chatEl.offsetWidth : 400;
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
  }
}
