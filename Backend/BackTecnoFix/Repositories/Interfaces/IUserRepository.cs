using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IUserRepository
    {
        Task<User?> findByEmail(string email);
    }
}