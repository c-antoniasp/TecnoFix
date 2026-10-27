using System.Text.RegularExpressions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TecnoFix.Data;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;
using TecnoFix.Services;

namespace BackTecnoFix.Tests;

// Flujo completo de un técnico recién registrado: el administrador lo registra, el sistema le
// envía una contraseña temporal por correo y con ella el técnico debe poder iniciar sesión.
public class TechnicianFlowTests
{
    [Fact]
    public async Task registeredTechnicianCanLoginWithTheEmailedTemporaryPassword()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = await createContext(connection);
        var emailService = new CapturingEmailService();
        var (technicianService, authService) = createServices(context, emailService);

        await technicianService.registerTechnician(new RegisterTechnicianRequestDTO
        {
            name = "Ana Pérez",
            email = " Ana.Perez@Example.test ",
            specialty = "Pantalla"
        });

        var message = Assert.Single(emailService.sent);
        Assert.Equal("Ana.Perez@Example.test", message.to);
        var stored = await context.users.SingleAsync(user => user.role == UserRole.TECHNICIAN);
        Assert.True(stored.accountStatus);
        Assert.Equal("Pantalla", stored.specialty);
        Assert.Equal("Ana.Perez@Example.test", stored.email);

        // La contraseña temporal es la palabra de 8 caracteres del correo que coincide con el hash guardado.
        var temporaryPassword = Regex.Matches(message.body, @"\b[A-Za-z0-9]{8}\b")
            .Select(match => match.Value)
            .First(candidate => BCrypt.Net.BCrypt.Verify(candidate, stored.password));

        var response = await authService.login(new LoginRequestDTO
        {
            email = "ana.perez@example.test",
            password = temporaryPassword
        });

        Assert.Equal("TECHNICIAN", response.role);
        Assert.Equal(stored.id, response.userId);
        Assert.False(string.IsNullOrEmpty(response.token));
    }

    [Fact]
    public async Task technicianIsSavedEvenWhenTheEmailCannotBeSent()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = await createContext(connection);
        var emailService = new CapturingEmailService { failure = new InvalidOperationException("Brevo no disponible") };
        var (technicianService, _) = createServices(context, emailService);

        var exception = await Assert.ThrowsAsync<BusinessException>(() => technicianService.registerTechnician(
            new RegisterTechnicianRequestDTO { name = "Ana Pérez", email = "ana@example.test", specialty = "Pantalla" }));

        Assert.Equal("El técnico fue registrado, pero no se pudo enviar el correo con su contraseña temporal",
            exception.Message);
        Assert.Equal(1, await context.users.CountAsync(user => user.role == UserRole.TECHNICIAN));
    }

    [Fact]
    public async Task disabledTechnicianCannotLogin()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = await createContext(connection);
        var emailService = new CapturingEmailService();
        var (technicianService, authService) = createServices(context, emailService);
        await technicianService.registerTechnician(
            new RegisterTechnicianRequestDTO { name = "Ana Pérez", email = "ana@example.test", specialty = "Pantalla" });
        var stored = await context.users.SingleAsync(user => user.role == UserRole.TECHNICIAN);
        var temporaryPassword = Regex.Matches(Assert.Single(emailService.sent).body, @"\b[A-Za-z0-9]{8}\b")
            .Select(match => match.Value)
            .First(candidate => BCrypt.Net.BCrypt.Verify(candidate, stored.password));
        stored.accountStatus = false;
        await context.SaveChangesAsync();

        var exception = await Assert.ThrowsAsync<AuthException>(() => authService.login(
            new LoginRequestDTO { email = "ana@example.test", password = temporaryPassword }));

        Assert.Equal(401, exception.statusCode);
        Assert.Equal("Correo electrónico o contraseña incorrectos", exception.Message);
    }

    [Theory]
    [InlineData("correo-sin-arroba")]
    [InlineData("ana@sinpunto")]
    public async Task technicianWithInvalidEmailIsRejected(string email)
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        await using var context = await createContext(connection);
        var (technicianService, _) = createServices(context, new CapturingEmailService());

        var exception = await Assert.ThrowsAsync<BusinessException>(() => technicianService.registerTechnician(
            new RegisterTechnicianRequestDTO { name = "Ana Pérez", email = email, specialty = "Pantalla" }));

        Assert.Equal("El correo electrónico no tiene un formato válido", exception.Message);
        Assert.Equal(0, await context.users.CountAsync());
    }

    private static async Task<AppDbContext> createContext(SqliteConnection connection)
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
        await context.Database.EnsureCreatedAsync();
        return context;
    }

    private static (TechnicianService technicianService, AuthService authService) createServices(
        AppDbContext context, IEmailService emailService)
    {
        var userRepository = new UserRepository(context);
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "technician-flow-test-signing-key-only-123456789",
            ["Jwt:Issuer"] = "TecnoFix",
            ["Jwt:Audience"] = "TecnoFixUsers",
            ["Jwt:ExpirationMinutes"] = "60"
        }).Build();
        return (
            new TechnicianService(userRepository, new EngineerRepository(context), emailService),
            new AuthService(userRepository, configuration));
    }

    private sealed class CapturingEmailService : IEmailService
    {
        internal List<(string to, string subject, string body)> sent { get; } = new();
        internal Exception? failure { get; set; }

        public Task SendEmailAsync(string to, string subject, string body, string? htmlBody = null)
        {
            if (failure is not null)
            {
                return Task.FromException(failure);
            }

            sent.Add((to, subject, body));
            return Task.CompletedTask;
        }
    }
}
