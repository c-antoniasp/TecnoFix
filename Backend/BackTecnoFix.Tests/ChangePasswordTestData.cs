using TecnoFix.DTO;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

internal static class ChangePasswordTestData
{
    // Ids de prueba: los usuarios usan UUID en la base de datos.
    internal const string firstUserIdText = "00000000-0000-0000-0000-000000000001";
    internal const string secondUserIdText = "00000000-0000-0000-0000-000000000002";
    internal static readonly Guid firstUserId = Guid.Parse(firstUserIdText);
    internal static readonly Guid secondUserId = Guid.Parse(secondUserIdText);

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
    internal Dictionary<Guid, string> passwordHashes { get; } = new()
    {
        [ChangePasswordTestData.firstUserId] = ChangePasswordTestData.currentPasswordHash,
        [ChangePasswordTestData.secondUserId] = BCrypt.Net.BCrypt.HashPassword("OtraCuenta123", 4)
    };
    internal int saveCount { get; private set; }
    internal Guid? requestedUserId { get; private set; }
    internal bool allowUpdate { get; set; } = true;
    internal UserRole loginRole { get; set; } = UserRole.CLIENT;
    internal bool technicianDisabled { get; set; }

    public Task<User?> findByEmail(string email)
    {
        User? user = string.Equals(email, "user@example.test", StringComparison.OrdinalIgnoreCase)
            ? new User
            {
                id = ChangePasswordTestData.firstUserId,
                name = "Test user",
                email = "user@example.test",
                password = passwordHashes[ChangePasswordTestData.firstUserId],
                role = loginRole
            }
            : null;
        return Task.FromResult(user);
    }

    public Task<bool> isTechnicianDisabled(Guid userId)
    {
        return Task.FromResult(userId == ChangePasswordTestData.firstUserId && technicianDisabled);
    }

    public Task<string?> findPasswordById(Guid userId)
    {
        requestedUserId = userId;
        return Task.FromResult(passwordHashes.GetValueOrDefault(userId));
    }

    public Task<bool> updatePassword(Guid userId, string currentPasswordHash, string newPasswordHash)
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
