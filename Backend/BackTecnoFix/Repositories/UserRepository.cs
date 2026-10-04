using TecnoFix.Data;
using Microsoft.EntityFrameworkCore;
namespace TecnoFix.Repositories;

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext dbContext;

        public UserRepository(AppDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public Task<string?> findPasswordById(int userId)
        {
            return dbContext.Database
                .SqlQuery<string>($"SELECT password AS \"Value\" FROM \"User\" WHERE user_id = {userId}")
                .FirstOrDefaultAsync();
        }

        public async Task<bool> updatePassword(int userId, string currentPasswordHash, string newPasswordHash)
        {
            // Compara el hash anterior para evitar sobrescribir un cambio concurrente.
            var updatedRows = await dbContext.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE \"User\" SET password = {newPasswordHash} WHERE user_id = {userId} AND password = {currentPasswordHash}");
            return updatedRows == 1;
        }


    }
