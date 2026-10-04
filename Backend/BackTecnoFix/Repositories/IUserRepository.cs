using TecnoFix.Models;

namespace TecnoFix.Repositories;

    public interface IUserRepository
    {
        Task<User?> findById(int userId);

        Task updatePassword(User user);
    }