using BackTecnoFix.DTO;

namespace BackTecnoFix.Services;

/// <summary>
/// Contrato del servicio de autenticación y generación de JWT.
/// </summary>
public interface IAuthService
{
    Task<LoginResponseDTO> login(LoginRequestDTO requestDto);
}
