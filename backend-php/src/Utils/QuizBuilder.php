<?php

namespace App\Utils;

/**
 * Utilidades puras (sin red) para construir cuestionarios de estudio a partir
 * de la respuesta de una IA: extracción tolerante de JSON, validación estricta,
 * normalización y mezcla de opciones.
 */
class QuizBuilder
{
    public const DEFAULT_QUESTIONS = 5;
    public const DEFAULT_OPTIONS = 3;
    public const MAX_QUESTIONS = 10;

    /**
     * Prompt de sistema para la generación del cuestionario.
     */
    public static function systemPrompt(int $numQuestions, int $numOptions): string
    {
        $last = $numOptions - 1;
        return <<<PROMPT
Eres RotBot Apuntes IA, un tutor experto que crea cuestionarios de estudio para PortaLink.

Debes responder EXCLUSIVAMENTE con un objeto JSON válido, sin texto antes ni después, sin bloques ``` y sin comentarios.

Formato exacto:
{
  "title": "Título corto del cuestionario",
  "topic": "Tema principal",
  "questions": [
    {
      "question": "Enunciado de la pregunta",
      "options": ["Opción A", "Opción B", "Opción C"],
      "correct_index": 0,
      "explanation": "Explicación breve (1 o 2 frases) de por qué la respuesta correcta es correcta"
    }
  ]
}

REGLAS OBLIGATORIAS:
1. Genera exactamente {$numQuestions} preguntas.
2. Cada pregunta tiene exactamente {$numOptions} opciones; solo UNA es correcta. "correct_index" es el índice (0 a {$last}) de la correcta.
3. Los distractores deben ser plausibles (errores típicos), nunca absurdos ni obvios.
4. Dificultad progresiva: de básica a intermedia.
5. Basa las preguntas en el contenido del apunte y en la conversación previa; si hay poco contexto, usa el tema que pidió el usuario.
6. Si el tema es SQL u otro código, puedes incluir fragmentos cortos dentro de las opciones o del enunciado usando backticks simples (`SELECT * FROM t`).
7. Español claro y profesional. SIN emojis ni iconos decorativos.
8. Las opciones deben ser textos cortos (máximo ~120 caracteres) y no deben empezar con "A)", "B)" ni numeración.
PROMPT;
    }

    /**
     * Extrae el primer objeto JSON de un texto, aunque venga rodeado de ``` o prosa.
     */
    public static function extractJson(string $raw): ?array
    {
        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        // Quitar fences ```json ... ```
        if (preg_match('/```(?:json)?\s*(.*?)```/is', $raw, $m)) {
            $raw = trim($m[1]);
        }

        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Recortar desde la primera { hasta la última }
        $start = strpos($raw, '{');
        $end = strrpos($raw, '}');
        if ($start !== false && $end !== false && $end > $start) {
            $decoded = json_decode(substr($raw, $start, $end - $start + 1), true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    /**
     * Valida y normaliza el cuestionario. Devuelve null si es irrecuperable.
     *
     * @param array $data   JSON decodificado de la IA
     * @param bool  $shuffle Mezclar opciones y recalcular correctIndex
     */
    public static function normalize(array $data, int $numQuestions = self::DEFAULT_QUESTIONS, int $numOptions = self::DEFAULT_OPTIONS, bool $shuffle = true): ?array
    {
        $rawQuestions = $data['questions'] ?? null;
        if (!is_array($rawQuestions)) {
            return null;
        }

        $questions = [];
        foreach ($rawQuestions as $q) {
            if (!is_array($q)) {
                continue;
            }

            $text = self::cleanText($q['question'] ?? '');
            $options = $q['options'] ?? null;
            if ($text === '' || !is_array($options)) {
                continue;
            }

            $options = array_values(array_filter(array_map(function ($o) {
                return self::cleanOption($o);
            }, $options), fn($o) => $o !== ''));

            // Debe traer al menos las opciones requeridas
            if (count($options) < $numOptions) {
                continue;
            }

            $correct = $q['correct_index'] ?? $q['correctIndex'] ?? null;
            if (!is_numeric($correct)) {
                continue;
            }
            $correct = (int)$correct;
            if ($correct < 0 || $correct >= count($options)) {
                continue;
            }

            // Si trae más opciones de las requeridas, conservar la correcta + distractores
            if (count($options) > $numOptions) {
                $correctText = $options[$correct];
                $distractors = [];
                foreach ($options as $i => $opt) {
                    if ($i !== $correct) {
                        $distractors[] = $opt;
                    }
                }
                $options = array_merge([$correctText], array_slice($distractors, 0, $numOptions - 1));
                $correct = 0;
            }

            // Descartar preguntas con opciones duplicadas
            if (count(array_unique(array_map('mb_strtolower', $options))) !== count($options)) {
                continue;
            }

            if ($shuffle) {
                $correctText = $options[$correct];
                shuffle($options);
                $correct = (int)array_search($correctText, $options, true);
            }

            $questions[] = [
                'id'            => 'q-' . (count($questions) + 1),
                'question'      => $text,
                'options'       => $options,
                'correctIndex'  => $correct,
                'explanation'   => self::cleanText($q['explanation'] ?? ''),
                'selectedIndex' => null,
            ];

            if (count($questions) >= $numQuestions) {
                break;
            }
        }

        // Exigimos el número pedido de preguntas válidas
        if (count($questions) < $numQuestions) {
            return null;
        }

        $title = self::cleanText($data['title'] ?? '');
        $topic = self::cleanText($data['topic'] ?? '');

        return [
            'title'     => $title !== '' ? $title : 'Cuestionario de estudio',
            'topic'     => $topic,
            'questions' => $questions,
        ];
    }

    /**
     * Acota el número de preguntas pedido por el usuario.
     */
    public static function clampQuestions($value): int
    {
        $n = is_numeric($value) ? (int)$value : self::DEFAULT_QUESTIONS;
        if ($n < 1) {
            return self::DEFAULT_QUESTIONS;
        }
        return min($n, self::MAX_QUESTIONS);
    }

    private static function cleanText($value): string
    {
        $text = is_string($value) ? $value : (is_scalar($value) ? (string)$value : '');
        return trim(self::stripEmojis($text));
    }

    private static function cleanOption($value): string
    {
        $text = self::cleanText($value);
        // Quitar prefijos "A) ", "B. ", "1) " que la IA pueda añadir
        $text = preg_replace('/^\(?[A-Ca-c1-3][\)\.\:]\s+/u', '', $text);
        return trim($text);
    }

    private static function stripEmojis(string $text): string
    {
        $clean = preg_replace('/[\x{1F000}-\x{1FFFF}\x{2600}-\x{27BF}\x{FE0F}\x{FE0E}\x{20E3}]/u', '', $text);
        return $clean === null ? $text : $clean;
    }
}
