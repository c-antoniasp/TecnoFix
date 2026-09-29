namespace TecnoFix.Models
{

   public class User
    {
        public int id { get; set; }
        public string name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty; // hash BCrypt, nunca texto plano
        public UserRole role { get; set; }
        }
}