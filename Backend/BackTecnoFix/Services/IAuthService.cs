using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface IAuthService
    {
        Task changePassoword(int userId, ChangePasswordRequestDTO request);
    }
}