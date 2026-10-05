using System.Text.Json;
using System.Text.Json.Serialization;

namespace TecnoFix.Services;

/// <summary>
/// Implementación del servicio de envío de correos electrónicos usando la API de Brevo.
/// Si no hay una API key configurada (Brevo:ApiKey), solo registra el correo en el log,
/// lo que permite trabajar en local y correr las pruebas sin enviar correos reales.
/// </summary>
public class EmailService : IEmailService
{
    private const string BrevoEndpoint = "https://api.brevo.com/v3/smtp/email";
    private const string DefaultSenderName = "TecnoFix";

    // Omite "htmlContent" cuando no se envía cuerpo HTML.
    private static readonly JsonSerializerOptions SkipNullsOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(HttpClient httpClient, IConfiguration configuration, ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Envía un correo electrónico mediante Brevo, o lo registra en el log si Brevo no está configurado.
    /// </summary>
    /// <exception cref="InvalidOperationException">Si Brevo rechaza el envío.</exception>
    public async Task SendEmailAsync(string to, string subject, string body, string? htmlBody = null)
    {
        var apiKey = _configuration["Brevo:ApiKey"];
        // El remitente debe estar verificado en Brevo (Senders, Domains & Dedicated IPs → Senders).
        var senderEmail = _configuration["Brevo:SenderEmail"];

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
        {
            _logger.LogInformation("================== [ENVÍO DE CORREO] ==================");
            _logger.LogInformation("Brevo no está configurado; el correo no se envía.");
            _logger.LogInformation("Para: {To}", to);
            _logger.LogInformation("Asunto: {Subject}", subject);
            _logger.LogInformation("Contenido:\n{Body}", body);
            _logger.LogInformation("=======================================================");
            return;
        }

        var senderName = _configuration["Brevo:SenderName"];
        if (string.IsNullOrWhiteSpace(senderName))
        {
            senderName = DefaultSenderName;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, BrevoEndpoint)
        {
            Content = JsonContent.Create(new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = to } },
                subject,
                textContent = body,
                htmlContent = htmlBody
            }, options: SkipNullsOptions)
        };
        request.Headers.Add("api-key", apiKey);

        using var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Brevo rechazó el correo a {To}: HTTP {Status} {Error}", to, (int)response.StatusCode, error);
            throw new InvalidOperationException("No se pudo enviar el correo electrónico.");
        }

        _logger.LogInformation("Correo enviado a {To} mediante Brevo.", to);
    }
}
