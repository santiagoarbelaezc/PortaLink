/**
 * Test Suite: Copilot Markdown Parser (dash-library.component.ts)
 * 
 * Este test carga directamente el método parseCopilotMarkdown desde 
 * dash-library.component.ts para garantizar que se prueba el código real en producción.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// 1. Cargar y compilar dinámicamente CopilotMarkdownService
const serviceFilePath = path.join(__dirname, '../../../services/copilot-markdown.service.ts');
if (!fs.existsSync(serviceFilePath)) {
  console.error(`ERROR: No se encontró ${serviceFilePath}`);
  process.exit(1);
}

const serviceSource = fs.readFileSync(serviceFilePath, 'utf8');
const cleanSource = serviceSource
  .replace(/import\s+[^;]+;/g, '')
  .replace(/@Injectable\([^)]*\)/g, '');

const transpiled = ts.transpileModule(cleanSource + '\nmodule.exports = { CopilotMarkdownService };', {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;

global.DomSanitizer = class {};
global.inject = () => null;
const { CopilotMarkdownService } = eval(`(function() {
  const module = { exports: {} };
  ${transpiled};
  return module.exports;
})()`);

const service = new CopilotMarkdownService();

// Helper para parsear en tests
function parse(text, darkTheme = true) {
  return service.parse(text, darkTheme);
}

// ==========================================
// TEST RUNNER
// ==========================================
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m  ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m  ${name}`);
    console.error(`         \x1b[33mError: ${err.message}\x1b[0m`);
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

console.log('\n\x1b[1;36m====================================================\x1b[0m');
console.log('\x1b[1;36m  PORTALINK - DASH LIBRARY COPILOT TEST SUITE       \x1b[0m');
console.log('\x1b[1;36m  Probando métodos reales de dash-library.component.ts\x1b[0m');
console.log('\x1b[1;36m====================================================\x1b[0m\n');

// ─── GRUPO 1: Símbolos matemáticos y asteriscos (Evitar símbolos raros) ───
console.log('\x1b[1m[1] Preservación de asteriscos y operadores (sin símbolos raros)\x1b[0m');

test('Multiplicación en texto plano no se convierte en cursiva ni se pierde', () => {
  const input = 'SELECT SUM( p.producto * d.cantidad)';
  const res = parse(input);
  assert(res.includes('p.producto * d.cantidad'), 'Debe mantener el asterisco de multiplicación intacto');
  assert(!res.includes('<em'), 'No debe crear etiqueta <em> errónea para multiplicación');
});

test('Comodín SQL SELECT * FROM tabla intacto', () => {
  const res = parse('SELECT * FROM usuarios WHERE activo = 1');
  assert(res.includes('SELECT * FROM usuarios'), 'Debe conservar SELECT *');
});

test('Operación aritmética con múltiples factores (2 * 3 * 4 = 24)', () => {
  const res = parse('El cálculo es 2 * 3 * 4 = 24 pesos.');
  assert(res.includes('2 * 3 * 4 = 24'), 'Debe conservar todos los asteriscos de multiplicación');
  assert(!res.includes('<em'), 'No debe generar cursivas por asteriscos matemáticos');
});

test('Operadores de comparación < y > se escapan seguramente', () => {
  const res = parse('Si a < 10 y b > 20 entonces c = true');
  assert(res.includes('&lt; 10'), 'El signo < debe escaparse a &lt;');
  assert(res.includes('&gt; 20'), 'El signo > debe escaparse a &gt;');
});

// ─── GRUPO 2: Entidades HTML literales del LLM (Limpieza de &amp; &lt;) ───
console.log('\n\x1b[1m[2] Manejo de entidades HTML del modelo LLM (Prevención de doble escape)\x1b[0m');

test('Entidades &amp; enviadas por el modelo no se duplican como &amp;amp;', () => {
  const input = 'Comparación lógica: if (x &amp;&amp; y)';
  const res = parse(input);
  assert(!res.includes('&amp;amp;'), 'No debe existir doble escape &amp;amp;');
  assert(res.includes('&amp;&amp;'), 'Debe renderizar la entidad & limpia para el navegador');
});

test('Entidades &lt; y &gt; no se convierten en &amp;lt;', () => {
  const input = 'Usa el tipo &lt;string&gt; en TypeScript';
  const res = parse(input);
  assert(!res.includes('&amp;lt;'), 'No debe generar &amp;lt;');
  assert(res.includes('&lt;string&gt;'), 'Debe mantener el escape simple');
});

// ─── GRUPO 3: Citas y Blockquotes ───
console.log('\n\x1b[1m[3] Citas / Blockquotes (> Cita)\x1b[0m');

test('Blockquote con símbolo > se transforma en elemento <blockquote>', () => {
  const input = '> Esta es una nota importante del apunte';
  const res = parse(input);
  assert(res.includes('<blockquote'), 'Debe contener la etiqueta <blockquote');
  assert(res.includes('Esta es una nota importante del apunte'), 'Debe incluir el texto');
  assert(res.includes('border-'), 'Debe tener borde de cita');
});

test('Blockquote con formato en negrita interno', () => {
  const input = '> **Aviso:** No modificar esta clave primaria.';
  const res = parse(input);
  assert(res.includes('<blockquote'), 'Debe contener <blockquote>');
  assert(res.includes('<strong'), 'Debe contener <strong> dentro de la cita');
  assert(res.includes('Aviso:'), 'Debe contener el texto en negrita');
});

// ─── GRUPO 4: Formato de Texto (Negrita y Cursiva) ───
console.log('\n\x1b[1m[4] Formato de texto (Negrita y Cursiva)\x1b[0m');

test('Texto en negrita estándar **texto**', () => {
  const res = parse('Este es un texto con **palabra clave** importante.');
  assert(res.includes('<strong class="font-bold text-white">palabra clave</strong>'), 'Debe envolver en <strong>');
});

test('Negrita con fórmula y asterisco interior **COALESCE(p.producto * d.cantidad, 0)**', () => {
  const res = parse('Usa **COALESCE(p.producto * d.cantidad, 0)** para evitar nulos.');
  assert(res.includes('<strong class="font-bold text-white">COALESCE(p.producto * d.cantidad, 0)</strong>'), 'Debe soportar asteriscos matemáticos dentro de la negrita');
});

test('Texto en cursiva con * y con _', () => {
  const res = parse('Palabra en *cursiva1* y otra en _cursiva2_.');
  assert(res.includes('<em class="italic text-neutral-200">cursiva1</em>'), 'Debe parsear *cursiva1*');
  assert(res.includes('<em class="italic text-neutral-200">cursiva2</em>'), 'Debe parsear _cursiva2_');
});

test('Negrita y cursiva combinadas en la misma oración', () => {
  const res = parse('Aquí hay **negrita**, aquí *cursiva*, y aquí 5 * 5 = 25.');
  assert(res.includes('<strong'), 'Debe tener negrita');
  assert(res.includes('<em'), 'Debe tener cursiva');
  assert(res.includes('5 * 5 = 25'), 'La multiplicación debe preservarse sin volverse cursiva');
});

// ─── GRUPO 5: Bloques de Código e Inline Code ───
console.log('\n\x1b[1m[5] Bloques de código y código inline\x1b[0m');

test('Bloque de código con lenguaje y botón de copiar', () => {
  const input = '```sql\nSELECT id, nombre FROM usuarios WHERE rol = 1;\n```';
  const res = parse(input);
  assert(res.includes('copilot-copy-code-btn'), 'Debe incluir botón de copiar');
  assert(res.toLowerCase().includes('sql') && res.includes('uppercase'), 'Debe mostrar la etiqueta del lenguaje con clase uppercase');
  assert(res.includes('SELECT id, nombre FROM usuarios WHERE rol = 1;'), 'Debe contener el código');
  assert(res.includes('data-code='), 'Debe tener atributo data-code para el portapapeles');
});

test('Bloque de código sin lenguaje especificado usa fallback "código"', () => {
  const input = '```\necho "Hola mundo";\n```';
  const res = parse(input);
  assert(res.includes('CÓDIGO') || res.includes('código'), 'Debe mostrar fallback de lenguaje');
  assert(res.includes('echo &quot;Hola mundo&quot;;'), 'Las comillas deben escaparse de forma segura');
});

test('Código inline con `variable`', () => {
  const res = parse('Usa la función `calculateTotal()` para obtener el valor.');
  assert(res.includes('<code class='), 'Debe crear etiqueta <code>');
  assert(res.includes('calculateTotal()'), 'Debe contener el nombre de la función');
  assert(res.includes('text-pink-400'), 'En modo oscuro debe tener texto rosado');
});

test('Código inline con asterisco de multiplicación interior `p * q`', () => {
  const res = parse('La fórmula `p * q` es correcta.');
  assert(res.includes('<code'), 'Debe ser inline code');
  assert(res.includes('p * q'), 'Debe preservar el asterisco dentro del código');
});

// ─── GRUPO 6: Tablas Markdown ───
console.log('\n\x1b[1m[6] Tablas Markdown\x1b[0m');

test('Tabla Markdown se transforma en HTML <table> responsiva', () => {
  const input = `
| Función | Descripción | Ejemplo |
|---|---|---|
| SUM | Suma valores | SUM(total) |
| AVG | Promedio | AVG(edad) |
  `.trim();
  const res = parse(input);
  assert(res.includes('<table class="w-full text-left'), 'Debe crear tabla responsiva');
  assert(res.includes('<thead'), 'Debe tener encabezado thead');
  assert(res.includes('<th') && res.includes('Función'), 'Debe tener columnas de encabezado');
  assert(res.includes('<tbody') && res.includes('SUM(total)'), 'Debe tener cuerpo tbody con datos');
});

// ─── GRUPO 7: Listas desordenadas y ordenadas ───
console.log('\n\x1b[1m[7] Listas (Desordenadas y Numeradas)\x1b[0m');

test('Lista desordenada con guión (-)', () => {
  const input = '- Primer punto\n- Segundo punto con `código`\n- Tercer punto';
  const res = parse(input);
  assert(res.includes('<ul class="my-2 ml-4 space-y-1 list-disc'), 'Debe agrupar en <ul> con viñetas');
  assert(res.includes('<li class="leading-relaxed">Primer punto</li>'), 'Debe crear elemento <li>');
  assert(res.includes('código'), 'Debe permitir código inline dentro de la lista');
});

test('Lista desordenada con asterisco (*)', () => {
  const input = '* Opción A: costo = unidades * valor\n* Opción B: costo fijo';
  const res = parse(input);
  assert(res.includes('<ul'), 'Debe crear <ul>');
  assert(res.includes('unidades * valor'), 'El asterisco de viñeta no debe romper la multiplicación interna');
});

test('Lista numerada (1. 2. 3.)', () => {
  const input = '1. Paso uno: preparar datos\n2. Paso dos: entrenar modelo\n3. Paso tres: evaluar métricas';
  const res = parse(input);
  assert(res.includes('<ol class="my-2 ml-4 space-y-1 list-decimal'), 'Debe agrupar en <ol> decimal');
  assert(res.includes('Paso uno: preparar datos</li>'), 'Debe crear ítems ordenados');
});

// ─── GRUPO 8: Encabezados y Enlaces ───
console.log('\n\x1b[1m[8] Encabezados (#, ##, ###) y Enlaces [Texto](URL)\x1b[0m');

test('Encabezados H1, H2, H3 tienen estilo de subtítulos rosados característicos', () => {
  const input = '# Título Principal\n## Subtítulo\n### Sección Menor';
  const resDark = parse(input, true);
  assert(resDark.includes('<h1') && resDark.includes('font-extrabold'), 'Debe generar H1');
  assert(resDark.includes('<h2') && resDark.includes('font-bold'), 'Debe generar H2');
  assert(resDark.includes('<h3') && resDark.includes('font-bold'), 'Debe generar H3');
  assert(resDark.includes('text-pink-400'), 'En modo oscuro los subtítulos deben ser rosados (text-pink-400)');

  const resLight = parse(input, false);
  assert(resLight.includes('text-pink-600'), 'En modo claro los subtítulos deben ser rosados (text-pink-600)');
});

test('Enlaces markdown se transforman en <a> con target="_blank" y rel seguro', () => {
  const input = 'Consulta la documentación en [PortaLink Docs](https://portalink.app/docs).';
  const res = parse(input);
  assert(res.includes('<a href="https://portalink.app/docs" target="_blank" rel="noopener noreferrer"'), 'Debe generar enlace seguro');
  assert(res.includes('PortaLink Docs</a>'), 'Debe tener el texto de anclaje');
});

// ─── GRUPO 9: Normalización de saltos de línea y Tema ───
console.log('\n\x1b[1m[9] Normalización y Modos Claro / Oscuro\x1b[0m');

test('Elimina saltos de línea vacíos al inicio (trim leading newlines)', () => {
  const input = '\n\n\n\r\nTexto que comienza después de varios espacios';
  const res = parse(input);
  assert(!res.startsWith('<br>'), 'No debe comenzar con etiquetas <br>');
  assert(res.startsWith('Texto que comienza'), 'Debe comenzar directamente con el texto');
});

test('Modo Claro (darkTheme = false) aplica paleta de texto oscuro', () => {
  const resLight = parse('**Título Claro**\n`código`', false);
  assert(resLight.includes('text-neutral-900'), 'En modo claro los títulos usan text-neutral-900');
  assert(resLight.includes('bg-neutral-200/90 text-pink-600'), 'En modo claro el código inline usa bg claro');
});

test('Modo Oscuro (darkTheme = true) aplica paleta de texto blanco/contraste', () => {
  const resDark = parse('**Título Oscuro**\n`código`', true);
  assert(resDark.includes('text-white'), 'En modo oscuro los títulos usan text-white');
  assert(resDark.includes('bg-neutral-800 text-pink-400'), 'En modo oscuro el código inline usa bg oscuro');
});

// ─── GRUPO 10: Casos límite y Respuesta Real Completa ───
console.log('\n\x1b[1m[10] Casos límite y Respuesta Integral del Asistente\x1b[0m');

test('Entrada vacía o nula retorna string vacío', () => {
  assert(parse('') === '', 'String vacío debe retornar vacío');
  assert(parse(null) === '', 'Null debe retornar vacío');
  assert(parse(undefined) === '', 'Undefined debe retornar vacío');
});

test('Respuesta completa compleja con todos los elementos combinados', () => {
  const fullResponse = `
### Manipulación de datos en Python

Para calcular el total por producto utilizando **NumPy** y **Pandas**:

\`\`\`python
import pandas as pd
import numpy as np

# Multiplicación vectorizada de columnas
df['subtotal'] = df['precio'] * df['cantidad']
print(df.head())
\`\`\`

> **Nota:** La operación vectorizada es mucho más rápida que un ciclo \`for\`.

Pasos a seguir:
* Verifica que \`precio * cantidad\` no contenga valores NaN.
* Usa **fillna(0)** si encuentras valores vacíos.

| Función | Utilidad |
|---|---|
| np.dot | Producto punto |
| df.groupby | Agrupaciones |
  `.trim();

  const res = parse(fullResponse);
  assert(res.includes('<h3'), 'Debe incluir H3');
  assert(res.includes('copilot-copy-code-btn'), 'Debe incluir botón de copiar');
  assert(res.toLowerCase().includes('python'), 'Debe detectar lenguaje Python');
  assert(res.includes('df[&#39;subtotal&#39;] = df[&#39;precio&#39;] * df[&#39;cantidad&#39;]') || res.includes("df['subtotal']"), 'Debe preservar el código Python con escape seguro');
  assert(res.includes('<blockquote'), 'Debe incluir la cita');
  assert(res.includes('<strong class="font-bold text-white">NumPy</strong>'), 'Debe incluir negritas');
  assert(res.includes('<ul') && res.includes('precio * cantidad'), 'Debe incluir lista con matemática intacta');
  assert(res.includes('<table'), 'Debe incluir la tabla');
});

test('Elimina iconos y emojis decorativos (📚, 🛠️, 💡, 🚀) manteniendo el texto limpio', () => {
  const inputWithIcons = `
### 📚 1. Enunciado del ejercicio
🛠️ 2. Solución SQL con sub-consulta
💡 Índices recomendados
¡Listo! 🚀
  `.trim();
  const res = parse(inputWithIcons);
  assert(!res.includes('📚') && !res.includes('🛠️') && !res.includes('💡') && !res.includes('🚀'), 'No debe contener emojis ni iconos');
  assert(res.includes('1. Enunciado del ejercicio'), 'Debe preservar el texto del enunciado');
  assert(res.includes('Solución SQL con sub-consulta'), 'Debe preservar el texto de la solución');
  assert(res.includes('Índices recomendados'), 'Debe preservar las notas');
  assert(res.includes('¡Listo!'), 'Debe preservar el cierre');
});

// ==========================================
// RESUMEN
// ==========================================
console.log('\n\x1b[1;36m====================================================\x1b[0m');
console.log(`  TOTAL TESTS : ${totalTests}`);
console.log(`  \x1b[32mPASSED\x1b[0m      : ${passedTests}`);
console.log(`  \x1b[31mFAILED\x1b[0m      : ${failedTests}`);
console.log('\x1b[1;36m====================================================\x1b[0m');

if (failedTests > 0) {
  console.log(`\n\x1b[1;31m✖ Fallaron ${failedTests} pruebas. Revisa los errores anteriores.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log('\n\x1b[1;32m✔ ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE! (100%)\x1b[0m\n');
  process.exit(0);
}
