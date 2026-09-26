namespace TecnoFix.Models
{
    public class Client : User
    {
        public string rut { get; set; } = string.Empty;
        public string phone { get; set; } = string.Empty;
    }
}