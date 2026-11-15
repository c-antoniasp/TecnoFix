using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IEngineerRepository
    {
        Task<User> add(User technician);
    }
}
