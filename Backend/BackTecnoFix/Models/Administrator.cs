namespace TecnoFix.Models
{
     public class Administrator
    {
        public int id { get; set; }
        public int userId { get; set; }
        public User user { get; set; } = null!;
    }
}