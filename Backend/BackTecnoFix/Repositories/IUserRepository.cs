using BackTecnoFix.Models;

namespace BackTecnoFix.Repositories;

/// <summary>
/// Contrato del repositorio para la entidad User.
/// </summary>
public interface IUserRepository
{
    Task<User?> findByEmail(string email);
    Task<User?> findById(int id);
}
