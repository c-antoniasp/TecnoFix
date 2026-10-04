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
    /// <param name="body">Cuerpo o mensaje del correo.</param>
    Task SendEmailAsync(string to, string subject, string body);
}
