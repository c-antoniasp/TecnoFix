namespace TecnoFix.DTO
{
    public class ChangePasswordRequestDTO
    {
        public string? currentPassword { get; set; } = string.Empty;
        public string? newPassword { get; set; } = string.Empty;
        public string? confirmPassword { get; set; } = string.Empty;
    }
}
