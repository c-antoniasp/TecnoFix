using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IEngineerRepository
    {
        Task<Engineer> add(Engineer engineer);
    }
}