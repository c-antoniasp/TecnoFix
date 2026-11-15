namespace TecnoFix.DTO;

/// <summary>
/// Representa la solicitud de registro de un cliente en el sistema.
/// Requerimiento: USU-002 (Registrar cliente).
/// </summary>
public class RegisterClientRequestDto
{
    /// <summary>
    /// Nombre y apellidos del cliente.
    /// Campo obligatorio.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Correo electrónico del cliente.
    /// Campo obligatorio y único en el sistema.
    /// </summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>
    /// RUT del cliente ingresado sin puntos ni guion (ejemplo: 12345670K).
    /// Campo obligatorio, único y validado mediante algoritmo Módulo 11 (Chile).
    /// </summary>
    public string Rut { get; set; } = string.Empty;

    /// <summary>
    /// Teléfono de contacto del cliente.
    /// Campo obligatorio.
    /// </summary>
    public string Telefono { get; set; } = string.Empty;
}
