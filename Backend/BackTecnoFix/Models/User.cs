namespace TecnoFix.Models
{
    // Clase abstracta que representa a un usuario en el sistema.
    public abstract class User
    {
        public int id { get; set; }

        public string name { get; set; } = string.Empty;

        public string email { get; set; } = string.Empty;

        public string password { get; set; } = string.Empty;

    }
}