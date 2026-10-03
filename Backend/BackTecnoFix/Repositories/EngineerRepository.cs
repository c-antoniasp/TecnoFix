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

        public async Task<Engineer> add(Engineer engineer)
        {
            _dbContext.engineers.Add(engineer);
            await _dbContext.SaveChangesAsync();
            return engineer;
        }
    }
}