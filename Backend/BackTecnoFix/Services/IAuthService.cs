using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDTO> login(LoginRequestDTO request);
        Task changePassword(Guid userId, ChangePasswordRequestDTO? request);
    }
}
