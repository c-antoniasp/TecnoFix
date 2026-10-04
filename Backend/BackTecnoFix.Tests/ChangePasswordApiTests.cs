using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using TecnoFix.Repositories;

namespace BackTecnoFix.Tests;

public class ChangePasswordApiTests
{
    private const string endpoint = "/api/auth/change-password";
    private const string testJwtKey = "change-password-test-signing-key-only-123456789";

    [Fact]
    public async Task unauthenticatedRequestReturnsMessageWithoutAccessingDatabase()
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();

        var response = await client.PutAsJsonAsync(endpoint, ChangePasswordTestData.validRequest());

        await assertError(response, HttpStatusCode.Unauthorized,
            "Debe iniciar sesión para cambiar su contraseña.");
        Assert.Contains(response.Headers.WwwAuthenticate, header => header.Scheme == "Bearer");
        Assert.Null(factory.repository.requestedUserId);
        Assert.Equal(0, factory.repository.saveCount);
    }

    [Theory]
    [InlineData("expired")]
    [InlineData("signature")]
    [InlineData("issuer")]
    [InlineData("audience")]
    public async Task invalidTokenIsRejected(string invalidPart)
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
            createToken(invalidPart: invalidPart));

        var response = await client.PutAsJsonAsync(endpoint, ChangePasswordTestData.validRequest());

        await assertError(response, HttpStatusCode.Unauthorized,
            "Debe iniciar sesión para cambiar su contraseña.");
        Assert.Null(factory.repository.requestedUserId);
    }

    [Theory]
    [InlineData("ADMIN", "bearer")]
    [InlineData("TECHNICIAN", "bearer")]
    [InlineData("CLIENT", "bearer")]
    [InlineData("ADMIN", "cookie")]
    [InlineData("TECHNICIAN", "cookie")]
    [InlineData("CLIENT", "cookie")]
    public async Task eachRoleCanChangeOwnPasswordAndSessionCookieIsDeleted(string role, string mode)
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        var token = createToken(role: role);
        if (mode == "cookie")
        {
            client.DefaultRequestHeaders.Add("Cookie", $"access_token={token}");
        }
        else
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        var otherUserHash = factory.repository.passwordHashes[2];

        var response = await client.PutAsJsonAsync(endpoint + "?userId=2", new
        {
            userId = 2,
            currentPassword = ChangePasswordTestData.currentPassword,
            newPassword = ChangePasswordTestData.newPassword,
            confirmPassword = ChangePasswordTestData.newPassword
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("requiresLogin").GetBoolean());
        Assert.Equal(1, factory.repository.requestedUserId);
        Assert.Equal(1, factory.repository.saveCount);
        Assert.True(BCrypt.Net.BCrypt.Verify(ChangePasswordTestData.newPassword,
            factory.repository.passwordHashes[1]));
        Assert.Equal(otherUserHash, factory.repository.passwordHashes[2]);
        var cookie = Assert.Single(response.Headers.GetValues("Set-Cookie"));
        Assert.Contains("access_token=;", cookie);
        Assert.Contains("expires=Thu, 01 Jan 1970", cookie);
        Assert.Contains("path=/", cookie);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("not-an-id")]
    [InlineData("0")]
    [InlineData("-1")]
    public async Task tokenWithoutValidUserIdCannotChangePassword(string? userId)
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", createToken(userId));

        var response = await client.PutAsJsonAsync(endpoint, ChangePasswordTestData.validRequest());

        await assertError(response, HttpStatusCode.Unauthorized, "Debe iniciar sesión nuevamente.");
        Assert.Null(factory.repository.requestedUserId);
    }

    [Theory]
    [InlineData("{")]
    [InlineData("{\"currentPassword\":123}")]
    public async Task invalidJsonReturnsSpanishMessage(string json)
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", createToken());

        var response = await client.PutAsync(endpoint, new StringContent(json, Encoding.UTF8, "application/json"));

        await assertError(response, HttpStatusCode.BadRequest,
            "La solicitud de cambio de contraseña no es válida.");
        Assert.Null(factory.repository.requestedUserId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("null")]
    [InlineData("{}")]
    public async Task emptyBodyReturnsRequiredFieldMessage(string json)
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", createToken());

        var response = await client.PutAsync(endpoint, new StringContent(json, Encoding.UTF8, "application/json"));

        await assertError(response, HttpStatusCode.BadRequest,
            "Debe completar el campo contraseña actual.");
        Assert.Null(factory.repository.requestedUserId);
    }

    [Fact]
    public async Task validationFailureKeepsPasswordAndSessionCookie()
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", createToken());
        var request = ChangePasswordTestData.validRequest();
        request.currentPassword = "Incorrecta123";

        var response = await client.PutAsJsonAsync(endpoint, request);

        await assertError(response, HttpStatusCode.BadRequest, "La contraseña actual es incorrecta");
        Assert.Equal(0, factory.repository.saveCount);
        Assert.False(response.Headers.Contains("Set-Cookie"));
    }

    [Fact]
    public async Task successfulCookieChangeRequiresLoginOnNextRequest()
    {
        await using var factory = new ChangePasswordFactory();
        using var client = factory.createClient();
        client.DefaultRequestHeaders.Add("Cookie", $"access_token={createToken()}");

        var response = await client.PutAsJsonAsync(endpoint, ChangePasswordTestData.validRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        client.DefaultRequestHeaders.Remove("Cookie");
        var nextResponse = await client.PutAsJsonAsync(endpoint, ChangePasswordTestData.validRequest());
        Assert.Equal(HttpStatusCode.Unauthorized, nextResponse.StatusCode);
        Assert.Equal(1, factory.repository.saveCount);
    }

    private static string createToken(string? userId = "1", string role = "CLIENT", string? invalidPart = null)
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, role) };
        if (userId is not null)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
        }
        var key = invalidPart == "signature" ? "another-test-only-signing-key-1234567890" : testJwtKey;
        var token = new JwtSecurityToken(
            issuer: invalidPart == "issuer" ? "OtherIssuer" : "TecnoFix",
            audience: invalidPart == "audience" ? "OtherAudience" : "TecnoFixUsers",
            claims: claims,
            expires: invalidPart == "expired" ? DateTime.UtcNow.AddDays(-1) : DateTime.UtcNow.AddMinutes(10),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static async Task assertError(HttpResponseMessage response, HttpStatusCode status, string message)
    {
        Assert.Equal(status, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(message, body.GetProperty("message").GetString());
        Assert.Single(body.EnumerateObject());
    }

    private sealed class ChangePasswordFactory : WebApplicationFactory<Program>
    {
        internal TestUserRepository repository { get; } = new();

        internal HttpClient createClient() => CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false
        });

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = testJwtKey,
                    ["Jwt:Issuer"] = "TecnoFix",
                    ["Jwt:Audience"] = "TecnoFixUsers"
                }));
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IUserRepository>();
                services.AddSingleton<IUserRepository>(repository);
            });
        }
    }
}
