// Test script to verify Copilot Markdown parser behavior

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseCopilotMarkdown(content) {
  if (!content) return '';

  const codeBlocks = [];
  const inlineCodes = [];
  const tables = [];

  // 1. Extract Code Blocks: ```lang\ncode\n```
  let text = content.replace(/```([a-zA-Z0-9_\-+]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    const trimmedLang = (lang || '').trim().toLowerCase();
    const displayLang = trimmedLang || 'código';
    const rawCode = code.replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '');
    const escapedCode = escapeHtml(rawCode);
    const encoded = encodeURIComponent(rawCode);

    const blockHtml = `<div class="my-3 rounded-xl overflow-hidden border border-neutral-700/60 bg-[#0d0d11] shadow-md font-mono text-xs sm:text-[13px] text-neutral-200">` +
      `<div class="flex items-center justify-between px-3.5 py-1.5 bg-[#18181f] border-b border-neutral-800 text-neutral-400 text-xs select-none">` +
        `<span class="font-sans font-semibold text-[11px] uppercase tracking-wider text-neutral-300">${displayLang}</span>` +
        `<button type="button" class="copilot-copy-code-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all text-xs font-sans cursor-pointer" data-code="${encoded}">` +
          `<svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>` +
          `<span>Copiar</span>` +
        `</button>` +
      `</div>` +
      `<div class="p-3.5 overflow-x-auto text-neutral-100 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre selection:bg-neutral-700 selection:text-white"><code>${escapedCode}</code></div>` +
    `</div>`;

    const placeholder = `__COPILOT_CODEBLOCK_${codeBlocks.length}__`;
    codeBlocks.push(blockHtml);
    return `\n\n${placeholder}\n\n`;
  });

  // 2. Extract Inline Code: `code`
  text = text.replace(/`([^`\n]+)`/g, (match, inline) => {
    const escapedInline = escapeHtml(inline);
    const inlineHtml = `<code class="px-1.5 py-0.5 mx-0.5 rounded-md text-[12px] font-mono font-medium bg-neutral-200/80 dark:bg-neutral-800 text-pink-600 dark:text-pink-400 border border-neutral-300/60 dark:border-neutral-700/60">${escapedInline}</code>`;
    const placeholder = `__COPILOT_INLINE_${inlineCodes.length}__`;
    inlineCodes.push(inlineHtml);
    return placeholder;
  });

  // 3. Extract Markdown Tables
  const tableRegex = /((?:^[ \t]*\|[^\n]+\|[ \t]*\n)(?:^[ \t]*\|[-: |]+\|[ \t]*\n)(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\n|$))+)/gm;
  text = text.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n').map(l => l.trim());
    if (lines.length >= 2) {
      const headerCols = lines[0].replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const bodyRows = lines.slice(2).map(row => 
        row.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      );

      let tableHtml = `<div class="my-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs">` +
        `<table class="w-full text-left text-xs sm:text-sm border-collapse">` +
          `<thead class="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 font-semibold border-b border-neutral-200 dark:border-neutral-700">` +
            `<tr>${headerCols.map(c => `<th class="px-3 py-2 border-r last:border-r-0 border-neutral-200 dark:border-neutral-700">${escapeHtml(c)}</th>`).join('')}</tr>` +
          `</thead>` +
          `<tbody class="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">` +
            bodyRows.map(row => 
              `<tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">${row.map(c => `<td class="px-3 py-2 border-r last:border-r-0 border-neutral-200 dark:border-neutral-800">${escapeHtml(c)}</td>`).join('')}</tr>`
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

  // 4. Escape HTML for remaining normal text
  text = escapeHtml(text);

  // 5. Headings
  text = text.replace(/^###[ \t]+(.*)$/gm, '<h3 class="text-sm sm:text-base font-bold mt-3 mb-1.5 text-neutral-900 dark:text-white">$1</h3>');
  text = text.replace(/^##[ \t]+(.*)$/gm, '<h2 class="text-base sm:text-lg font-bold mt-3.5 mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">$1</h2>');
  text = text.replace(/^#[ \t]+(.*)$/gm, '<h1 class="text-lg sm:text-xl font-extrabold mt-4 mb-2 text-neutral-900 dark:text-white">$1</h1>');

  // 6. Blockquotes
  text = text.replace(/^>[ \t]+(.*)$/gm, '<blockquote class="my-2 pl-3 py-1 border-l-2 border-blue-500 bg-blue-500/10 rounded-r text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 italic">$1</blockquote>');

  // 7. Horizontal Divider
  text = text.replace(/^(?:---|___|\*\*\*)$/gm, '<hr class="my-3 border-neutral-200 dark:border-neutral-700/80">');

  // 8. Bold text: **text** (supports single asterisks inside like **formula * 2**)
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-neutral-900 dark:text-white">$1</strong>');

  // 9. Italic text: *text* or _text_ (must be bounded and not surrounded by spaces or arithmetic like a * b)
  text = text.replace(/(?<=^|[\s(])\*(?!\s)([^*\n]+?)(?<!\s)\*(?=[.,!?;:\s)]|$)/g, '<em class="italic text-neutral-800 dark:text-neutral-200">$1</em>');
  text = text.replace(/(?<=^|[\s(])_(?!\s)([^_\n]+?)(?<!\s)_(?=[.,!?;:\s)]|$)/g, '<em class="italic text-neutral-800 dark:text-neutral-200">$1</em>');

  // 10. Links [Text](URL)
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 underline font-medium">$1</a>');

  // 11. Lists: bullet and numbered
  // Process lines into lists if consecutive
  const lines = text.split('\n');
  const processedLines = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\t ]*[-*•][ \t]+(.*)$/);
    const numMatch = line.match(/^[\t ]*(\d+)\.[ \t]+(.*)$/);

    if (bulletMatch) {
      if (!inUl) {
        if (inOl) { processedLines.push('</ol>'); inOl = false; }
        processedLines.push('<ul class="my-2 ml-4 space-y-1 list-disc list-outside text-neutral-800 dark:text-neutral-200">');
        inUl = true;
      }
      processedLines.push(`<li class="leading-relaxed">${bulletMatch[1]}</li>`);
    } else if (numMatch) {
      if (!inOl) {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        processedLines.push('<ol class="my-2 ml-4 space-y-1 list-decimal list-outside text-neutral-800 dark:text-neutral-200">');
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

  // 12. Line breaks: \n -> <br> except inside block elements
  text = text.replace(/\n{2,}/g, '<br><br>');
  text = text.replace(/\n/g, '<br>');

  // Clean up <br> around block placeholders and block tags
  text = text.replace(/(?:<br\s*\/?>)+(<(?:h[1-3]|ul|ol|li|blockquote|hr|div|table|tr|thead|tbody|th|td))/gi, '$1');
  text = text.replace(/(<\/(?:h[1-3]|ul|ol|li|blockquote|hr|div|table|tr|thead|tbody|th|td)>)(?:<br\s*\/?>)+/gi, '$1');
  text = text.replace(/(?:<br\s*\/?>)+(__COPILOT_(?:CODEBLOCK|TABLE)_\d+__)(?:<br\s*\/?>)+/g, '$1');
  text = text.replace(/(?:<br\s*\/?>)+(__COPILOT_(?:CODEBLOCK|TABLE)_\d+__)/g, '$1');
  text = text.replace(/(__COPILOT_(?:CODEBLOCK|TABLE)_\d+__)(?:<br\s*\/?>)+/g, '$1');

  // 13. Restore tables
  tables.forEach((tableHtml, index) => {
    text = text.replace(`__COPILOT_TABLE_${index}__`, tableHtml);
  });

  // 14. Restore inline codes
  inlineCodes.forEach((inlineHtml, index) => {
    text = text.replace(`__COPILOT_INLINE_${index}__`, inlineHtml);
  });

  // 15. Restore code blocks
  codeBlocks.forEach((blockHtml, index) => {
    text = text.replace(`__COPILOT_CODEBLOCK_${index}__`, blockHtml);
  });

  return text.trim();
}

// ==========================
// TEST SUITE
// ==========================
console.log('--- RUNNING TESTS ---');

// Test 1: User's exact example in plain text:
const t1 = "SELECT SUM( p.producto * d.cantidad)";
const r1 = parseCopilotMarkdown(t1);
console.log('Test 1 - Plain text multiplication:');
console.log('Result:', r1);
if (!r1.includes('p.producto * d.cantidad')) {
  console.error('FAIL: Asterisk was lost or modified!');
  process.exit(1);
} else {
  console.log('PASS: Asterisk preserved exactly in plain text.');
}

// Test 2: User's exact example in code block:
const t2 = "Aquí tienes la consulta:\n```sql\nSELECT SUM( p.producto * d.cantidad)\nFROM pedidos p;\n```";
const r2 = parseCopilotMarkdown(t2);
console.log('\nTest 2 - SQL in code block:');
if (!r2.includes('SELECT SUM( p.producto * d.cantidad)') || !r2.includes('copilot-copy-code-btn')) {
  console.error('FAIL: Code block does not preserve SQL asterisk or copy button!');
  process.exit(1);
} else {
  console.log('PASS: SQL preserved with copy button and lang SQL.');
}

// Test 3: SQL wildcard SELECT * FROM
const t3 = "SELECT * FROM usuarios WHERE activo = 1";
const r3 = parseCopilotMarkdown(t3);
console.log('\nTest 3 - SELECT * FROM:');
if (!r3.includes('SELECT * FROM')) {
  console.error('FAIL: SELECT * FROM lost asterisk!');
  process.exit(1);
} else {
  console.log('PASS: SELECT * preserved.');
}

// Test 4: Inline code `p.producto * d.cantidad`
const t4 = "Usa la fórmula `p.producto * d.cantidad` para calcular el total.";
const r4 = parseCopilotMarkdown(t4);
console.log('\nTest 4 - Inline code with asterisk:');
if (!r4.includes('p.producto * d.cantidad') || !r4.includes('<code')) {
  console.error('FAIL: Inline code failed!');
  process.exit(1);
} else {
  console.log('PASS: Inline code preserved.');
}

// Test 5: Bold and Italic text
const t5 = "Este texto es **negrita** y este es *cursiva* y esta es una multiplicación 2 * 3 = 6.";
const r5 = parseCopilotMarkdown(t5);
console.log('\nTest 5 - Bold, italic and multiplication:');
console.log('Result:', r5);
if (!r5.includes('<strong') || !r5.includes('negrita') || !r5.includes('<em') || !r5.includes('cursiva') || !r5.includes('2 * 3 = 6')) {
  console.error('FAIL: Bold, italic or multiplication failed!');
  process.exit(1);
} else {
  console.log('PASS: Bold, italic and arithmetic all work simultaneously.');
}

// Test 6: Markdown table
const t6 = "| ID | Producto | Subtotal |\n|---|---|---|\n| 1 | Laptop | 1000 * 2 |";
const r6 = parseCopilotMarkdown(t6);
console.log('\nTest 6 - Table:');
if (!r6.includes('<table') || !r6.includes('1000 * 2')) {
  console.error('FAIL: Table failed!');
  process.exit(1);
} else {
  console.log('PASS: Table rendered with 1000 * 2.');
}

// Test 7: Unordered and ordered lists with * bullet and math inside
const t7 = "* Item 1: costo = cantidad * precio\n* Item 2: descuento 10%";
const r7 = parseCopilotMarkdown(t7);
console.log('\nTest 7 - List with * bullets and math:');
console.log('Result:', r7);
if (!r7.includes('<ul') || !r7.includes('cantidad * precio')) {
  console.error('FAIL: List failed!');
  process.exit(1);
} else {
  console.log('PASS: List rendered correctly with math intact.');
}

// Test 8: Multiple wildcards and multiplications in SQL
const t8 = "SELECT a.*, b.*, SUM(a.precio * b.cantidad) AS total FROM a JOIN b ON a.id = b.a_id WHERE a.valor > 0 AND a.status < 5;";
const r8 = parseCopilotMarkdown(t8);
console.log('\nTest 8 - Multiple asterisks, operators and <> in SQL:');
if (!r8.includes('a.*') || !r8.includes('b.*') || !r8.includes('a.precio * b.cantidad') || !r8.includes('&gt;') || !r8.includes('&lt;')) {
  console.error('FAIL: Test 8 failed! Output:', r8);
  process.exit(1);
} else {
  console.log('PASS: Multiple wildcards, multiplications and HTML entities correctly handled.');
}

// Test 9: Code block with generics and symbols
const t9 = "Ejemplo en TypeScript:\n```typescript\nfunction filterData<T>(items: T[], rate: number * 2): Promise<T[]> {\n  return Promise.resolve(items.filter(i => i !== null));\n}\n```";
const r9 = parseCopilotMarkdown(t9);
console.log('\nTest 9 - Code block with generics and symbols:');
if (!r9.includes('&lt;T&gt;') || !r9.includes('rate: number * 2')) {
  console.error('FAIL: Test 9 failed! Output:', r9);
  process.exit(1);
} else {
  console.log('PASS: Generics, asterisks and symbols safely preserved in code block.');
}

// Test 10: Mixed response with conversational text, headers, lists and SQL code block
const t10 = `¡Claro! Aquí tienes la solución:

### Consulta SQL optimizada
Para obtener el monto total multiplicando el precio del producto por la cantidad:

\`\`\`sql
SELECT 
    p.nombre,
    SUM(p.producto * d.cantidad) AS total_vendido
FROM pedidos p
JOIN detalle_pedidos d ON p.id = d.pedido_id
GROUP BY p.nombre;
\`\`\`

Notas importantes:
* Verifica que \`d.cantidad\` no tenga valores nulos.
* Puedes usar **COALESCE(p.producto * d.cantidad, 0)** como alternativa segura.`;

const r10 = parseCopilotMarkdown(t10);
console.log('\nTest 10 - Realistic ChatGPT-style response:');
if (!r10.includes('Consulta SQL optimizada') ||
    !r10.includes('SUM(p.producto * d.cantidad)') ||
    !r10.includes('p.nombre') ||
    !r10.includes('copilot-copy-code-btn') ||
    !r10.includes('<strong class="font-bold text-neutral-900 dark:text-white">COALESCE(p.producto * d.cantidad, 0)</strong>')) {
  console.error('FAIL: Test 10 failed! Output:', r10);
  process.exit(1);
} else {
  console.log('PASS: Realistic ChatGPT-style response parsed with 100% fidelity!');
}

console.log('\nALL 10 TESTS PASSED SUCCESSFULLY! 🎉');
