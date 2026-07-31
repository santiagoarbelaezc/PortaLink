<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;
use PDO;

class AnalyticsController
{
    private static bool $tableEnsured = false;

    private function ensureAnalyticsTable(): void
    {
        // Ya creado por schema_mysql.sql
    }

    // 1. Recibir eventos desde el frontend (público) - soporta batch en array o individual
    public function trackEvent(Request $request, Response $response): void
    {
        try {
            $this->ensureAnalyticsTable();

            $body = $request->body;
            $events = [];

            // Identificar si llega un array de eventos (batch) o un solo evento
            if (isset($body[0]) && is_array($body[0])) {
                $events = $body;
            } elseif (is_array($body) && !empty($body)) {
                $events = [$body];
            }

            if (empty($events)) {
                $response->status(200)->json(['ok' => true]);
                return;
            }

            $pdo = Database::getConnection();
            $pdo->beginTransaction();

            try {
                $stmt = $pdo->prepare("
                    INSERT INTO analytics_events (session_id, event_category, event_label, event_value) 
                    VALUES (?, ?, ?, ?)
                ");

                foreach ($events as $ev) {
                    $category = $ev['category'] ?? $ev['event_category'] ?? null;
                    if (!$category) continue;

                    $label = $ev['label'] ?? $ev['event_label'] ?? null;
                    $value = $ev['value'] ?? $ev['event_value'] ?? null;
                    $sessionId = $ev['sessionId'] ?? $ev['session_id'] ?? null;

                    $stmt->execute([
                        $sessionId ?: null,
                        $category,
                        $label !== null ? (string)$label : null,
                        $value !== null ? (string)$value : null
                    ]);
                }

                $pdo->commit();
            } catch (Exception $txErr) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                throw $txErr;
            }

            $response->status(200)->json(['ok' => true]);
        } catch (Exception $err) {
            error_log('[Analytics] Error tracking event: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error tracking events']);
        }
    }

    // 2. Obtener métricas para el dashboard (protegido)
    public function getDashboardMetrics(Request $request, Response $response): void
    {
        try {
            $this->ensureAnalyticsTable();

            // Consultar agregados generales
            $query = "
                SELECT event_category, event_label, COUNT(*) as count
                FROM analytics_events
                GROUP BY event_category, event_label
            ";
            $stmt = Database::query($query);
            $rows = $stmt->fetchAll();

            // Estructura esperada por el frontend
            $metrics = [
                'homeViews' => 0,
                'linktreeViews' => 0,
                'rotbotOpens' => 0,
                'rotbotMessagesSent' => 0,
                'sectionViews' => [],
                'linktreeClicks' => [],
                'loadTimes' => [],
                'themeSelections' => ['light' => 0, 'dark' => 0],
                'dailyTrend' => [],
                'devices' => [],
                'topLink' => ['name' => 'N/A', 'count' => 0],
                'totalClicks' => 0,
                'linkCtr' => 0
            ];

            $deviceCounts = ['mobile' => 0, 'desktop' => 0, 'tablet' => 0];

            // Popular la estructura
            foreach ($rows as $row) {
                $category = $row['event_category'] ?? '';
                $label = $row['event_label'] ?? '';
                $c = (int)($row['count'] ?? 0);

                if ($category === 'page_view') {
                    if ($label === 'home') $metrics['homeViews'] += $c;
                    if ($label === 'linktree') $metrics['linktreeViews'] += $c;
                } elseif ($category === 'rotbot') {
                    if ($label === 'open') $metrics['rotbotOpens'] += $c;
                    if ($label === 'message_sent') $metrics['rotbotMessagesSent'] += $c;
                } elseif ($category === 'section_view') {
                    $metrics['sectionViews'][$label] = ($metrics['sectionViews'][$label] ?? 0) + $c;
                } elseif ($category === 'link_click') {
                    $defaultMap = ['1' => 'tiktok', '2' => 'instagram', '3' => 'whatsapp', '4' => 'linkedin'];
                    $mappedLabel = $defaultMap[$label] ?? $label;
                    $metrics['linktreeClicks'][$mappedLabel] = ($metrics['linktreeClicks'][$mappedLabel] ?? 0) + $c;
                } elseif ($category === 'theme') {
                    if ($label === 'light') $metrics['themeSelections']['light'] += $c;
                    if ($label === 'dark') $metrics['themeSelections']['dark'] += $c;
                } elseif ($category === 'device') {
                    $lbl = strtolower($label);
                    if (str_contains($lbl, 'mobile')) $deviceCounts['mobile'] += $c;
                    elseif (str_contains($lbl, 'tablet')) $deviceCounts['tablet'] += $c;
                    else $deviceCounts['desktop'] += $c;
                }
            }

            // Calcular Dispositivos
            $totalDev = $deviceCounts['mobile'] + $deviceCounts['desktop'] + $deviceCounts['tablet'];
            if ($totalDev > 0) {
                $metrics['devices'] = [
                    ['name' => 'Mobile', 'count' => $deviceCounts['mobile'], 'pct' => (int)round(($deviceCounts['mobile'] / $totalDev) * 100)],
                    ['name' => 'Desktop', 'count' => $deviceCounts['desktop'], 'pct' => (int)round(($deviceCounts['desktop'] / $totalDev) * 100)],
                    ['name' => 'Tablet', 'count' => $deviceCounts['tablet'], 'pct' => (int)round(($deviceCounts['tablet'] / $totalDev) * 100)]
                ];
            } else {
                $metrics['devices'] = [
                    ['name' => 'Mobile', 'count' => 0, 'pct' => 58],
                    ['name' => 'Desktop', 'count' => 0, 'pct' => 35],
                    ['name' => 'Tablet', 'count' => 0, 'pct' => 7]
                ];
            }

            $buttonNamesMap = [
                'tiktok' => 'TikTok (Tarjeta)',
                'instagram' => 'Instagram (Tarjeta)',
                'whatsapp' => 'WhatsApp (Chat)',
                'linkedin' => 'LinkedIn (Tarjeta)',
                'proyectos' => 'Portafolio / Proyectos',
                'telefono' => 'Teléfono (+57 3054078225)',
                'email' => 'Correo Electrónico',
                'instagram_footer' => 'Instagram (Footer)',
                'tiktok_footer' => 'TikTok (Footer)',
                'foto_1' => 'Foto 1 - Galería',
                'foto_2' => 'Foto 2 - Galería',
                'foto_3' => 'Foto 3 - Galería',
                'foto_4' => 'Foto 4 - Galería',
                'foto_5' => 'Foto 5 - Galería',
                'pwa_instalar_btn' => 'Botón Instalar App (PWA)',
                'pwa_cerrar' => 'Cerrar Modal App (PWA)'
            ];

            // Calcular Top Link, Clicks y CTR
            $totalC = 0;
            $topName = 'Ninguno';
            $topCount = -1;
            foreach ($metrics['linktreeClicks'] as $key => $val) {
                $totalC += $val;
                if ($val > $topCount) {
                    $topCount = $val;
                    $topName = $key;
                }
            }
            $metrics['totalClicks'] = $totalC;
            $formattedTopName = $buttonNamesMap[$topName] ?? ucfirst($topName);
            $metrics['topLink'] = [
                'name' => $topCount > 0 ? $formattedTopName : 'Sin clics aún',
                'count' => $topCount > 0 ? $topCount : 0
            ];
            $metrics['linkCtr'] = $metrics['linktreeViews'] > 0 ? min(100, (int)round(($totalC / $metrics['linktreeViews']) * 100)) : 0;

            // Consultar Tendencia de 7 Días Reales
            $trendQuery = "
                SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as day,
                       event_label,
                       COUNT(*) as count
                FROM analytics_events
                WHERE event_category = 'page_view'
                  AND created_at >= CURDATE() - INTERVAL 6 DAY
                GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), event_label
                ORDER BY day ASC
            ";
            $stmtTrend = Database::query($trendQuery);
            $trendMap = [];
            foreach ($stmtTrend->fetchAll() as $r) {
                $day = $r['day'];
                if (!isset($trendMap[$day])) $trendMap[$day] = ['home' => 0, 'linktree' => 0];
                if ($r['event_label'] === 'home') $trendMap[$day]['home'] += (int)$r['count'];
                if ($r['event_label'] === 'linktree') $trendMap[$day]['linktree'] += (int)$r['count'];
            }

            $dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            $dailyTrend = [];
            for ($i = 6; $i >= 0; $i--) {
                $timestamp = strtotime("-{$i} days");
                $dateStr = date('Y-m-d', $timestamp);
                $dayName = $dayNames[(int)date('w', $timestamp)];
                $data = $trendMap[$dateStr] ?? ['home' => 0, 'linktree' => 0];
                $dailyTrend[] = [
                    'day' => $dayName,
                    'date' => $dateStr,
                    'home' => $data['home'],
                    'linktree' => $data['linktree'],
                    'total' => $data['home'] + $data['linktree']
                ];
            }
            $metrics['dailyTrend'] = $dailyTrend;

            // Obtener últimos 20 load times
            $stmtLoad = Database::query("
                SELECT event_value FROM analytics_events 
                WHERE event_category = 'performance' AND event_label = 'load_time' 
                ORDER BY created_at DESC LIMIT 20
            ");
            $loadTimes = [];
            foreach ($stmtLoad->fetchAll() as $r) {
                if (is_numeric($r['event_value'])) {
                    $loadTimes[] = (float)$r['event_value'];
                }
            }
            $metrics['loadTimes'] = $loadTimes;

            $response->json(['ok' => true, 'metrics' => $metrics]);
        } catch (Exception $error) {
            error_log('[Analytics] Error getting metrics: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error getting metrics']);
        }
    }
}
