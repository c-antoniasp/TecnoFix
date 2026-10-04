using Microsoft.Extensions.Configuration;
using TecnoFix.DTO;
using TecnoFix.Services;

namespace BackTecnoFix.Tests;

public class ChangePasswordServiceTests
{
    [Theory]
    [InlineData("current", null)]
    [InlineData("current", "")]
    [InlineData("current", "   ")]
    [InlineData("new", null)]
    [InlineData("new", "")]
    [InlineData("new", "   ")]
    [InlineData("confirm", null)]
    [InlineData("confirm", "")]
    [InlineData("confirm", "   ")]
    public async Task missingFieldsAreRejectedWithoutSaving(string field, string? value)
    {
        var repository = new TestUserRepository();
        var request = ChangePasswordTestData.validRequest();
        var fieldName = field switch
        {
            "current" => "contraseña actual",
            "new" => "nueva contraseña",
            _ => "confirmación de la nueva contraseña"
        };

        switch (field)
        {
            case "current": request.currentPassword = value; break;
            case "new": request.newPassword = value; break;
            default: request.confirmPassword = value; break;
        }

        await assertRejected(repository, request, 400, $"Debe completar el campo {fieldName}.");
        Assert.Null(repository.requestedUserId);
    }

    [Fact]
    public async Task missingRequestIsRejectedWithoutSaving()
    {
        await assertRejected(new TestUserRepository(), null, 400,
            "Debe completar el campo contraseña actual.");
    }

    [Theory]
    [InlineData("Abc1234")]
    [InlineData("abcdefgh")]
    [InlineData("12345678")]
    public async Task weakNewPasswordIsRejectedWithoutSaving(string password)
    {
        var request = ChangePasswordTestData.validRequest();
        request.newPassword = password;
        request.confirmPassword = password;

        await assertRejected(new TestUserRepository(), request, 400,
            "La contraseña debe tener al menos 8 caracteres, una letra y un número.");
    }

    [Fact]
    public async Task incorrectCurrentPasswordIsRejectedWithoutSaving()
    {
        var request = ChangePasswordTestData.validRequest();
        request.currentPassword = "Incorrecta123";

        await assertRejected(new TestUserRepository(), request, 400, "La contraseña actual es incorrecta");
    }

    [Theory]
    [InlineData("Actual123")]
    [InlineData("$2b$invalid")]
    [InlineData("")]
    public async Task plaintextOrInvalidStoredHashIsRejected(string storedPassword)
    {
        var repository = new TestUserRepository();
        repository.passwordHashes[1] = storedPassword;

        await assertRejected(repository, ChangePasswordTestData.validRequest(), 400,
            "La contraseña actual es incorrecta");
    }

    [Fact]
    public async Task mismatchedConfirmationIsRejectedWithoutSaving()
    {
        var request = ChangePasswordTestData.validRequest();
        request.confirmPassword = "Otra1234";

        await assertRejected(new TestUserRepository(), request, 400,
            "Las contraseñas ingresadas no coinciden.");
    }

    [Fact]
    public async Task unchangedPasswordIsRejectedWithoutSaving()
    {
        var request = ChangePasswordTestData.validRequest();
        request.newPassword = ChangePasswordTestData.currentPassword;
        request.confirmPassword = request.newPassword;

        await assertRejected(new TestUserRepository(), request, 400,
            "La nueva contraseña debe ser distinta de la actual");
    }

    [Fact]
    public async Task validChangeSavesHashAndRejectsOldPassword()
    {
        var repository = new TestUserRepository();
        var otherUserHash = repository.passwordHashes[2];
        var service = new AuthService(repository, new ConfigurationBuilder().Build());

        await service.changePassword(1, ChangePasswordTestData.validRequest());

        Assert.Equal(1, repository.saveCount);
        Assert.NotEqual(ChangePasswordTestData.newPassword, repository.passwordHashes[1]);
        Assert.True(BCrypt.Net.BCrypt.Verify(ChangePasswordTestData.newPassword, repository.passwordHashes[1]));
        Assert.False(BCrypt.Net.BCrypt.Verify(ChangePasswordTestData.currentPassword, repository.passwordHashes[1]));
        Assert.Equal(otherUserHash, repository.passwordHashes[2]);

        await assertRejected(repository, ChangePasswordTestData.validRequest(), 400,
            "La contraseña actual es incorrecta", expectedSaveCount: 1);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(99)]
    public async Task invalidOrMissingSessionUserIsRejected(int userId)
    {
        var repository = new TestUserRepository();
        var exception = await Assert.ThrowsAsync<AuthException>(
            () => new AuthService(repository, new ConfigurationBuilder().Build())
                .changePassword(userId, ChangePasswordTestData.validRequest()));

        Assert.Equal(401, exception.statusCode);
        Assert.Equal("Debe iniciar sesión nuevamente.", exception.Message);
        Assert.Equal(0, repository.saveCount);
    }

    [Fact]
    public async Task concurrentChangeIsRejectedWithoutOverwriting()
    {
        var repository = new TestUserRepository { allowUpdate = false };

        await assertRejected(repository, ChangePasswordTestData.validRequest(), 409,
            "La contraseña cambió durante la solicitud. Debe iniciar sesión nuevamente.");
    }

    private static async Task assertRejected(TestUserRepository repository,
        ChangePasswordRequestDTO? request, int statusCode, string message, int expectedSaveCount = 0)
    {
        var originalPassword = repository.passwordHashes[1];
        var exception = await Assert.ThrowsAsync<AuthException>(
            () => new AuthService(repository, new ConfigurationBuilder().Build()).changePassword(1, request));

        Assert.Equal(statusCode, exception.statusCode);
        Assert.Equal(message, exception.Message);
        Assert.Equal(expectedSaveCount, repository.saveCount);
        Assert.Equal(originalPassword, repository.passwordHashes[1]);
    }
}
