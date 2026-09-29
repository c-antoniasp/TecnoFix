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
        // Mensajes definidos en la ERS (USU-001).
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
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.password, user.password))
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
    }
}