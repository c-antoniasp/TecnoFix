namespace TecnoFix.Services;

/// <summary>
/// Implementación del servicio de envío de correos electrónicos.
/// Registra los envíos en el sistema de logging para trazabilidad.
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Simula y registra el envío de un correo electrónico.
    /// </summary>
    public Task SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation("================== [ENVÍO DE CORREO] ==================");
        _logger.LogInformation("Para: {To}", to);
        _logger.LogInformation("Asunto: {Subject}", subject);
        _logger.LogInformation("Contenido:\n{Body}", body);
        _logger.LogInformation("=======================================================");

        return Task.CompletedTask;
    }
}
