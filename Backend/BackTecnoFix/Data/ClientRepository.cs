using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

/// <summary>
/// Repositorio de clientes persistido en PostgreSQL (Neon) mediante Entity Framework.
/// Un cliente es un usuario con rol CLIENT en la tabla "users" (con su RUT y teléfono).
/// </summary>
public class ClientRepository : IClientRepository
{
    private readonly AppDbContext _dbContext;

    public ClientRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Consulta si el correo ya pertenece a cualquier usuario (cliente, técnico o administrador),
    /// ya que el correo es el identificador para iniciar sesión.
    /// </summary>
    public Task<bool> ExistsByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        return _dbContext.users.AnyAsync(u => u.email.ToLower() == normalizedEmail);
    }

    /// <summary>
    /// Consulta si un RUT ya está registrado.
    /// </summary>
    public Task<bool> ExistsByRutAsync(string rut)
    {
        var cleanRut = rut.Trim().ToUpper();
        return _dbContext.users.AnyAsync(u => u.rut != null && u.rut.ToUpper() == cleanRut);
    }

    /// <summary>
    /// Registra un nuevo cliente; la base de datos asigna la fecha y el identificador es un UUID.
    /// </summary>
    public async Task<User> AddAsync(User client)
    {
        _dbContext.users.Add(client);
        await _dbContext.SaveChangesAsync();
        return client;
    }

    /// <summary>
    /// Obtiene un cliente por su ID (solo usuarios con rol CLIENT).
    /// </summary>
    public Task<User?> GetByIdAsync(Guid id)
    {
        return _dbContext.users
            .FirstOrDefaultAsync(u => u.id == id && u.role == UserRole.CLIENT);
    }

    /// <summary>
    /// Retorna todos los clientes registrados (usuarios con rol CLIENT).
    /// </summary>
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _dbContext.users
            .Where(u => u.role == UserRole.CLIENT)
            .ToListAsync();
    }
}
