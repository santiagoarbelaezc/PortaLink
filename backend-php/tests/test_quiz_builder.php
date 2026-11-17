<?php
/**
 * Test offline de QuizBuilder (sin llamadas a IA): extracción de JSON,
 * validación, normalización, mezcla de opciones y límites.
 *
 * Ejecutar: php backend-php/tests/test_quiz_builder.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Utils\QuizBuilder;

$passed = 0;
$failed = 0;

function check(string $name, bool $cond): void
{
    global $passed, $failed;
    if ($cond) {
        $passed++;
        echo "\033[32m  PASS\033[0m  {$name}\n";
    } else {
        $failed++;
        echo "\033[31m  FAIL\033[0m  {$name}\n";
    }
}

function sampleQuiz(int $n = 5): array
{
    $qs = [];
    for ($i = 1; $i <= $n; $i++) {
        $qs[] = [
            'question' => "Pregunta {$i} sobre `SELECT`?",
            'options' => ["Correcta {$i}", "Distractor A{$i}", "Distractor B{$i}"],
            'correct_index' => 0,
            'explanation' => "Porque la {$i} es correcta."
        ];
    }
    return ['title' => 'Consultas SQL', 'topic' => 'SQL', 'questions' => $qs];
}

echo "\n== QuizBuilder ==\n";

// 1. extractJson: JSON limpio
$json = json_encode(sampleQuiz());
check('extractJson acepta JSON limpio', is_array(QuizBuilder::extractJson($json)));

// 2. extractJson: dentro de fences ```json
check('extractJson acepta fences ```json', is_array(QuizBuilder::extractJson("```json\n{$json}\n```")));

// 3. extractJson: con prosa alrededor
check('extractJson acepta texto alrededor', is_array(QuizBuilder::extractJson("Aquí está:\n{$json}\nEspero que sirva.")));

// 4. extractJson: basura
check('extractJson devuelve null con basura', QuizBuilder::extractJson('no es json') === null);
check('extractJson devuelve null con vacío', QuizBuilder::extractJson('') === null);

// 5. normalize: caso feliz
$q = QuizBuilder::normalize(sampleQuiz(), 5, 3, true);
check('normalize devuelve 5 preguntas', $q !== null && count($q['questions']) === 5);
check('cada pregunta tiene 3 opciones', $q !== null && count(array_filter($q['questions'], fn($x) => count($x['options']) === 3)) === 5);
check('correctIndex en rango 0-2', $q !== null && count(array_filter($q['questions'], fn($x) => $x['correctIndex'] >= 0 && $x['correctIndex'] <= 2)) === 5);
check('selectedIndex inicia en null', $q !== null && $q['questions'][0]['selectedIndex'] === null);

// 6. La opción correcta sigue siendo la correcta tras mezclar
$okAfterShuffle = true;
foreach ($q['questions'] as $i => $item) {
    $expected = 'Correcta ' . ($i + 1);
    if ($item['options'][$item['correctIndex']] !== $expected) {
        $okAfterShuffle = false;
    }
}
check('el correctIndex apunta a la respuesta correcta tras mezclar', $okAfterShuffle);

// 7. La mezcla distribuye la posición correcta (no siempre 0) en muchas corridas
$positions = [];
for ($k = 0; $k < 40; $k++) {
    $n = QuizBuilder::normalize(sampleQuiz(), 5, 3, true);
    foreach ($n['questions'] as $item) {
        $positions[$item['correctIndex']] = true;
    }
}
check('la respuesta correcta aparece en las 3 posiciones', count($positions) === 3);

// 8. Sin mezcla conserva el orden
$noShuffle = QuizBuilder::normalize(sampleQuiz(), 5, 3, false);
check('sin shuffle el correctIndex se conserva', $noShuffle['questions'][0]['correctIndex'] === 0);

// 9. Menos preguntas de las pedidas => null
check('menos de 5 preguntas válidas => null', QuizBuilder::normalize(sampleQuiz(4), 5, 3) === null);

// 10. Más preguntas de las pedidas => se recorta
$many = QuizBuilder::normalize(sampleQuiz(8), 5, 3);
check('más de 5 preguntas => recorta a 5', $many !== null && count($many['questions']) === 5);

// 11. correct_index fuera de rango => descarta esa pregunta
$bad = sampleQuiz(5);
$bad['questions'][2]['correct_index'] = 7;
check('correct_index fuera de rango invalida el quiz', QuizBuilder::normalize($bad, 5, 3) === null);

// 12. Opciones duplicadas => descarta
$dup = sampleQuiz(5);
$dup['questions'][0]['options'] = ['Igual', 'Igual', 'Otra'];
check('opciones duplicadas invalidan la pregunta', QuizBuilder::normalize($dup, 5, 3) === null);

// 13. Más de 3 opciones => recorta conservando la correcta
$extra = sampleQuiz(5);
$extra['questions'][0]['options'] = ['X1', 'X2', 'La buena', 'X3'];
$extra['questions'][0]['correct_index'] = 2;
$ex = QuizBuilder::normalize($extra, 5, 3, false);
check('4 opciones se recortan a 3 conservando la correcta', $ex !== null && count($ex['questions'][0]['options']) === 3 && $ex['questions'][0]['options'][$ex['questions'][0]['correctIndex']] === 'La buena');

// 14. Limpieza de prefijos y emojis
$pref = sampleQuiz(5);
$pref['questions'][0]['options'] = ['A) Correcta 1', 'B. Distractor A1', 'C) Distractor B1'];
$pref['questions'][0]['question'] = '💡 Pregunta con emoji';
$pn = QuizBuilder::normalize($pref, 5, 3, false);
check('quita prefijos A) B. C)', $pn !== null && $pn['questions'][0]['options'][0] === 'Correcta 1');
check('quita emojis del enunciado', $pn !== null && strpos($pn['questions'][0]['question'], '💡') === false);

// 15. Título por defecto
$noTitle = sampleQuiz(5);
unset($noTitle['title']);
$nt = QuizBuilder::normalize($noTitle, 5, 3);
check('título por defecto cuando falta', $nt !== null && $nt['title'] === 'Cuestionario de estudio');

// 16. clampQuestions
check('clamp: null => 5', QuizBuilder::clampQuestions(null) === 5);
check('clamp: 8 => 8', QuizBuilder::clampQuestions(8) === 8);
check('clamp: 50 => 10', QuizBuilder::clampQuestions(50) === 10);
check('clamp: 0 => 5', QuizBuilder::clampQuestions(0) === 5);

// 17. Prompt de sistema menciona cantidades
$sp = QuizBuilder::systemPrompt(5, 3);
check('systemPrompt incluye 5 preguntas y 3 opciones', strpos($sp, 'exactamente 5 preguntas') !== false && strpos($sp, 'exactamente 3 opciones') !== false);

echo "\nTOTAL: " . ($passed + $failed) . "  PASSED: {$passed}  FAILED: {$failed}\n";
exit($failed > 0 ? 1 : 0);
