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

        // Un técnico es un usuario con rol TECHNICIAN en la tabla "users".
        public async Task<User> add(User technician)
        {
            _dbContext.users.Add(technician);
            await _dbContext.SaveChangesAsync();
            return technician;
        }
    }
}
