using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Models;

namespace TecnoFix.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext dbContext;

    public UserRepository(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<User?> findByEmail(string email)
    {
        return await dbContext.users
            .FirstOrDefaultAsync(u => u.email.ToLower() == email.ToLower());
    }

    public async Task<bool> isTechnicianDisabled(int userId)
    {
        return await dbContext.technicians
            .AnyAsync(t => t.userId == userId && !t.enabled);
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
