using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;
using TecnoFix.DTO;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace TecnoFix.Services
{
    public class AuthService : IAuthService
    {
        private const string invalidEmailMessage = "El correo electrónico no tiene un formato válido";
        private const string invalidCredentialsMessage = "Correo electrónico o contraseña incorrectos";

        private readonly IUserRepository userRepository;
        private readonly IConfiguration configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            this.userRepository = userRepository;
            this.configuration = configuration;
        }

        public async Task<LoginResponseDTO> login(LoginRequestDTO request)
        {
            string email = request.email.Trim();

            // mensaje para campos vacíos en el login.
            if (string.IsNullOrWhiteSpace(email))
                throw new AuthException(400, "Debe completar el campo Correo electrónico");
            if (string.IsNullOrEmpty(request.password))
                throw new AuthException(400, "Debe completar el campo Contraseña");

            if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new AuthException(400, invalidEmailMessage);

            User? user = await userRepository.findByEmail(email);

            // Mismo mensaje si falla el correo o la contraseña, para no revelar qué correos existen.
            if (user == null || !passwordMatches(request.password, user.password))
                throw new AuthException(401, invalidCredentialsMessage);

            // SUPUESTO (pendiente con el cliente): un técnico deshabilitado no puede iniciar sesión.
            if (user.role == UserRole.TECHNICIAN && await userRepository.isTechnicianDisabled(user.id))
                throw new AuthException(401, invalidCredentialsMessage);

            return new LoginResponseDTO
            {
                userId = user.id,
                name = user.name,
                email = user.email,
                role = user.role.ToString(),
                token = generateToken(user)
            };
        }

        // Genera el JWT con el id, correo y rol del usuario.
        private string generateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Role, user.role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:ExpirationMinutes"]!)),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
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
