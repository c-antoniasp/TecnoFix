namespace TecnoFix.Models
{
    public class Engineer : User
    {
        public string Role { get; set; } = string.Empty;
        public bool isAvailable { get; set; } = true;
    }
}