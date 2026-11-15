using TecnoFix.Models;

namespace TecnoFix.Repositories;

public interface IUserRepository
{
    Task<User?> findByEmail(string email);
    Task<bool> isTechnicianDisabled(Guid userId);
    Task<string?> findPasswordById(Guid userId);
    Task<bool> updatePassword(Guid userId, string currentPasswordHash, string newPasswordHash);
}
