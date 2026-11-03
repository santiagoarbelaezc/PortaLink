<?php

namespace App\Config;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

class Mailer
{
    private static function getMailer(): PHPMailer
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $_ENV['EMAIL_HOST'] ?? getenv('EMAIL_HOST') ?: 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['EMAIL_USER'] ?? getenv('EMAIL_USER') ?: 'portalinkmessage@gmail.com';
        $mail->Password   = $_ENV['EMAIL_PASS'] ?? getenv('EMAIL_PASS') ?: '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        $fromEmail = $_ENV['EMAIL_USER'] ?? getenv('EMAIL_USER') ?: 'portalinkmessage@gmail.com';
        $mail->setFrom($fromEmail, 'PortaLink');
        $mail->isHTML(true);

        return $mail;
    }

    /**
     * Resuelve la URL base del frontend garantizando prioridad al dominio de producción https://santiagoarbelaez.me
     */
    public static function getFrontendUrl(): string
    {
        $envUrl = $_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL');
        if (!empty($envUrl) && !str_contains($envUrl, 'localhost') && !str_contains($envUrl, '127.0.0.1')) {
            return rtrim($envUrl, '/');
        }

        $httpHost = $_SERVER['HTTP_HOST'] ?? '';
        if (str_contains($httpHost, 'santiagoarbelaez.me') || str_contains($httpHost, 'hstgr.io')) {
            return 'https://santiagoarbelaez.me';
        }

        $httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (str_contains($httpOrigin, 'santiagoarbelaez.me')) {
            return 'https://santiagoarbelaez.me';
        }

        return 'https://santiagoarbelaez.me';
    }

    /**
     * Envía un correo de verificación de cuenta al usuario recién registrado.
     */
    public static function sendVerificationEmail(string $email, string $nombre, string $token): bool
    {
        $frontendUrl = self::getFrontendUrl();
        $verifyUrl = "{$frontendUrl}/verify-email?token={$token}";
        $year = date('Y');

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta en PortaLink</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
            body, table, td, p, a, h1, h2, span {
              font-family: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#ffffff; font-family:'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0a0a0a; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff; padding: 48px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; text-align:left;">
                  
                  <!-- Category Pill -->
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <div style="display:inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #f5f5f5; border: 1px solid #e5e5e5;">
                        <table border="0" cellspacing="0" cellpadding="0" style="display:inline-table; vertical-align:middle;">
                          <tr>
                            <td style="width:7px; height:7px; border-radius:50%; background-color:#10b981; padding:0;"></td>
                            <td style="padding-left:8px; font-size:11px; font-weight:600; letter-spacing:0.06em; color:#171717; text-transform:uppercase;">
                              Verificación de Cuenta
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Large Editorial Heading -->
                  <tr>
                    <td style="padding-bottom: 22px;">
                      <h1 style="margin:0; font-size:32px; font-weight:600; letter-spacing:-0.03em; line-height:1.18; color:#0a0a0a;">
                        Confirma tu correo y activa tu cuenta en PortaLink
                      </h1>
                    </td>
                  </tr>

                  <!-- Description Paragraphs -->
                  <tr>
                    <td style="font-size:16px; line-height:1.75; color:#525252; font-weight:400; padding-bottom: 30px;">
                      <p style="margin:0 0 16px;">
                        Hola {$nombre}, gracias por unirte a <strong>PortaLink</strong>.
                      </p>
                      <p style="margin:0;">
                        Para activar tu cuenta y comenzar a utilizar tu panel, inteligencia artificial y herramientas de gestión, confirma tu correo electrónico:
                      </p>
                    </td>
                  </tr>

                  <!-- Action CTA Button -->
                  <tr>
                    <td style="padding-bottom: 34px;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="border-radius:12px; background-color:#09090b;">
                            <a href="{$verifyUrl}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:13px; font-weight:500; letter-spacing:0.02em; color:#ffffff !important; text-decoration:none; border-radius:12px;">
                              Verificar mi Cuenta &nbsp;&rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Direct Link Fallback Box -->
                  <tr>
                    <td style="padding-bottom: 30px;">
                      <div style="padding:16px 20px; background-color:#fafafa; border:1px solid #eaeaea; border-radius:14px;">
                        <p style="margin:0 0 8px; font-size:12px; font-weight:500; color:#737373;">
                          O copia y pega este enlace directo en tu navegador:
                        </p>
                        <div style="font-size:12px; line-height:1.5; word-break:break-all; font-family:SFMono-Regular, Consolas, Menlo, monospace; color:#171717;">
                          {$verifyUrl}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- Notice -->
                  <tr>
                    <td style="font-size:13px; line-height:1.65; color:#a3a3a3; padding-bottom: 36px; border-bottom: 1px solid #f0f0f0;">
                      Este enlace tiene una validez de <strong>24 horas</strong>. Si no solicitaste esta cuenta, puedes desestimar este mensaje con total seguridad.
                    </td>
                  </tr>

                  <!-- Simple Brand Footer -->
                  <tr>
                    <td style="padding-top: 22px; font-size:12px; color:#a3a3a3; line-height:1.6;">
                      &copy; {$year} PortaLink. Plataforma de Gestión y Enlaces.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
HTML;

        try {
            $mail = self::getMailer();
            $mail->addAddress($email, $nombre);
            $mail->Subject = 'Verifica tu cuenta en PortaLink';
            $mail->Body = $htmlContent;
            return $mail->send();
        } catch (MailException $e) {
            error_log("Error al enviar correo de verificación: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envía un correo de recuperación de contraseña con enlace único.
     */
    public static function sendPasswordResetEmail(string $email, string $nombre, string $token): bool
    {
        $frontendUrl = self::getFrontendUrl();
        $resetUrl = "{$frontendUrl}/reset-password?token={$token}";
        $year = date('Y');

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer contraseña - PortaLink</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
            body, table, td, p, a, h1, h2, span {
              font-family: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#ffffff; font-family:'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0a0a0a; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff; padding: 48px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; text-align:left;">
                  
                  <!-- Category Pill -->
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <div style="display:inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #f5f5f5; border: 1px solid #e5e5e5;">
                        <table border="0" cellspacing="0" cellpadding="0" style="display:inline-table; vertical-align:middle;">
                          <tr>
                            <td style="width:7px; height:7px; border-radius:50%; background-color:#10b981; padding:0;"></td>
                            <td style="padding-left:8px; font-size:11px; font-weight:600; letter-spacing:0.06em; color:#171717; text-transform:uppercase;">
                              Seguridad & Acceso
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Large Editorial Heading -->
                  <tr>
                    <td style="padding-bottom: 22px;">
                      <h1 style="margin:0; font-size:32px; font-weight:600; letter-spacing:-0.03em; line-height:1.18; color:#0a0a0a;">
                        Recuperar contraseña de acceso a tu cuenta
                      </h1>
                    </td>
                  </tr>

                  <!-- Description Paragraphs -->
                  <tr>
                    <td style="font-size:16px; line-height:1.75; color:#525252; font-weight:400; padding-bottom: 30px;">
                      <p style="margin:0 0 16px;">
                        Hola {$nombre}, recibimos una solicitud para restablecer la contraseña asociada a tu cuenta en <strong>PortaLink</strong>.
                      </p>
                      <p style="margin:0;">
                        Haz clic en el siguiente botón para continuar y definir una nueva contraseña segura:
                      </p>
                    </td>
                  </tr>

                  <!-- Action CTA Button -->
                  <tr>
                    <td style="padding-bottom: 34px;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="border-radius:12px; background-color:#09090b;">
                            <a href="{$resetUrl}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:13px; font-weight:500; letter-spacing:0.02em; color:#ffffff !important; text-decoration:none; border-radius:12px;">
                              Restablecer mi Contraseña &nbsp;&rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Direct Link Fallback Box -->
                  <tr>
                    <td style="padding-bottom: 30px;">
                      <div style="padding:16px 20px; background-color:#fafafa; border:1px solid #eaeaea; border-radius:14px;">
                        <p style="margin:0 0 8px; font-size:12px; font-weight:500; color:#737373;">
                          O copia y pega este enlace directo en tu navegador:
                        </p>
                        <div style="font-size:12px; line-height:1.5; word-break:break-all; font-family:SFMono-Regular, Consolas, Menlo, monospace; color:#171717;">
                          {$resetUrl}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- Security Note -->
                  <tr>
                    <td style="font-size:13px; line-height:1.65; color:#a3a3a3; padding-bottom: 36px; border-bottom: 1px solid #f0f0f0;">
                      Este enlace tiene una validez de <strong>1 hora</strong>. Si no solicitaste este restablecimiento, puedes desestimar este mensaje; tu cuenta y contraseña actual continúan seguras.
                    </td>
                  </tr>

                  <!-- Simple Brand Footer -->
                  <tr>
                    <td style="padding-top: 22px; font-size:12px; color:#a3a3a3; line-height:1.6;">
                      &copy; {$year} PortaLink. Todos los derechos reservados.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
HTML;

        try {
            $mail = self::getMailer();
            $mail->addAddress($email, $nombre);
            $mail->Subject = 'Restablece tu contraseña - PortaLink';
            $mail->Body = $htmlContent;
            return $mail->send();
        } catch (MailException $e) {
            error_log("Error al enviar correo de recuperación: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envía una notificación de actividad agendada o recordatorio 2 horas antes.
     */
    public static function sendTaskReminderEmail(string $email, string $nombre, array $task, bool $isTwoHoursReminder = false): bool
    {
        $frontendUrl = self::getFrontendUrl();
        $calendarUrl = "{$frontendUrl}/admin";
        $year = date('Y');

        $title = htmlspecialchars($task['title'] ?? 'Nueva Actividad', ENT_QUOTES, 'UTF-8');
        $desc = !empty($task['description']) ? htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8') : null;
        $date = !empty($task['task_date']) ? date('d/m/Y', strtotime($task['task_date'])) : date('d/m/Y');
        $time = !empty($task['task_time']) ? substr($task['task_time'], 0, 5) : 'Sin hora especificada';
        $type = strtolower($task['type'] ?? 'work');

        $categoryLabel = 'Trabajo';
        $catColor = '#1d4ed8';
        $catBg = '#eff6ff';
        $catBorder = '#bfdbfe';

        if ($type === 'personal') {
            $categoryLabel = 'Personal';
            $catColor = '#047857';
            $catBg = '#ecfdf5';
            $catBorder = '#a7f3d0';
        } elseif ($type === 'urgent') {
            $categoryLabel = 'Urgente';
            $catColor = '#be123c';
            $catBg = '#fff1f2';
            $catBorder = '#fecdd3';
        }

        $badgeText = $isTwoHoursReminder ? 'Recordatorio en 2 Horas' : 'Confirmación de Actividad';

        $explanation = $isTwoHoursReminder
            ? "Te enviamos este recordatorio previo para que puedas prepararte con anticipación. A continuación tienes los detalles de la actividad programada:"
            : "Has programado una nueva actividad en tu calendario. Tienes programado un recordatorio automático por correo 2 horas antes:";

        $subject = $isTwoHoursReminder
            ? "Recordatorio en 2 Horas: {$title} - PortaLink"
            : "Actividad Agendada: {$title} - PortaLink";

        $descHtml = $desc ? "
            <div style=\"margin-top:16px; padding-top:14px; border-top:1px solid #eaeaea; font-size:14px; color:#525252; line-height:1.6;\">
              <span style=\"color:#0a0a0a; display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;\">Notas Adicionales:</span>
              {$desc}
            </div>
        " : "";

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{$subject}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
            body, table, td, p, a, h1, h2, span {
              font-family: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#ffffff; font-family:'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0a0a0a; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff; padding: 48px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; text-align:left;">
                  
                  <!-- Category Pill -->
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <div style="display:inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #f5f5f5; border: 1px solid #e5e5e5;">
                        <table border="0" cellspacing="0" cellpadding="0" style="display:inline-table; vertical-align:middle;">
                          <tr>
                            <td style="width:7px; height:7px; border-radius:50%; background-color:#10b981; padding:0;"></td>
                            <td style="padding-left:8px; font-size:11px; font-weight:600; letter-spacing:0.06em; color:#171717; text-transform:uppercase;">
                              {$badgeText}
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Large Editorial Heading -->
                  <tr>
                    <td style="padding-bottom: 22px;">
                      <h1 style="margin:0; font-size:32px; font-weight:600; letter-spacing:-0.03em; line-height:1.18; color:#0a0a0a;">
                        {$title}
                      </h1>
                    </td>
                  </tr>

                  <!-- Description Paragraphs -->
                  <tr>
                    <td style="font-size:16px; line-height:1.75; color:#525252; font-weight:400; padding-bottom: 26px;">
                      <p style="margin:0 0 16px;">
                        Hola {$nombre},
                      </p>
                      <p style="margin:0;">
                        {$explanation}
                      </p>
                    </td>
                  </tr>

                  <!-- Activity Detail Card -->
                  <tr>
                    <td style="padding-bottom: 30px;">
                      <div style="padding:20px 24px; background-color:#fafafa; border:1px solid #eaeaea; border-radius:14px;">
                        <div style="display:inline-block; padding:4px 10px; border-radius:6px; background-color:{$catBg}; border:1px solid {$catBorder}; color:{$catColor}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
                          {$categoryLabel}
                        </div>
                        
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding-right:24px;">
                              <span style="font-size:11px; color:#737373; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Fecha</span>
                              <div style="font-size:14px; color:#0a0a0a; font-weight:600; margin-top:3px;">{$date}</div>
                            </td>
                            <td>
                              <span style="font-size:11px; color:#737373; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Hora</span>
                              <div style="font-size:14px; color:#0a0a0a; font-weight:700; font-family:SFMono-Regular, Consolas, Menlo, monospace; background:#ffffff; border:1px solid #eaeaea; padding:3px 10px; border-radius:6px; margin-top:3px; display:inline-block;">{$time}</div>
                            </td>
                          </tr>
                        </table>

                        {$descHtml}
                      </div>
                    </td>
                  </tr>

                  <!-- Action CTA Button -->
                  <tr>
                    <td style="padding-bottom: 34px;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="border-radius:12px; background-color:#09090b;">
                            <a href="{$calendarUrl}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:13px; font-weight:500; letter-spacing:0.02em; color:#ffffff !important; text-decoration:none; border-radius:12px;">
                              Ver en mi Calendario &nbsp;&rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer Notice -->
                  <tr>
                    <td style="font-size:13px; line-height:1.65; color:#a3a3a3; padding-bottom: 36px; border-bottom: 1px solid #f0f0f0;">
                      Este aviso ha sido enviado automáticamente según tu configuración de agenda en PortaLink a tu correo {$email}.
                    </td>
                  </tr>

                  <!-- Simple Brand Footer -->
                  <tr>
                    <td style="padding-top: 22px; font-size:12px; color:#a3a3a3; line-height:1.6;">
                      &copy; {$year} PortaLink. Todos los derechos reservados.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
HTML;

        try {
            $mail = self::getMailer();
            $mail->addAddress($email, $nombre);
            $mail->Subject = $subject;
            $mail->Body = $htmlContent;
            return $mail->send();
        } catch (MailException $e) {
            error_log("[Mailer] Error al enviar recordatorio de tarea ({$title}): " . $e->getMessage());
            return false;
        }
    }
}
