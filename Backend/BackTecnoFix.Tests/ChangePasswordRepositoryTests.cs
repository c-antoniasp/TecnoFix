using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

public class ChangePasswordRepositoryTests
{
    [Fact]
    public async Task loginAndPasswordQueriesUseTheSameMappedUserTable()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection).Options);
        await context.Database.EnsureCreatedAsync();
        var user = new User
        {
            id = 1,
            name = "Test user",
            email = "user@example.test",
            password = ChangePasswordTestData.currentPasswordHash,
            role = UserRole.TECHNICIAN
        };
        context.users.Add(user);
        context.technicians.Add(new Technician
        {
            id = 1,
            userId = user.id,
            user = user,
            technicianType = "GENERAL",
            enabled = false
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var repository = new UserRepository(context);

        var foundUser = await repository.findByEmail("USER@EXAMPLE.TEST");
        Assert.NotNull(foundUser);
        Assert.Equal(user.id, foundUser.id);
        Assert.Equal(UserRole.TECHNICIAN, foundUser.role);
        Assert.True(await repository.isTechnicianDisabled(user.id));
        Assert.False(await repository.isTechnicianDisabled(99));
        Assert.Null(await repository.findByEmail("missing@example.test"));
        Assert.Equal(user.password, await repository.findPasswordById(user.id));

        var newHash = BCrypt.Net.BCrypt.HashPassword(ChangePasswordTestData.newPassword, 4);
        Assert.True(await repository.updatePassword(user.id, user.password, newHash));
        context.ChangeTracker.Clear();
        var updatedUser = await repository.findByEmail(user.email);
        Assert.NotNull(updatedUser);
        Assert.Equal(newHash, updatedUser.password);
        Assert.Equal(user.name, updatedUser.name);
        Assert.Equal(user.role, updatedUser.role);
    }

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
