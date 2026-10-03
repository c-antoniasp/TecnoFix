namespace TecnoFix.Models
{
    public class Engineer : User
    {
        public string technicianType { get; set; } = string.Empty;
        public bool enabled { get; set; } = true;
    }
}