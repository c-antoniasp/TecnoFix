namespace TecnoFix.Models
{
    public class Technician
    {
        public int id { get; set; }
        public int userId { get; set; }
        public User user { get; set; } = null!;
        public string technicianType { get; set; } = string.Empty;
        public bool enabled { get; set; } = true;
    }
}