namespace TecnoFix.Services;

public class AuthException : Exception
{
    public int statusCode { get; }

    public AuthException(int statusCode, string message) : base(message)
    {
        this.statusCode = statusCode;
    }
}
