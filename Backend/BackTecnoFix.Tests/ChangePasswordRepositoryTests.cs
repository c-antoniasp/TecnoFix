using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

public class ChangePasswordRepositoryTests
{
    [Fact]
    public async Task repositoryUpdatesOnlyPasswordInStandardUserTable()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection).Options);
        await context.Database.ExecuteSqlRawAsync(
            "CREATE TABLE \"User\" (user_id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT)");
        var currentHash = ChangePasswordTestData.currentPasswordHash;
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO \"User\" VALUES (1, 'Test user', 'user@example.test', {currentHash}, 'CLIENT')");
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO \"User\" VALUES (2, 'Other user', 'other@example.test', {currentHash}, 'ADMIN')");
        var repository = new UserRepository(context);

        Assert.Equal(currentHash, await repository.findPasswordById(1));
        Assert.Null(await repository.findPasswordById(99));
        var newHash = BCrypt.Net.BCrypt.HashPassword(ChangePasswordTestData.newPassword, 4);
        Assert.True(await repository.updatePassword(1, currentHash, newHash));
        Assert.Equal(newHash, await repository.findPasswordById(1));
        Assert.Equal(currentHash, await repository.findPasswordById(2));
        var unchangedData = await context.Database.SqlQuery<string>(
            $"SELECT name || '|' || email || '|' || role AS \"Value\" FROM \"User\" WHERE user_id = {1}")
            .SingleAsync();
        Assert.Equal("Test user|user@example.test|CLIENT", unchangedData);

        Assert.False(await repository.updatePassword(1, currentHash, "must-not-overwrite"));
        Assert.False(await repository.updatePassword(99, currentHash, newHash));
        Assert.Equal(newHash, await repository.findPasswordById(1));
    }

    [Fact]
    public async Task passwordValuesAreSentAsParameters()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection).Options);
        await context.Database.ExecuteSqlRawAsync(
            "CREATE TABLE \"User\" (user_id INTEGER PRIMARY KEY, password TEXT)");
        var currentHash = ChangePasswordTestData.currentPasswordHash;
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO \"User\" VALUES (1, {currentHash})");
        var repository = new UserRepository(context);
        var quotedValue = "quoted'value; DROP TABLE \"User\"; --";

        Assert.True(await repository.updatePassword(1, currentHash, quotedValue));
        Assert.Equal(quotedValue, await repository.findPasswordById(1));
    }
}
