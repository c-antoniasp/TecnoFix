using System.Collections.Concurrent;
using TecnoFix.Models;

namespace TecnoFix.Data;

/// <summary>
/// Implementación en memoria del repositorio de clientes (Thread-safe).
/// Permite almacenar y consultar clientes temporalmente hasta la configuración de PostgreSQL.
/// </summary>
public class ClientRepository : IClientRepository
{
    private readonly ConcurrentDictionary<int, Client> _clients = new();
    private int _currentId = 0;

    /// <summary>
    /// Consulta si un correo ya está registrado en el repositorio.
    /// </summary>
    public Task<bool> ExistsByEmailAsync(string email)
    {
        var exists = _clients.Values.Any(c => c.email.Equals(email, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(exists);
    }

    /// <summary>
    /// Consulta si un RUT ya está registrado en el repositorio.
    /// </summary>
    public Task<bool> ExistsByRutAsync(string rut)
    {
        var cleanRut = rut.Trim().ToUpperInvariant();
        var exists = _clients.Values.Any(c => c.rut.Trim().ToUpperInvariant().Equals(cleanRut, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(exists);
    }

    /// <summary>
    /// Registra un nuevo cliente asignándole un identificador correlativo.
    /// </summary>
    public Task<Client> AddAsync(Client client)
    {
        client.id = Interlocked.Increment(ref _currentId);
        _clients[client.id] = client;
        return Task.FromResult(client);
    }

    /// <summary>
    /// Obtiene un cliente por su ID.
    /// </summary>
    public Task<Client?> GetByIdAsync(int id)
    {
        _clients.TryGetValue(id, out var client);
        return Task.FromResult(client);
    }

    /// <summary>
    /// Retorna todos los clientes registrados.
    /// </summary>
    public Task<IEnumerable<Client>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Client>>(_clients.Values.ToList());
    }
}
