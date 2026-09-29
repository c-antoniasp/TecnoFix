namespace TecnoFix.Services
{
    // Error de negocio del login, con el código HTTP que corresponde.
    public class AuthException : Exception
    {
        public int statusCode { get; }

        public AuthException(int statusCode, string message) : base(message)
        {
            this.statusCode = statusCode;
        }
    }
}