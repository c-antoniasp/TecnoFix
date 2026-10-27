using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using TecnoFix.Data;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

public class ChangePasswordRepositoryTests
{
    [Fact]
    public void userEntityIsMappedToTheNeonUsersTable()
    {
        using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=:memory:").Options);
        var entity = context.Model.FindEntityType(typeof(User))!;
        var table = StoreObjectIdentifier.Table("users", null);
        var expectedColumns = new Dictionary<string, string>
        {
            [nameof(User.id)] = "id",
            [nameof(User.name)] = "full_name",
            [nameof(User.email)] = "email",
            [nameof(User.password)] = "password",
            [nameof(User.role)] = "role",
            [nameof(User.rut)] = "rut",
            [nameof(User.phone)] = "phone",
            [nameof(User.specialty)] = "specialty",
            [nameof(User.accountStatus)] = "account_status",
            [nameof(User.createdAt)] = "created_at"
        };

        Assert.Equal("users", entity.GetTableName());
        foreach (var (property, column) in expectedColumns)
        {
            Assert.Equal(column, entity.FindProperty(property)!.GetColumnName(table));
        }
    }

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
            id = ChangePasswordTestData.firstUserId,
            name = "Test user",
            email = "user@example.test",
            password = ChangePasswordTestData.currentPasswordHash,
            role = UserRole.TECHNICIAN,
            specialty = "GENERAL",
            accountStatus = false
        };
        var client = new User
        {
            id = ChangePasswordTestData.secondUserId,
            name = "Client user",
            email = "client@example.test",
            password = ChangePasswordTestData.currentPasswordHash,
            role = UserRole.CLIENT,
            rut = "123456785",
            phone = "+56911111111",
            accountStatus = false
        };
        context.users.AddRange(user, client);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var repository = new UserRepository(context);

        var foundUser = await repository.findByEmail("USER@EXAMPLE.TEST");
        Assert.NotNull(foundUser);
        Assert.Equal(user.id, foundUser.id);
        Assert.Equal(UserRole.TECHNICIAN, foundUser.role);
        Assert.Equal("GENERAL", foundUser.specialty);
        Assert.True(await repository.isTechnicianDisabled(user.id));
        // Solo los técnicos se bloquean con account_status = false.
        Assert.False(await repository.isTechnicianDisabled(client.id));
        Assert.False(await repository.isTechnicianDisabled(Guid.NewGuid()));
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
    public async Task repositoryUpdatesOnlyPasswordInUsersTable()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection).Options);
        await context.Database.EnsureCreatedAsync();
        var currentHash = ChangePasswordTestData.currentPasswordHash;
        context.users.AddRange(
            new User
            {
                id = ChangePasswordTestData.firstUserId,
                name = "Test user",
                email = "user@example.test",
                password = currentHash,
                role = UserRole.CLIENT
            },
            new User
            {
                id = ChangePasswordTestData.secondUserId,
                name = "Other user",
                email = "other@example.test",
                password = currentHash,
                role = UserRole.ADMIN
            });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var repository = new UserRepository(context);

        Assert.Equal(currentHash, await repository.findPasswordById(ChangePasswordTestData.firstUserId));
        Assert.Null(await repository.findPasswordById(Guid.NewGuid()));
        var newHash = BCrypt.Net.BCrypt.HashPassword(ChangePasswordTestData.newPassword, 4);
        Assert.True(await repository.updatePassword(ChangePasswordTestData.firstUserId, currentHash, newHash));
        Assert.Equal(newHash, await repository.findPasswordById(ChangePasswordTestData.firstUserId));
        Assert.Equal(currentHash, await repository.findPasswordById(ChangePasswordTestData.secondUserId));
        context.ChangeTracker.Clear();
        var unchanged = await context.users.SingleAsync(u => u.id == ChangePasswordTestData.firstUserId);
        Assert.Equal("Test user|user@example.test|CLIENT", $"{unchanged.name}|{unchanged.email}|{unchanged.role}");

        Assert.False(await repository.updatePassword(ChangePasswordTestData.firstUserId, currentHash, "must-not-overwrite"));
        Assert.False(await repository.updatePassword(Guid.NewGuid(), currentHash, newHash));
        Assert.Equal(newHash, await repository.findPasswordById(ChangePasswordTestData.firstUserId));
    }

    [Fact]
    public async Task passwordValuesAreSentAsParameters()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection).Options);
        await context.Database.EnsureCreatedAsync();
        var currentHash = ChangePasswordTestData.currentPasswordHash;
        context.users.Add(new User
        {
            id = ChangePasswordTestData.firstUserId,
            name = "Test user",
            email = "user@example.test",
            password = currentHash,
            role = UserRole.CLIENT
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var repository = new UserRepository(context);
        var quotedValue = "quoted'value; DROP TABLE \"users\"; --";

        Assert.True(await repository.updatePassword(ChangePasswordTestData.firstUserId, currentHash, quotedValue));
        Assert.Equal(quotedValue, await repository.findPasswordById(ChangePasswordTestData.firstUserId));
        Assert.Equal(1, await context.users.CountAsync());
    }
}
