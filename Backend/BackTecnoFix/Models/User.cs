namespace TecnoFix.Models
{
    // Tabla "users": reúne administradores, técnicos y clientes; el rol define qué campos aplican.
    public class User
    {
        public Guid id { get; set; }
        public string name { get; set; } = string.Empty; // columna full_name
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty; // hash BCrypt, nunca texto plano
        public UserRole role { get; set; }
        public string? rut { get; set; } // solo clientes
        public string? phone { get; set; } // solo clientes
        public string? specialty { get; set; } // solo técnicos
        public bool accountStatus { get; set; } = true; // columna account_status
        public DateTime createdAt { get; set; } = DateTime.UtcNow; // columna created_at (UTC)
    }
}
