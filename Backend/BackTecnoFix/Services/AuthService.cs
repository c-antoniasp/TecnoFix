using TecnoFix.DTO;
using TecnoFix.Repositories;

namespace TecnoFix.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository userRepository;

        public AuthService(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public async Task changePassword(int userId, ChangePasswordRequestDTO? request)
        {
            if (userId <= 0)
            {
                throw new AuthException(401, "Debe iniciar sesión nuevamente.");
            }

            if (request is null || string.IsNullOrWhiteSpace(request.currentPassword))
            {
                throw new AuthException(400, "Debe completar el campo contraseña actual.");
            }

            if (string.IsNullOrWhiteSpace(request.newPassword))
            {
                throw new AuthException(400, "Debe completar el campo nueva contraseña.");
            }

            if (string.IsNullOrWhiteSpace(request.confirmPassword))
            {
                throw new AuthException(400, "Debe completar el campo confirmación de la nueva contraseña.");
            }

            var currentPasswordHash = await userRepository.findPasswordById(userId)
                ?? throw new AuthException(401, "Debe iniciar sesión nuevamente.");

            if (!passwordMatches(request.currentPassword, currentPasswordHash))
            {
                throw new AuthException(400, "La contraseña actual es incorrecta");
            }

            if (request.newPassword.Length < 8
                || !request.newPassword.Any(char.IsLetter)
                || !request.newPassword.Any(char.IsDigit))
            {
                throw new AuthException(400, "La contraseña debe tener al menos 8 caracteres, una letra y un número.");
            }

            if (!string.Equals(request.newPassword, request.confirmPassword, StringComparison.Ordinal))
            {
                throw new AuthException(400, "Las contraseñas ingresadas no coinciden.");
            }

            if (passwordMatches(request.newPassword, currentPasswordHash))
            {
                throw new AuthException(400, "La nueva contraseña debe ser distinta de la actual");
            }

            var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.newPassword);
            if (!await userRepository.updatePassword(userId, currentPasswordHash, newPasswordHash))
            {
                throw new AuthException(409, "La contraseña cambió durante la solicitud. Debe iniciar sesión nuevamente.");
            }
        }

        private static bool passwordMatches(string password, string storedPassword)
        {
            if (!storedPassword.StartsWith("$2a$", StringComparison.Ordinal)
                && !storedPassword.StartsWith("$2b$", StringComparison.Ordinal)
                && !storedPassword.StartsWith("$2y$", StringComparison.Ordinal))
            {
                return false;
            }

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, storedPassword);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }
    }
}
