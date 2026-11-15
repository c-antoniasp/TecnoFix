namespace TecnoFix.Services;

/// <summary>
/// Interfaz para el servicio de envío de notificaciones y correos electrónicos.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Envía un correo electrónico al destinatario indicado.
    /// </summary>
    /// <param name="to">Dirección de correo destino.</param>
    /// <param name="subject">Asunto del correo.</param>
    /// <param name="body">Cuerpo del correo en texto plano.</param>
    /// <param name="htmlBody">Cuerpo del correo en HTML (opcional).</param>
    Task SendEmailAsync(string to, string subject, string body, string? htmlBody = null);
}
