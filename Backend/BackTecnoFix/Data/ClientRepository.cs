using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

/// <summary>
/// Repositorio de clientes persistido en PostgreSQL (Neon) mediante Entity Framework.
/// Cada cliente se guarda en la tabla "Client" junto a su usuario en la tabla "User".
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
        return _dbContext.clients.AnyAsync(c => c.rut.ToUpper() == cleanRut);
    }

    /// <summary>
    /// Registra un nuevo cliente y su usuario; la base de datos asigna los identificadores.
    /// </summary>
    public async Task<Client> AddAsync(Client client)
    {
        _dbContext.clients.Add(client);
        await _dbContext.SaveChangesAsync();
        return client;
    }

    /// <summary>
    /// Obtiene un cliente por su ID, incluyendo los datos de su usuario.
    /// </summary>
    public Task<Client?> GetByIdAsync(int id)
    {
        return _dbContext.clients
            .Include(c => c.user)
            .FirstOrDefaultAsync(c => c.id == id);
    }

    /// <summary>
    /// Retorna todos los clientes registrados, incluyendo los datos de su usuario.
    /// </summary>
    public async Task<IEnumerable<Client>> GetAllAsync()
    {
        return await _dbContext.clients
            .Include(c => c.user)
            .ToListAsync();
    }
}
