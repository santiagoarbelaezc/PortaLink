import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CopilotMarkdownService {
  private sanitizer = inject(DomSanitizer, { optional: true });
  private htmlCache = new Map<string, SafeHtml>();

  /**
   * Limpia o sanitiza caracteres HTML especiales
   */
  escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Formatea el contenido Markdown a SafeHtml con caché de rendimiento
   */
  format(content: string, darkTheme: boolean = true): SafeHtml {
    if (!content) return '';
    const cacheKey = `${darkTheme ? 'dark' : 'light'}_${content}`;
    const cached = this.htmlCache.get(cacheKey);
    if (cached) return cached;

    if (this.htmlCache.size > 250) {
      this.htmlCache.clear();
    }

    const htmlString = this.parse(content, darkTheme);
    const safeHtml = this.sanitizer 
      ? this.sanitizer.bypassSecurityTrustHtml(htmlString) 
      : (htmlString as unknown as SafeHtml);
    this.htmlCache.set(cacheKey, safeHtml);
    return safeHtml;
  }

  /**
   * Formatea el contenido inline (negrita, cursiva, enlaces, <br>) dentro de celdas de tabla
   */
  private formatCellContent(cell: string, darkTheme: boolean): string {
    if (!cell) return '';
    const headingTextClass = darkTheme ? 'text-white' : 'text-neutral-900';
    const italicTextClass = darkTheme ? 'text-neutral-200' : 'text-neutral-800';

    // Preservar etiquetas <br> que el modelo pueda incluir dentro de celdas
    let formatted = cell.replace(/<br\s*\/?>/gi, '__COPILOT_CELL_BR__');

    // Escapar HTML especial
    formatted = this.escapeHtml(formatted);

    // Negrita: **texto**
    formatted = formatted.replace(/\*\*((?:[^*\n]|\*(?!\*))+?)\*\*/g, `<strong class="font-bold ${headingTextClass}">$1</strong>`);

    // Cursiva: *texto* o _texto_ (sin coincidir con multiplicación ni placeholders __COPILOT_INLINE_X__)
    formatted = formatted.replace(/(?<=^|[\s(])\*(?!\s)([^*\n]+?)(?<!\s)\*(?=[.,!?;:\s)]|$)/g, `<em class="italic ${italicTextClass}">$1</em>`);
    formatted = formatted.replace(/(?<=^|[\s(])_(?!\s|_)([^_\n]+?)(?<!\s|_)_(?=[.,!?;:\s)]|$)/g, `<em class="italic ${italicTextClass}">$1</em>`);

    // Enlaces: [Texto](URL) — sanitizando comillas y caracteres de ruptura de atributo
    formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)"'<>]+)\)/g, (_m, label, url) => {
      const safeUrl = url.replace(/&quot;|&#39;|&lt;|&gt;|["'<>]/g, '');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-red-500 hover:text-red-600 dark:text-red-400 underline font-medium">${label}</a>`;
    });

    // Restaurar <br>
    formatted = formatted.replace(/__COPILOT_CELL_BR__/g, '<br>');

    return formatted;
  }

  /**
   * Parser Markdown especializado para las respuestas de RotBot Copilot
   */
  parse(content: string, darkTheme: boolean = true): string {
    if (!content) return '';

    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];
    const tables: string[] = [];

    // Constantes de estilo según el tema (Color secundario Rojo PortaLink)
    const headingTextClass = darkTheme ? 'text-white' : 'text-neutral-900';
    const subtitleClass = darkTheme ? 'text-red-500' : 'text-red-600';
    const borderClass = darkTheme ? 'border-neutral-800' : 'border-neutral-200';
    const inlineCodeClass = darkTheme 
      ? 'bg-neutral-800 text-red-400 border border-neutral-700/70' 
      : 'bg-neutral-200/90 text-red-600 border border-neutral-300/80';
    const listTextClass = darkTheme ? 'text-neutral-200' : 'text-neutral-800';

    // 0. Pre-procesar: normalizar saltos de línea, eliminar emojis/iconos decorativos y recortar espacios
    let text = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\p{Extended_Pictographic}\uFE0F\uFE0E\u20E3]\s*/gu, '') // Sin iconos ni emojis
      .replace(/^\n+/, '')   // eliminar líneas vacías al inicio
      .trimEnd();

    // 0b. Si el modelo envía entidades HTML literales (ej. &amp;, &lt;), decodificarlas
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // 1. Extraer bloques de código (```lang ... ```) - Escala tipográfica adaptada (13px - 14.5px)
    text = text.replace(/```([a-zA-Z0-9_\-+]*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
      const trimmedLang = (lang || '').trim().toLowerCase();
      const displayLang = trimmedLang || 'código';
      const rawCode = code.replace(/^\n+|\n+$/g, '');
      const escapedCode = this.escapeHtml(rawCode);
      const encoded = encodeURIComponent(rawCode);

      const blockHtml = `<div class="my-3 rounded-xl overflow-hidden border border-neutral-700/60 bg-[#0d0d11] shadow-md font-mono text-xs sm:text-sm text-neutral-200">` +
        `<div class="flex items-center justify-between px-3.5 py-1.5 bg-[#18181f] border-neutral-800 text-neutral-400 text-xs select-none">` +
          `<span class="font-sans font-semibold text-[11px] uppercase tracking-wider text-neutral-300">${displayLang}</span>` +
          `<button type="button" class="copilot-copy-code-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all text-xs font-sans cursor-pointer" data-code="${encoded}">` +
            `<svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` +
            `<span>Copiar</span>` +
          `</button>` +
        `</div>` +
        `<div class="p-3.5 overflow-x-auto text-neutral-100 font-mono text-[13px] sm:text-[14.5px] leading-relaxed whitespace-pre selection:bg-neutral-700 selection:text-white"><code>${escapedCode}</code></div>` +
      `</div>`;

      const placeholder = `__COPILOT_CODEBLOCK_${codeBlocks.length}__`;
      codeBlocks.push(blockHtml);
      return `\n\n${placeholder}\n\n`;
    });

    // 2. Extraer código inline (`código`) - Escala tipográfica 13px
    text = text.replace(/`([^`\n]+)`/g, (_match, inline) => {
      const escapedInline = this.escapeHtml(inline);
      const inlineHtml = `<code class="px-1.5 py-0.5 mx-0.5 rounded-md text-[13px] font-mono font-medium ${inlineCodeClass}">${escapedInline}</code>`;
      const placeholder = `__COPILOT_INLINE_${inlineCodes.length}__`;
      inlineCodes.push(inlineHtml);
      return placeholder;
    });

    // 3. Extraer tablas Markdown (con o sin pipes extremos, parseando formato inline dentro de cada celda)
    const tableRegex = /((?:^[ \t]*\|?[^\n|]+\|[^\n]+\n)(?:^[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*\n)(?:^[ \t]*\|?[^\n|]+\|[^\n]*(?:\n|$))+)/gm;
    text = text.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length >= 2) {
        const splitRow = (rowStr: string): string[] =>
          rowStr
            .replace(/^\s*\||\|\s*$/g, '')
            .split(/(?<!\\)\|/)
            .map(c => c.replace(/\\\|/g, '|').trim());

        const headerCols = splitRow(lines[0]);
        const colCount = headerCols.length;
        const bodyRows = lines.slice(2).map(row => {
          const cols = splitRow(row);
          if (cols.length > colCount) {
            return cols.slice(0, colCount);
          }
          while (cols.length < colCount) {
            cols.push('');
          }
          return cols;
        });

        const tableThBg = darkTheme ? 'bg-neutral-800/80 text-neutral-100 border-neutral-700' : 'bg-neutral-100 text-neutral-900 border-neutral-200';
        const tableBorder = darkTheme ? 'border-neutral-700' : 'border-neutral-200';
        const tableBodyText = darkTheme ? 'text-neutral-300' : 'text-neutral-700';
        const tableRowHover = darkTheme ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50';

        const tableHtml = `<div class="my-3 overflow-x-auto rounded-xl border ${borderClass} shadow-xs">` +
          `<table class="w-full text-left text-[13px] sm:text-[14.5px] border-collapse">` +
            `<thead class="${tableThBg} font-semibold border-b ${tableBorder}">` +
              `<tr>${headerCols.map(c => `<th class="px-3.5 py-2.5 align-top border-r last:border-r-0 ${tableBorder}">${this.formatCellContent(c, darkTheme)}</th>`).join('')}</tr>` +
            `</thead>` +
            `<tbody class="divide-y ${darkTheme ? 'divide-neutral-800' : 'divide-neutral-200'} ${tableBodyText}">` +
              bodyRows.map(row => 
                `<tr class="${tableRowHover}">${row.map(c => `<td class="px-3.5 py-2.5 align-top leading-relaxed border-r last:border-r-0 ${tableBorder}">${this.formatCellContent(c, darkTheme)}</td>`).join('')}</tr>`
              ).join('') +
            `</tbody>` +
          `</table>` +
        `</div>`;

        const placeholder = `__COPILOT_TABLE_${tables.length}__`;
        tables.push(tableHtml);
        return `\n\n${placeholder}\n\n`;
      }
      return match;
    });

    // 4. Escapar caracteres HTML en el texto restante
    text = this.escapeHtml(text);

    // 5. Encabezados (#, ##, ###) - Subtítulos rojos característicos de PortaLink
    text = text.replace(/^###[ \t]+(.*)$/gm, `<h3 class="text-[15px] sm:text-base font-bold mt-3 mb-1.5 ${subtitleClass} font-headline">$1</h3>`);
    text = text.replace(/^##[ \t]+(.*)$/gm, `<h2 class="text-base sm:text-[17px] font-bold mt-3.5 mb-2 pb-1 border-b ${borderClass} ${subtitleClass} font-headline">$1</h2>`);
    text = text.replace(/^#[ \t]+(.*)$/gm, `<h1 class="text-lg sm:text-[21px] font-extrabold mt-4 mb-2 ${subtitleClass} font-headline tracking-tight">$1</h1>`);

    // 6. Citas / Blockquotes
    text = text.replace(/^&gt;[ \t]+(.*)$/gm, `<blockquote class="my-2.5 pl-3 py-1 border-l-2 border-red-500 ${darkTheme ? 'bg-neutral-800/40 text-neutral-300' : 'bg-neutral-100 text-neutral-700'} rounded-r text-[13.5px] sm:text-[14.5px] italic">$1</blockquote>`);

    // 7. Separadores horizontales (--- o ***)
    text = text.replace(/^(?:---|___|----)$/gm, `<hr class="my-3 ${borderClass}">`);

    // 8. Texto en negrita: **texto** — permite asteriscos individuales adentro (ej. fórmulas) sin cruzar pares
    text = text.replace(/\*\*((?:[^*\n]|\*(?!\*))+?)\*\*/g, `<strong class="font-bold ${headingTextClass}">$1</strong>`);

    // 9. Texto en cursiva: *texto* o _texto_ (sin coincidir con operadores de multiplicación)
    text = text.replace(/(?<=^|[\s(])\*(?!\s)([^*\n]+?)(?<!\s)\*(?=[.,!?;:\s)]|$)/g, `<em class="italic ${darkTheme ? 'text-neutral-200' : 'text-neutral-800'}">$1</em>`);
    text = text.replace(/(?<=^|[\s(])_(?!\s)([^_\n]+?)(?<!\s)_(?=[.,!?;:\s)]|$)/g, `<em class="italic ${darkTheme ? 'text-neutral-200' : 'text-neutral-800'}">$1</em>`);

    // 10. Enlaces [Texto](URL) — sanitizando comillas y caracteres de ruptura de atributo
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)"'<>]+)\)/g, (_m, label, url) => {
      const safeUrl = url.replace(/&quot;|&#39;|&lt;|&gt;|["'<>]/g, '');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-red-500 hover:text-red-600 dark:text-red-400 underline font-medium">${label}</a>`;
    });

    // 11. Listas desordenadas y numeradas
    const lines = text.split('\n');
    const processedLines: string[] = [];
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^[\t ]*[-*•][ \t]+(.*)$/);
      const numMatch = line.match(/^[\t ]*(\d+)\.[ \t]+(.*)$/);

      if (bulletMatch) {
        if (!inUl) {
          if (inOl) { processedLines.push('</ol>'); inOl = false; }
          processedLines.push(`<ul class="my-2 ml-4 space-y-1 list-disc list-outside ${listTextClass}">`);
          inUl = true;
        }
        processedLines.push(`<li class="leading-relaxed">${bulletMatch[1]}</li>`);
      } else if (numMatch) {
        if (!inOl) {
          if (inUl) { processedLines.push('</ul>'); inUl = false; }
          processedLines.push(`<ol class="my-2 ml-4 space-y-1 list-decimal list-outside ${listTextClass}">`);
          inOl = true;
        }
        processedLines.push(`<li class="leading-relaxed">${numMatch[2]}</li>`);
      } else {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        if (inOl) { processedLines.push('</ol>'); inOl = false; }
        processedLines.push(line);
      }
    }
    if (inUl) processedLines.push('</ul>');
    if (inOl) processedLines.push('</ol>');

    text = processedLines.join('\n');

    // 12. Saltos de línea \n a <br>
    text = text.replace(/\n{2,}/g, '<br><br>');
    text = text.replace(/\n/g, '<br>');

    // Limpiar <br> redundantes alrededor de bloques
    text = text.replace(/(?:<br\s*\/?>)+(<(?:h[1-3]|ul|ol|li|blockquote|hr|div|table|tr|thead|tbody|th|td))/gi, '$1');
    text = text.replace(/(<\/(?:h[1-3]|ul|ol|li|blockquote|hr|div|table|tr|thead|tbody|th|td)>)(?:<br\s*\/?>)+/gi, '$1');
    text = text.replace(/(?:<br\s*\/?>)+(__COPILOT_(?:CODEBLOCK|TABLE)_\d+__)(?:<br\s*\/?>)+/g, '$1');
    text = text.replace(/(?:<br\s*\/?>)+(__COPILOT_(?:CODEBLOCK|TABLE)_\d+__)/g, '$1');
    text = text.replace(/(__COPILOT_(?:CODEBLOCK|TABLE)_\d+__)(?:<br\s*\/?>)+/g, '$1');

    // 13. Restaurar tablas (usando callback para evitar expansión de patrones $& o $' en código)
    tables.forEach((tableHtml, index) => {
      text = text.replace(`__COPILOT_TABLE_${index}__`, () => tableHtml);
    });

    // 14. Restaurar código inline
    inlineCodes.forEach((inlineHtml, index) => {
      text = text.replace(`__COPILOT_INLINE_${index}__`, () => inlineHtml);
    });

    // 15. Restaurar bloques de código
    codeBlocks.forEach((blockHtml, index) => {
      text = text.replace(`__COPILOT_CODEBLOCK_${index}__`, () => blockHtml);
    });

    return text.trim();
  }
}
