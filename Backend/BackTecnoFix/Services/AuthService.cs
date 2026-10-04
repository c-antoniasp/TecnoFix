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

        public async Task changePassoword(int userId, ChangePasswordRequestDTO request)
        {
            // Implement the logic to change the user's password here.
            // You can use the _userRepository to interact with the database.
        }
    }
}