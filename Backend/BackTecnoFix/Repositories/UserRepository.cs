using Microsoft.EntityFrameworkCore;
using BackTecnoFix.Data;
using BackTecnoFix.Models;

namespace BackTecnoFix.Repositories;

/// <summary>
/// Repositorio de usuarios según el estándar (Paso 5).
/// </summary>
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

    public async Task<User?> findById(int id)
    {
        return await dbContext.users
            .FirstOrDefaultAsync(u => u.id == id);
    }
}
