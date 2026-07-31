<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class SiteController
{
    private function cleanSlug(string $text): string
    {
        $text = strtolower($text);
        if (class_exists('Normalizer')) {
            $text = \Normalizer::normalize($text, \Normalizer::FORM_D);
        }
        $text = preg_replace('/[\x{0300}-\x{036f}]/u', '', $text);
        $text = preg_replace('/\s+/', '-', $text);
        $text = preg_replace('/[^a-z0-9\-]/', '', $text);
        return trim($text, '-');
    }

    public function getMySite(Request $request, Response $response): void
    {
        try {
            $userId = (int)$request->user->id;
            $stmt = Database::query('SELECT * FROM user_sites WHERE user_id = $1', [$userId]);
            $site = $stmt->fetch();

            if (!$site) {
                $response->status(404)->json([
                    'ok' => false,
                    'message' => 'Aún no tienes una landing page generada.'
                ]);
                return;
            }

            if (is_string($site['site_data'] ?? null)) {
                $site['site_data'] = json_decode($site['site_data'], true);
            }

            $response->json([
                'ok' => true,
                'site' => $site
            ]);
        } catch (Exception $err) {
            error_log('[SiteController] getMySite error: ' . $err->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al obtener tu landing page.'
            ]);
        }
    }

    public function saveMySite(Request $request, Response $response): void
    {
        try {
            $userId = (int)$request->user->id;
            $siteData = $request->body['site_data'] ?? null;

            if (!$siteData || !is_array($siteData)) {
                $response->status(400)->json([
                    'ok' => false,
                    'message' => 'Estructura de site_data inválida.'
                ]);
                return;
            }

            $rawName = $request->user->nombre ?? $siteData['hero']['name'] ?? 'mi-sitio';
            $cleanName = $this->cleanSlug($rawName) ?: 'mi-sitio';
            $slug = "{$cleanName}-{$userId}";

            Database::query(
                "INSERT INTO user_sites (user_id, site_data, slug, updated_at)
                 VALUES ($1, $2, $3, NOW())
                 ON DUPLICATE KEY UPDATE site_data = VALUES(site_data), slug = VALUES(slug), updated_at = NOW()",
                [$userId, json_encode($siteData, JSON_UNESCAPED_UNICODE), $slug]
            );
            $stmt = Database::query("SELECT slug FROM user_sites WHERE user_id = $1", [$userId]);
            $row = $stmt->fetch();

            $response->json([
                'ok' => true,
                'slug' => $row['slug'] ?? $slug,
                'message' => 'Landing page guardada exitosamente.'
            ]);
        } catch (Exception $err) {
            error_log('[SiteController] saveMySite error: ' . $err->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al guardar la landing page.'
            ]);
        }
    }

    public function getBySlug(Request $request, Response $response): void
    {
        try {
            $slug = $request->params['slug'] ?? null;
            if (!$slug) {
                $response->status(400)->json(['ok' => false, 'message' => 'Slug requerido']);
                return;
            }

            $stmt = Database::query('SELECT * FROM user_sites WHERE slug = $1', [$slug]);
            $row = $stmt->fetch();

            if (!$row) {
                $response->status(404)->json([
                    'ok' => false,
                    'message' => 'Landing page no encontrada para este enlace.'
                ]);
                return;
            }

            $siteData = is_string($row['site_data'] ?? null) ? json_decode($row['site_data'], true) : ($row['site_data'] ?? []);

            $response->json([
                'ok' => true,
                'site' => [
                    'slug' => $row['slug'],
                    'site_data' => $siteData,
                    'updated_at' => $row['updated_at']
                ]
            ]);
        } catch (Exception $err) {
            error_log('[SiteController] getBySlug error: ' . $err->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al cargar la landing page.'
            ]);
        }
    }
}
