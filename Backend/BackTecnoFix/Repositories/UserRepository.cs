using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _dbContext;

        public UserRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User?> findByEmail(string email)
        {
            return await _dbContext.users.FirstOrDefaultAsync(u => u.email.ToLower() == email.ToLower());
        }
    }
}