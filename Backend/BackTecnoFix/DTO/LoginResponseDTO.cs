namespace TecnoFix.DTO;

/// <summary>
/// Representa la respuesta de un intento de inicio de sesión.
/// Requerimiento: USU-001 (Iniciar sesión).
/// </summary>
public class LoginResponseDto
{
    /// <summary>
    /// Token de autenticación (JWT u otro) si el inicio de sesión es exitoso.
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Nombre del usuario autenticado.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Rol asignado al usuario (Administrador, Técnico, Cliente).
    /// </summary>
    public string Rol { get; set; } = string.Empty;

    /// <summary>
    /// Mensaje descriptivo del resultado de la autenticación.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
