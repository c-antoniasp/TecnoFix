using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface IAuthService
    {
        Task changePassword(int userId, ChangePasswordRequestDTO? request);
    }
}
