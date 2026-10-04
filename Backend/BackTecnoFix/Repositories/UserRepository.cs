using TecnoFix.Models;
using TecnoFix.Data;
using Microsoft.EntityFrameworkCore;
namespace TecnoFix.Repositories;

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext dbcontext;

        public UserRepository(AppDbContext dbcontext)
        {
            this.dbcontext = dbcontext;
        }

        public async Task<User?> findById(int userId)
        {
            return await dbcontext.users.FirstOrDefaultAsync(user => user.id == userId);
        }

        public Task updatePassword(User user)
        {
            dbcontext.users.Update(user);
            return dbcontext.SaveChangesAsync();
        }


    }
