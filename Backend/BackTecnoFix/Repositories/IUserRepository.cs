namespace TecnoFix.Repositories;

    public interface IUserRepository
    {
        Task<string?> findPasswordById(int userId);

        Task<bool> updatePassword(int userId, string currentPasswordHash, string newPasswordHash);
    }
