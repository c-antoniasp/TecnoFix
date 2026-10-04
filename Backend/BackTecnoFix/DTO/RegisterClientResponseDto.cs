namespace TecnoFix.DTO;

/// <summary>
/// Representa la respuesta emitida tras procesar el registro de un nuevo cliente.
/// Requerimiento: USU-002 (Registrar cliente).
/// </summary>
public class RegisterClientResponseDto
{
    /// <summary>
    /// Indica si el proceso de registro fue exitoso.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Mensaje descriptivo del resultado del registro (o detalle de error de validación).
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Identificador único asignado al cliente registrado en la base de datos (nulo en caso de fallo).
    /// </summary>
    public int? Id { get; set; }

    /// <summary>
    /// Correo electrónico al cual fue enviada la contraseña temporal generada aleatoriamente.
    /// </summary>
    public string? Correo { get; set; }
}
