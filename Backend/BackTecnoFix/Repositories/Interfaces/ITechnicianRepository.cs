using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface ITechnicianRepository
    {
        Task<User> add(User technician);
    }
}
