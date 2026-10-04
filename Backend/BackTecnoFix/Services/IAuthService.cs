using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDTO> login(LoginRequestDTO request);
        Task changePassword(int userId, ChangePasswordRequestDTO? request);
    }
}
