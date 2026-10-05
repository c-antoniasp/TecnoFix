namespace TecnoFix.DTO;

/// <summary>
/// Representa la solicitud de inicio de sesión de un usuario.
/// Requerimiento: USU-001 (Iniciar sesión).
/// </summary>
public class LoginRequestDto
{
    /// <summary>
    /// Correo electrónico del usuario.
    /// </summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>
    /// Contraseña del usuario.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}
