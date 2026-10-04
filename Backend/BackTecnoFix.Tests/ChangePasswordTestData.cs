using TecnoFix.DTO;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

internal static class ChangePasswordTestData
{
    internal const string currentPassword = "Actual123";
    internal const string newPassword = "Nueva1234";
    internal static readonly string currentPasswordHash = BCrypt.Net.BCrypt.HashPassword(currentPassword, 4);

    internal static ChangePasswordRequestDTO validRequest() => new()
    {
        currentPassword = currentPassword,
        newPassword = newPassword,
        confirmPassword = newPassword
    };
}

internal sealed class TestUserRepository : IUserRepository
{
    internal Dictionary<int, string> passwordHashes { get; } = new()
    {
        [1] = ChangePasswordTestData.currentPasswordHash,
        [2] = BCrypt.Net.BCrypt.HashPassword("OtraCuenta123", 4)
    };
    internal int saveCount { get; private set; }
    internal int? requestedUserId { get; private set; }
    internal bool allowUpdate { get; set; } = true;

    public Task<string?> findPasswordById(int userId)
    {
        requestedUserId = userId;
        return Task.FromResult(passwordHashes.GetValueOrDefault(userId));
    }

    public Task<bool> updatePassword(int userId, string currentPasswordHash, string newPasswordHash)
    {
        if (!allowUpdate || passwordHashes.GetValueOrDefault(userId) != currentPasswordHash)
        {
            return Task.FromResult(false);
        }

        passwordHashes[userId] = newPasswordHash;
        saveCount++;
        return Task.FromResult(true);
    }
}
