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
     * Envía un correo de verificación de cuenta al usuario recién registrado.
     */
    public static function sendVerificationEmail(string $email, string $nombre, string $token): bool
    {
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL') ?: 'http://localhost:4200';
        $verifyUrl = "{$frontendUrl}/verify-email?token={$token}";
        $year = date('Y');

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta de PortaLink</title>
        </head>
        <body style="margin:0; padding:0; background-color:#0a0a0c; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#e5e5e5;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0a0a0c; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px; background-color:#121217; border:1px solid #22222b; border-radius:16px; overflow:hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; border-bottom:1px solid #1c1c24; text-align:center;">
                      <span style="font-size:22px; font-weight:900; letter-spacing:3px; color:#ffffff; text-transform:uppercase;">PORTALINK</span>
                      <div style="font-size:10px; font-weight:700; letter-spacing:2px; color:#00b4d8; text-transform:uppercase; margin-top:4px;">Verificación de Seguridad</div>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h1 style="margin:0 0 16px; font-size:20px; font-weight:700; color:#ffffff;">¡Hola, {$nombre}! 👋</h1>
                      <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#a1a1aa;">
                        Gracias por registrarte en <strong style="color:#ffffff;">PortaLink</strong>. Para activar tu cuenta y acceder a tu perfil, herramientas de IA y landing pages personalizadas, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:
                      </p>
                      
                      <!-- Button -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center" style="border-radius:12px; background:linear-gradient(135deg, #00b4d8, #0077b6);">
                            <a href="{$verifyUrl}" target="_blank" style="display:inline-block; padding:15px 32px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; text-transform:uppercase; letter-spacing:1px;">
                              Verificar mi Cuenta
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 12px; font-size:12px; line-height:1.6; color:#71717a;">
                        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                      </p>
                      <p style="margin:0 0 24px; font-size:11px; word-break:break-all; font-family:monospace; color:#00b4d8; background-color:#181820; padding:12px; border-radius:8px;">
                        {$verifyUrl}
                      </p>

                      <p style="margin:0; font-size:12px; color:#71717a;">
                        Este enlace expira en <strong>24 horas</strong>. Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color:#0d0d11; border-top:1px solid #1c1c24; text-align:center; font-size:11px; color:#52525b;">
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
            $mail->Subject = '✨ Verifica tu cuenta en PortaLink';
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
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? getenv('FRONTEND_URL') ?: 'http://localhost:4200';
        $resetUrl = "{$frontendUrl}/reset-password?token={$token}";
        $year = date('Y');

        $htmlContent = <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer contraseña de PortaLink</title>
        </head>
        <body style="margin:0; padding:0; background-color:#0a0a0c; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#e5e5e5;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0a0a0c; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px; background-color:#121217; border:1px solid #22222b; border-radius:16px; overflow:hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; border-bottom:1px solid #1c1c24; text-align:center;">
                      <span style="font-size:22px; font-weight:900; letter-spacing:3px; color:#ffffff; text-transform:uppercase;">PORTALINK</span>
                      <div style="font-size:10px; font-weight:700; letter-spacing:2px; color:#f59e0b; text-transform:uppercase; margin-top:4px;">Seguridad de la Cuenta</div>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h1 style="margin:0 0 16px; font-size:20px; font-weight:700; color:#ffffff;">Recuperación de Contraseña 🔐</h1>
                      <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#a1a1aa;">
                        Hola {$nombre}, recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color:#ffffff;">PortaLink</strong>. Haz clic en el botón para crear una nueva contraseña:
                      </p>
                      
                      <!-- Button -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center" style="border-radius:12px; background:linear-gradient(135deg, #f59e0b, #d97706);">
                            <a href="{$resetUrl}" target="_blank" style="display:inline-block; padding:15px 32px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; text-transform:uppercase; letter-spacing:1px;">
                              Restablecer mi Contraseña
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 12px; font-size:12px; line-height:1.6; color:#71717a;">
                        O copia este enlace en tu navegador web:
                      </p>
                      <p style="margin:0 0 24px; font-size:11px; word-break:break-all; font-family:monospace; color:#f59e0b; background-color:#181820; padding:12px; border-radius:8px;">
                        {$resetUrl}
                      </p>

                      <p style="margin:0; font-size:12px; color:#71717a;">
                        Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste restablecer tu contraseña, ignora este correo; tu contraseña actual seguirá siendo segura.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color:#0d0d11; border-top:1px solid #1c1c24; text-align:center; font-size:11px; color:#52525b;">
                      &copy; {$year} PortaLink. Seguridad y Soporte.
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
            $mail->Subject = '🔒 Restablece tu contraseña en PortaLink';
            $mail->Body = $htmlContent;
            return $mail->send();
        } catch (MailException $e) {
            error_log("Error al enviar correo de recuperación: " . $e->getMessage());
            return false;
        }
    }
}
