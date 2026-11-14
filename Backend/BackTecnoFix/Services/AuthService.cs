using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BackTecnoFix.DTO;
using BackTecnoFix.Repositories;

namespace BackTecnoFix.Services;

/// <summary>
/// Servicio de autenticación según estándar Codexia (Paso 1 y 3 de arquitectura).
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository userRepository;
    private readonly IConfiguration configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        this.userRepository = userRepository;
        this.configuration = configuration;
    }

    public async Task<LoginResponseDTO> login(LoginRequestDTO requestDto)
    {
        if (string.IsNullOrWhiteSpace(requestDto.email) || string.IsNullOrWhiteSpace(requestDto.password))
        {
            throw new AuthException("Correo electrónico o contraseña incorrectos", 401);
        }

        var user = await userRepository.findByEmail(requestDto.email);
        if (user == null)
        {
            throw new AuthException("Correo electrónico o contraseña incorrectos", 401);
        }

        // Verificación de hash BCrypt
        bool passwordMatches = BCrypt.Net.BCrypt.Verify(requestDto.password, user.password);
        if (!passwordMatches)
        {
            throw new AuthException("Correo electrónico o contraseña incorrectos", 401);
        }

        // Generación de token JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? "TecnoFixSecretKeyDeAlMenos32CaracteresLongitud!");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Name, user.name),
                new Claim(ClaimTypes.Role, user.role.ToString())
            }),
            Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(configuration["Jwt:ExpirationMinutes"] ?? "60")),
            Issuer = configuration["Jwt:Issuer"],
            Audience = configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponseDTO
        {
            userId = user.id,
            name = user.name,
            email = user.email,
            role = user.role,
            token = tokenHandler.WriteToken(token)
        };
    }
}
