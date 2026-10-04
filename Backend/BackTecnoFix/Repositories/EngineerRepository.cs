using TecnoFix.Data;
using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public class EngineerRepository : IEngineerRepository
    {
        private readonly AppDbContext _dbContext;

        public EngineerRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Technician> add(Technician technician)
        {
            _dbContext.technicians.Add(technician);
            await _dbContext.SaveChangesAsync();
            return technician;
        }
    }
}