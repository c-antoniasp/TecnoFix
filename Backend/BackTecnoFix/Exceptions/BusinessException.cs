namespace TecnoFix.Exceptions
{
    public class BusinessException : Exception
    {
        // Código HTTP con el que el controlador responde (400 por defecto).
        public int statusCode { get; }

        public BusinessException(string message, int statusCode = 400) : base(message)
        {
            this.statusCode = statusCode;
        }
    }
}
