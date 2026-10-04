using TecnoFix.Models;

namespace TecnoFix.Repositories;

public interface IUserRepository
{
    Task<User?> findByEmail(string email);
    Task<bool> isTechnicianDisabled(int userId);
    Task<string?> findPasswordById(int userId);
    Task<bool> updatePassword(int userId, string currentPasswordHash, string newPasswordHash);
}
