using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext dbContext;

        public UserRepository(AppDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // Busca un usuario por correo, sin distinguir mayúsculas.
        public async Task<User?> findByEmail(string email)
        {
            return await dbContext.users
                .FirstOrDefaultAsync(u => u.email.ToLower() == email.ToLower());
        }

        // Indica si el usuario es un técnico deshabilitado.
        public async Task<bool> isTechnicianDisabled(int userId)
        {
            return await dbContext.technicians
                .AnyAsync(t => t.userId == userId && !t.enabled);
        }
    }
}