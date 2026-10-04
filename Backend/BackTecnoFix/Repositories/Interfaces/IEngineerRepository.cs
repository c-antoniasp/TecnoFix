using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IEngineerRepository
    {
        Task<Technician> add(Technician technician);
    }
}