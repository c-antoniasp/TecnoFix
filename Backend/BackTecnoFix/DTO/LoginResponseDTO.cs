namespace TecnoFix.DTO
{
    public class LoginResponseDTO
    {
        public Guid userId { get; set; }
        public string name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string role { get; set; } = string.Empty;   // ADMIN, TECHNICIAN o CLIENT
        public string token { get; set; } = string.Empty;
    }
}