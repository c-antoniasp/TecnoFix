using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TecnoFix.DTO;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

public class AuthIntegrationTests
{
    private const string passwordEndpoint = "/api/auth/change-password";

    [Theory]
    [InlineData(UserRole.ADMIN)]
    [InlineData(UserRole.TECHNICIAN)]
    [InlineData(UserRole.CLIENT)]
    public async Task loginCookieSupportsPasswordChangeAndNewLogin(UserRole role)
    {
        await using var factory = new AuthFactory();
        factory.repository.loginRole = role;
        using var client = factory.createClient();
        var request = new LoginRequestDTO
        {
            email = " USER@EXAMPLE.TEST ",
            password = ChangePasswordTestData.currentPassword
        };

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", request);

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var loginBody = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, loginBody.GetProperty("userId").GetInt32());
        Assert.Equal("Test user", loginBody.GetProperty("name").GetString());
        Assert.Equal("user@example.test", loginBody.GetProperty("email").GetString());
        Assert.Equal(role.ToString(), loginBody.GetProperty("role").GetString());
        Assert.False(loginBody.TryGetProperty("token", out _));
        var cookie = Assert.Single(loginResponse.Headers.GetValues("Set-Cookie")).ToLowerInvariant();
        Assert.Contains("httponly", cookie);
        Assert.Contains("secure", cookie);
        Assert.Contains("samesite=none", cookie);
        Assert.Contains("path=/", cookie);

        var changeResponse = await client.PutAsJsonAsync(passwordEndpoint, ChangePasswordTestData.validRequest());
        Assert.Equal(HttpStatusCode.OK, changeResponse.StatusCode);
        var changeBody = await changeResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(changeBody.GetProperty("requiresLogin").GetBoolean());

        var nextResponse = await client.PutAsJsonAsync(passwordEndpoint, ChangePasswordTestData.validRequest());
        Assert.Equal(HttpStatusCode.Unauthorized, nextResponse.StatusCode);
        var oldPasswordResponse = await client.PostAsJsonAsync("/api/auth/login", request);
        await assertError(oldPasswordResponse, HttpStatusCode.Unauthorized,
            "Correo electrónico o contraseña incorrectos");

        request.password = ChangePasswordTestData.newPassword;
        var newPasswordResponse = await client.PostAsJsonAsync("/api/auth/login", request);
        Assert.Equal(HttpStatusCode.OK, newPasswordResponse.StatusCode);
        var authenticatedResponse = await client.PutAsJsonAsync(passwordEndpoint, new ChangePasswordRequestDTO
        {
            currentPassword = ChangePasswordTestData.newPassword,
            newPassword = "SinNumeros",
            confirmPassword = "SinNumeros"
        });
        await assertError(authenticatedResponse, HttpStatusCode.BadRequest,
            "La contraseña debe tener al menos 8 caracteres, una letra y un número.");
        Assert.Equal(1, factory.repository.saveCount);
    }

    [Fact]
    public async Task passwordChangeIgnoresUserIdSuppliedInBodyAndQuery()
    {
        await using var factory = new AuthFactory();
        using var client = factory.createClient();
        var otherPasswordHash = factory.repository.passwordHashes[2];
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequestDTO
        {
            email = "user@example.test",
            password = ChangePasswordTestData.currentPassword
        });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var response = await client.PutAsJsonAsync(passwordEndpoint + "?userId=2", new
        {
            userId = 2,
            currentPassword = ChangePasswordTestData.currentPassword,
            newPassword = ChangePasswordTestData.newPassword,
            confirmPassword = ChangePasswordTestData.newPassword
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, factory.repository.requestedUserId);
        Assert.Equal(1, factory.repository.saveCount);
        Assert.True(BCrypt.Net.BCrypt.Verify(ChangePasswordTestData.newPassword, factory.repository.passwordHashes[1]));
        Assert.Equal(otherPasswordHash, factory.repository.passwordHashes[2]);
    }

    [Fact]
    public async Task logoutDeletesLoginCookieWithoutChangingPassword()
    {
        await using var factory = new AuthFactory();
        using var client = factory.createClient();
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequestDTO
        {
            email = "user@example.test",
            password = ChangePasswordTestData.currentPassword
        });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var logoutResponse = await client.PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.OK, logoutResponse.StatusCode);
        var body = await logoutResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Sesión cerrada", body.GetProperty("message").GetString());
        Assert.Contains("access_token=;", Assert.Single(logoutResponse.Headers.GetValues("Set-Cookie")));
        var changeResponse = await client.PutAsJsonAsync(passwordEndpoint, ChangePasswordTestData.validRequest());
        Assert.Equal(HttpStatusCode.Unauthorized, changeResponse.StatusCode);
        Assert.Equal(0, factory.repository.saveCount);
    }

    [Theory]
    [InlineData("", "Actual123", 400, "Debe completar el campo Correo electrónico")]
    [InlineData("user@example.test", "", 400, "Debe completar el campo Contraseña")]
    [InlineData("not-an-email", "Actual123", 400, "El correo electrónico no tiene un formato válido")]
    [InlineData("missing@example.test", "Actual123", 401, "Correo electrónico o contraseña incorrectos")]
    [InlineData("user@example.test", "Incorrecta123", 401, "Correo electrónico o contraseña incorrectos")]
    public async Task loginValidationIsPreserved(string email, string password, int statusCode, string message)
    {
        await using var factory = new AuthFactory();
        using var client = factory.createClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequestDTO
        {
            email = email,
            password = password
        });

        await assertError(response, (HttpStatusCode)statusCode, message);
        Assert.False(response.Headers.Contains("Set-Cookie"));
        Assert.Equal(0, factory.repository.saveCount);
    }

    [Fact]
    public async Task disabledTechnicianCannotLogin()
    {
        await using var factory = new AuthFactory();
        factory.repository.loginRole = UserRole.TECHNICIAN;
        factory.repository.technicianDisabled = true;
        using var client = factory.createClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequestDTO
        {
            email = "user@example.test",
            password = ChangePasswordTestData.currentPassword
        });

        await assertError(response, HttpStatusCode.Unauthorized,
            "Correo electrónico o contraseña incorrectos");
        Assert.False(response.Headers.Contains("Set-Cookie"));
    }

    [Theory]
    [InlineData("POST", "/api/auth/login")]
    [InlineData("PUT", passwordEndpoint)]
    public async Task frontendCorsAllowsLoginAndPasswordChangeWithCookies(string method, string path)
    {
        await using var factory = new AuthFactory();
        using var client = factory.createClient();
        using var request = new HttpRequestMessage(HttpMethod.Options, path);
        request.Headers.Add("Origin", "http://localhost:5173");
        request.Headers.Add("Access-Control-Request-Method", method);
        request.Headers.Add("Access-Control-Request-Headers", "content-type");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal("http://localhost:5173", Assert.Single(response.Headers.GetValues("Access-Control-Allow-Origin")));
        Assert.Equal("true", Assert.Single(response.Headers.GetValues("Access-Control-Allow-Credentials")));
    }

    private static async Task assertError(HttpResponseMessage response, HttpStatusCode status, string message)
    {
        Assert.Equal(status, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(message, body.GetProperty("message").GetString());
        Assert.Single(body.EnumerateObject());
    }

    private sealed class AuthFactory : WebApplicationFactory<Program>
    {
        internal TestUserRepository repository { get; } = new();

        internal HttpClient createClient() => CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = true
        });

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "auth-integration-test-signing-key-only-123456789",
                    ["Jwt:Issuer"] = "TecnoFix",
                    ["Jwt:Audience"] = "TecnoFixUsers",
                    ["Jwt:ExpirationMinutes"] = "60"
                }));
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IUserRepository>();
                services.AddSingleton<IUserRepository>(repository);
            });
        }
    }
}
