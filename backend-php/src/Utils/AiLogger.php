<?php

namespace App\Utils;

class AiLogger
{
    private static string $logFile = __DIR__ . '/../../logs/ai_errors.log';

    public static function log(string $level, string $provider, string $message, array $context = []): void
    {
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }

        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' | Context: ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        $logEntry = "[{$timestamp}] [{$level}] [{$provider}] {$message}{$contextStr}" . PHP_EOL;

        @file_put_contents(self::$logFile, $logEntry, FILE_APPEND | LOCK_EX);
        error_log("[{$level}] [{$provider}] {$message}");
    }

    public static function warning(string $provider, string $message, array $context = []): void
    {
        self::log('WARNING', $provider, $message, $context);
    }

    public static function error(string $provider, string $message, array $context = []): void
    {
        self::log('ERROR', $provider, $message, $context);
    }

    public static function info(string $provider, string $message, array $context = []): void
    {
        self::log('INFO', $provider, $message, $context);
    }
}
