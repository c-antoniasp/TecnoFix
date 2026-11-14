namespace BackTecnoFix.Services;

/// <summary>
/// Excepción para representar errores de reglas de negocio con su respectivo código de estado HTTP.
/// Permite enviar al frontend el formato estándar { "message": "..." }.
/// </summary>
public class BusinessException : Exception
{
    public int statusCode { get; }

    public BusinessException(string message, int statusCode = 400) : base(message)
    {
        this.statusCode = statusCode;
    }
}
