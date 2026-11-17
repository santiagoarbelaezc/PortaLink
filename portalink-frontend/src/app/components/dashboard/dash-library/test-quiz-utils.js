/**
 * Test Suite: Utilidades del bloque Cuestionario (quiz.utils.ts)
 * Ejecutar: node portalink-frontend/src/app/components/dashboard/dash-library/test-quiz-utils.js
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const src = fs.readFileSync(path.join(__dirname, 'quiz.utils.ts'), 'utf8');
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const mod = { exports: {} };
new Function('module', 'exports', js)(mod, mod.exports);
const Q = mod.exports;

let total = 0, passed = 0, failed = 0;
function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✔ PASS\x1b[0m  ${name}`); }
  catch (e) { failed++; console.error(`  \x1b[31m✖ FAIL\x1b[0m  ${name}\n         \x1b[33m${e.message}\x1b[0m`); }
}
function assert(c, m = 'Assertion failed') { if (!c) throw new Error(m); }

function sample(n = 5) {
  return {
    title: 'Consultas SQL',
    topic: 'SQL',
    questions: Array.from({ length: n }, (_, i) => ({
      id: `q-${i + 1}`,
      question: `¿Qué hace \`SELECT * FROM t WHERE a > ${i}\`? "comillas" y\nsalto`,
      options: [`Opción A ${i}`, `Opción B ${i}`, `Opción C ${i}`],
      correctIndex: i % 3,
      explanation: `Explicación ${i}: usa "comillas", saltos\ny ::: dentro`,
      selectedIndex: null
    }))
  };
}

console.log('\n\x1b[1;36m== quiz.utils ==\x1b[0m');

console.log('\n\x1b[1m[1] Serialización y round-trip\x1b[0m');

test('serializeQuizBlock genera fence con JSON en una sola línea', () => {
  const md = Q.serializeQuizBlock(sample());
  const lines = md.split('\n');
  assert(lines.length === 3, `Debe tener 3 líneas, tiene ${lines.length}`);
  assert(lines[0] === ':::quiz' && lines[2] === ':::', 'Fences incorrectos');
  assert(!lines[1].includes('\n'), 'JSON no debe contener saltos reales');
});

test('round-trip conserva preguntas, opciones y correctIndex', () => {
  const quiz = sample();
  const md = Q.serializeQuizBlock(quiz);
  const parsed = Q.parseQuizFence(md.split('\n'), 0);
  assert(parsed.quiz, 'Debe parsear');
  assert(parsed.quiz.questions.length === 5, 'Debe tener 5 preguntas');
  assert(parsed.quiz.questions[2].correctIndex === quiz.questions[2].correctIndex, 'correctIndex');
  assert(parsed.quiz.questions[0].question === quiz.questions[0].question, 'Debe conservar comillas, backticks y saltos');
  assert(parsed.quiz.questions[0].explanation.includes(':::'), 'Debe conservar ::: dentro del texto');
});

test('round-trip conserva el progreso (selectedIndex)', () => {
  const quiz = sample();
  quiz.questions[0].selectedIndex = 1;
  quiz.questions[3].selectedIndex = 2;
  const parsed = Q.parseQuizFence(Q.serializeQuizBlock(quiz).split('\n'), 0);
  assert(parsed.quiz.questions[0].selectedIndex === 1, 'selectedIndex 0');
  assert(parsed.quiz.questions[3].selectedIndex === 2, 'selectedIndex 3');
  assert(parsed.quiz.questions[1].selectedIndex === null, 'sin responder = null');
});

test('parseQuizFence devuelve el índice siguiente al cierre', () => {
  const lines = ['antes', ...Q.serializeQuizBlock(sample()).split('\n'), 'despues'];
  const parsed = Q.parseQuizFence(lines, 1);
  assert(lines[parsed.nextIndex] === 'despues', 'nextIndex debe apuntar tras el cierre');
});

test('JSON inválido => quiz null pero conserva el texto crudo', () => {
  const parsed = Q.parseQuizFence([':::quiz', '{roto', ':::'], 0);
  assert(parsed.quiz === null, 'quiz debe ser null');
  assert(parsed.raw === '{roto', 'Debe conservar raw');
  assert(parsed.nextIndex === 3, 'Debe consumir el bloque');
});

test('fence sin cierre no rompe', () => {
  const parsed = Q.parseQuizFence([':::quiz', JSON.stringify(sample(1))], 0);
  assert(parsed.quiz && parsed.quiz.questions.length === 1, 'Debe parsear aun sin cierre');
});

console.log('\n\x1b[1m[2] Normalización\x1b[0m');

test('descarta preguntas con correctIndex fuera de rango', () => {
  const q = sample(3);
  q.questions[1].correctIndex = 9;
  const n = Q.normalizeQuizData(q);
  assert(n.questions.length === 2, 'Debe descartar 1');
});

test('selectedIndex fuera de rango se ignora', () => {
  const q = sample(1);
  q.questions[0].selectedIndex = 99;
  assert(Q.normalizeQuizData(q).questions[0].selectedIndex === null, 'Debe quedar null');
});

test('sin preguntas válidas => null', () => {
  assert(Q.normalizeQuizData({ questions: [] }) === null, 'vacío');
  assert(Q.normalizeQuizData(null) === null, 'null');
  assert(Q.normalizeQuizData({ questions: [{ question: 'x', options: ['solo una'], correctIndex: 0 }] }) === null, '1 opción');
});

test('título por defecto', () => {
  const q = sample(1); delete q.title;
  assert(Q.normalizeQuizData(q).title === 'Cuestionario de estudio', 'título por defecto');
});

console.log('\n\x1b[1m[3] Puntaje y progreso\x1b[0m');

test('quizScore, quizAnsweredCount e isQuizComplete', () => {
  const quiz = sample(5); // correctIndex: 0,1,2,0,1
  assert(Q.quizScore(quiz) === 0 && Q.quizAnsweredCount(quiz) === 0 && !Q.isQuizComplete(quiz), 'inicial');
  quiz.questions[0].selectedIndex = 0; // bien
  quiz.questions[1].selectedIndex = 0; // mal
  quiz.questions[2].selectedIndex = 2; // bien
  assert(Q.quizScore(quiz) === 2, 'score 2');
  assert(Q.quizAnsweredCount(quiz) === 3, 'answered 3');
  assert(!Q.isQuizComplete(quiz), 'no completo');
  quiz.questions[3].selectedIndex = 0;
  quiz.questions[4].selectedIndex = 1;
  assert(Q.isQuizComplete(quiz), 'completo');
  assert(Q.quizScore(quiz) === 4, 'score 4');
});

test('resetQuizAnswers limpia todo', () => {
  const quiz = sample(5);
  quiz.questions.forEach(q => (q.selectedIndex = 0));
  Q.resetQuizAnswers(quiz);
  assert(Q.quizAnsweredCount(quiz) === 0, 'sin respuestas');
});

console.log('\n\x1b[1m[4] Texto auxiliar\x1b[0m');

test('stripQuizBlocks elimina el bloque de las vistas previas', () => {
  const md = `# Título\n\nTexto previo\n\n${Q.serializeQuizBlock(sample(2))}\n\nTexto posterior`;
  const out = Q.stripQuizBlocks(md);
  assert(!out.includes(':::quiz') && !out.includes('correctIndex'), 'No debe quedar JSON');
  assert(out.includes('Texto previo') && out.includes('Texto posterior'), 'Debe conservar el resto');
});

test('quizToContextText NO incluye respuestas correctas ni explicaciones', () => {
  const quiz = sample(2);
  const txt = Q.quizToContextText(quiz);
  assert(txt.includes('CUESTIONARIO'), 'Encabezado');
  assert(txt.includes('A) Opción A 0'), 'Opciones con letra');
  assert(!txt.includes('correctIndex') && !txt.includes('Explicación'), 'Sin respuestas');
});

console.log('\n\x1b[1m[5] Detección de intención\x1b[0m');

test('detecta pedidos naturales', () => {
  const yes = [
    'quiero que me hagas un cuestionario de lo que venimos estudiando',
    'Hazme un quiz de SQL',
    'genera un examen sobre JOIN',
    'ponme a prueba con lo del apunte',
    'créame un cuestionario',
    'evalúame sobre consultas',
    'Dame 8 preguntas de práctica sobre GROUP BY',
    'necesito un test de bases de datos'
  ];
  yes.forEach(t => assert(Q.detectQuizIntent(t).isQuiz, `Debió detectar: "${t}"`));
});

test('NO detecta consultas normales (sin falsos positivos)', () => {
  const no = [
    'explícame qué es un JOIN',
    'resume este apunte',
    'qué significan las preguntas de la tabla',
    'corrige la ortografía',
    'hola',
    ''
  ];
  no.forEach(t => assert(!Q.detectQuizIntent(t).isQuiz, `No debió detectar: "${t}"`));
});

test('extrae la cantidad pedida y la acota a 1-10', () => {
  assert(Q.detectQuizIntent('hazme un cuestionario de 8 preguntas').count === 8, '8');
  assert(Q.detectQuizIntent('dame tres preguntas de práctica').count === 3, 'tres');
  assert(Q.detectQuizIntent('hazme un cuestionario de 50 preguntas').count === 10, 'máx 10');
  assert(Q.detectQuizIntent('hazme un cuestionario').count === null, 'sin cantidad');
});

console.log('\n\x1b[1;36m====================================================\x1b[0m');
console.log(`  TOTAL: ${total}   \x1b[32mPASSED: ${passed}\x1b[0m   \x1b[31mFAILED: ${failed}\x1b[0m`);
console.log('\x1b[1;36m====================================================\x1b[0m\n');
process.exit(failed > 0 ? 1 : 0);
