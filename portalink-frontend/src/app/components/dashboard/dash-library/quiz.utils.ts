/**
 * Utilidades puras del bloque "Cuestionario" de la biblioteca de apuntes.
 * Sin dependencias de Angular para poder probarlas con Node.
 *
 * Formato de persistencia dentro del Markdown del apunte:
 *
 *   :::quiz
 *   {"title":"...","questions":[...]}   <- JSON en UNA sola línea
 *   :::
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Respuesta elegida por el usuario (null = sin responder). Persiste en el apunte. */
  selectedIndex: number | null;
}

export interface QuizData {
  title: string;
  topic?: string;
  questions: QuizQuestion[];
}

const QUIZ_FENCE_START = ':::quiz';
const QUIZ_FENCE_END = ':::';

function isInt(n: any): n is number {
  return typeof n === 'number' && Number.isInteger(n);
}

/**
 * Valida y normaliza un objeto desconocido (respuesta del backend o JSON guardado).
 * Devuelve null si no se puede recuperar un cuestionario utilizable.
 */
export function normalizeQuizData(raw: any): QuizData | null {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.questions)) {
    return null;
  }

  const questions: QuizQuestion[] = [];
  for (const q of raw.questions) {
    if (!q || typeof q !== 'object') continue;

    const question = typeof q.question === 'string' ? q.question.trim() : '';
    const options: string[] = Array.isArray(q.options)
      ? q.options.filter((o: any) => typeof o === 'string' && o.trim() !== '').map((o: string) => o.trim())
      : [];
    const correctIndex = q.correctIndex;

    if (!question || options.length < 2) continue;
    if (!isInt(correctIndex) || correctIndex < 0 || correctIndex >= options.length) continue;

    let selectedIndex: number | null = null;
    if (isInt(q.selectedIndex) && q.selectedIndex >= 0 && q.selectedIndex < options.length) {
      selectedIndex = q.selectedIndex;
    }

    questions.push({
      id: typeof q.id === 'string' && q.id ? q.id : 'q-' + (questions.length + 1),
      question,
      options,
      correctIndex,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
      selectedIndex
    });
  }

  if (questions.length === 0) return null;

  return {
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Cuestionario de estudio',
    topic: typeof raw.topic === 'string' ? raw.topic.trim() : '',
    questions
  };
}

/** Serializa el cuestionario al bloque Markdown `:::quiz ... :::` (JSON en una línea). */
export function serializeQuizBlock(quiz: QuizData): string {
  const payload = {
    title: quiz.title,
    topic: quiz.topic || '',
    questions: quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      selectedIndex: q.selectedIndex
    }))
  };
  return `${QUIZ_FENCE_START}\n${JSON.stringify(payload)}\n${QUIZ_FENCE_END}`;
}

export function isQuizFenceStart(line: string): boolean {
  return line.trim() === QUIZ_FENCE_START;
}

/**
 * Lee un bloque `:::quiz` desde `lines[startIndex]`.
 * Devuelve el cuestionario (o null si el JSON es inválido), el texto crudo y el índice siguiente.
 */
export function parseQuizFence(lines: string[], startIndex: number): { quiz: QuizData | null; raw: string; nextIndex: number } {
  let i = startIndex + 1;
  const bodyLines: string[] = [];
  while (i < lines.length && lines[i].trim() !== QUIZ_FENCE_END) {
    bodyLines.push(lines[i]);
    i++;
  }
  if (i < lines.length && lines[i].trim() === QUIZ_FENCE_END) {
    i++;
  }

  const raw = bodyLines.join('\n').trim();
  let quiz: QuizData | null = null;
  try {
    quiz = normalizeQuizData(JSON.parse(raw));
  } catch {
    quiz = null;
  }
  return { quiz, raw, nextIndex: i };
}

export function quizAnsweredCount(quiz: QuizData | undefined | null): number {
  return quiz ? quiz.questions.filter(q => q.selectedIndex !== null).length : 0;
}

export function quizScore(quiz: QuizData | undefined | null): number {
  return quiz ? quiz.questions.filter(q => q.selectedIndex !== null && q.selectedIndex === q.correctIndex).length : 0;
}

export function isQuizComplete(quiz: QuizData | undefined | null): boolean {
  return !!quiz && quiz.questions.length > 0 && quizAnsweredCount(quiz) === quiz.questions.length;
}

/** Reinicia las respuestas (para "Reintentar"). */
export function resetQuizAnswers(quiz: QuizData): void {
  quiz.questions.forEach(q => (q.selectedIndex = null));
}

/** Elimina los bloques `:::quiz` de un texto Markdown (vistas previas y snippets). */
export function stripQuizBlocks(content: string): string {
  if (!content) return '';
  return content.replace(/^:::quiz[\s\S]*?^:::\s*$/gm, ' ').replace(/\n{3,}/g, '\n\n');
}

/**
 * Texto plano del cuestionario para dar contexto a la IA (nunca incluye las respuestas correctas).
 */
export function quizToContextText(quiz: QuizData): string {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const body = quiz.questions
    .map((q, i) => `${i + 1}. ${q.question}\n` + q.options.map((o, k) => `   ${letters[k] || k + 1}) ${o}`).join('\n'))
    .join('\n');
  return `CUESTIONARIO "${quiz.title}" (${quiz.questions.length} preguntas):\n${body}`;
}

// ───────────── Intención de crear cuestionario desde el chat ─────────────

const NUMBER_WORDS: Record<string, number> = {
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10
};

export interface QuizIntent {
  isQuiz: boolean;
  /** Cantidad pedida explícitamente (null = usar la predeterminada). */
  count: number | null;
}

/**
 * Detecta si el mensaje del usuario pide un cuestionario.
 * Exige una palabra de "crear" junto a una de "cuestionario" para evitar falsos positivos
 * como "explícame las preguntas de esta tabla".
 */
export function detectQuizIntent(text: string): QuizIntent {
  const t = (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!t.trim()) return { isQuiz: false, count: null };

  const noun = /\b(cuestionario|quiz|quizz|examen|evaluacion|test|prueba|preguntas)\b/;
  const verb = /\b(haz|hazme|hacer|crea|creame|crear|genera|generame|generar|dame|quiero|necesito|prepara|preparame|arma|armame|elabora|ponme|pon|dise[nñ]a|redacta|sacame|sugiere)\b/;
  const direct = /\b(ponme a prueba|ponme una prueba|evaluame|examiname|preguntame|hazme preguntas|hazme un (quiz|test|examen))\b/;

  const isQuiz = direct.test(t) || (noun.test(t) && verb.test(t));
  if (!isQuiz) return { isQuiz: false, count: null };

  let count: number | null = null;
  const digit = t.match(/(\d{1,2})\s*(preguntas|items|cuestiones)/);
  if (digit) {
    count = parseInt(digit[1], 10);
  } else {
    const word = t.match(/\b(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(preguntas|items|cuestiones)/);
    if (word) count = NUMBER_WORDS[word[1]];
  }
  if (count !== null && (count < 1 || count > 10)) {
    count = Math.min(Math.max(count, 1), 10);
  }

  return { isQuiz: true, count };
}
