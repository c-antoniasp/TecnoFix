namespace BackTecnoFix.Services;

/// <summary>
/// Excepción lanzada por AuthService ante errores de autenticación o reglas de acceso.
/// </summary>
public class AuthException : Exception
{
    public int statusCode { get; }

    public AuthException(string message, int statusCode = 401) : base(message)
    {
        this.statusCode = statusCode;
    }
}
