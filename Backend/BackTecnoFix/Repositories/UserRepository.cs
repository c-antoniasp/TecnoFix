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

    public async Task<bool> isTechnicianDisabled(Guid userId)
    {
        return await dbContext.users
            .AnyAsync(u => u.id == userId && u.role == UserRole.TECHNICIAN && !u.accountStatus);
    }

    public Task<string?> findPasswordById(Guid userId)
    {
        return dbContext.users
            .Where(u => u.id == userId)
            .Select(u => (string?)u.password)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> updatePassword(Guid userId, string currentPasswordHash, string newPasswordHash)
    {
        // Compara el hash anterior para evitar sobrescribir un cambio concurrente.
        // ExecuteUpdate envía los valores como parámetros y modifica solo la columna password.
        var updatedRows = await dbContext.users
            .Where(u => u.id == userId && u.password == currentPasswordHash)
            .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.password, newPasswordHash));
        return updatedRows == 1;
    }
}
