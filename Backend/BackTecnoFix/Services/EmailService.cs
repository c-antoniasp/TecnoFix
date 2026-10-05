using System.Net.Http.Headers;

namespace TecnoFix.Services;

/// <summary>
/// Implementación del servicio de envío de correos electrónicos usando la API de Resend.
/// Si no hay una API key configurada (Resend:ApiKey), solo registra el correo en el log,
/// lo que permite trabajar en local y correr las pruebas sin enviar correos reales.
/// </summary>
public class EmailService : IEmailService
{
    private const string ResendEndpoint = "https://api.resend.com/emails";
    // Remitente de pruebas de Resend; solo puede enviar al correo dueño de la cuenta.
    private const string DefaultFrom = "TecnoFix <onboarding@resend.dev>";

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
    /// Envía un correo electrónico mediante Resend, o lo registra en el log si Resend no está configurado.
    /// </summary>
    /// <exception cref="InvalidOperationException">Si Resend rechaza el envío.</exception>
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var apiKey = _configuration["Resend:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("================== [ENVÍO DE CORREO] ==================");
            _logger.LogInformation("Resend no está configurado; el correo no se envía.");
            _logger.LogInformation("Para: {To}", to);
            _logger.LogInformation("Asunto: {Subject}", subject);
            _logger.LogInformation("Contenido:\n{Body}", body);
            _logger.LogInformation("=======================================================");
            return;
        }

        var from = _configuration["Resend:From"];
        if (string.IsNullOrWhiteSpace(from))
        {
            from = DefaultFrom;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, ResendEndpoint)
        {
            Content = JsonContent.Create(new
            {
                from,
                to = new[] { to },
                subject,
                text = body
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Resend rechazó el correo a {To}: HTTP {Status} {Error}", to, (int)response.StatusCode, error);
            throw new InvalidOperationException("No se pudo enviar el correo electrónico.");
        }

        _logger.LogInformation("Correo enviado a {To} mediante Resend.", to);
    }
}
