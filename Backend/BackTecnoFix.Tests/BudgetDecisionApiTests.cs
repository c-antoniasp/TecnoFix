using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TecnoFix.Data;
using TecnoFix.DTO;
using TecnoFix.Models;
using TecnoFix.Repositories;
using TecnoFix.Services;

namespace BackTecnoFix.Tests;

public class BudgetDecisionApiTests : IAsyncLifetime
{
    private const string endpoint = "/api/repair-orders";
    private const string unavailable = "El presupuesto no está disponible para su aprobación.";
    private const string password = "OrdenSegura123";
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    private BudgetFactory factory = null!;
    private User owner = null!;
    private User otherClient = null!;
    private User admin = null!;
    private User technician = null!;
    private int quotedOrderId;
    private int receivedOrderId;
    private int otherOrderId;

    public async Task InitializeAsync()
    {
        await connection.OpenAsync();
        factory = new BudgetFactory(connection);
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.EnsureCreatedAsync();

        var hash = BCrypt.Net.BCrypt.HashPassword(password, 4);
        owner = newUser("cliente", UserRole.CLIENT, hash);
        otherClient = newUser("otro", UserRole.CLIENT, hash);
        admin = newUser("admin", UserRole.ADMIN, hash);
        technician = newUser("tecnico", UserRole.TECHNICIAN, hash);
        var equipmentType = new EquipmentType { id = Guid.NewGuid(), name = "Notebook", enabled = true };
        context.users.AddRange(owner, otherClient, admin, technician);
        context.equipmentTypes.Add(equipmentType);
        await context.SaveChangesAsync();

        var repairOrders = scope.ServiceProvider.GetRequiredService<IRepairOrderService>();
        var diagnosis = scope.ServiceProvider.GetRequiredService<ITechnicianService>();
        quotedOrderId = await registerOrder(owner.id, equipmentType.id, repairOrders);
        receivedOrderId = await registerOrder(owner.id, equipmentType.id, repairOrders);
        otherOrderId = await registerOrder(otherClient.id, equipmentType.id, repairOrders);
        var diagnosisRequest = new RegisterDiagnosisRequestDTO
        {
            technicalDiagnosis = "Cargador dañado",
            laborCost = 8000,
            partsCost = 10000
        };
        await diagnosis.registerDiagnosis(quotedOrderId, diagnosisRequest, technician.id);
        await diagnosis.registerDiagnosis(otherOrderId, diagnosisRequest, technician.id);
    }

    public async Task DisposeAsync()
    {
        await factory.DisposeAsync();
        await connection.DisposeAsync();
    }

    [Theory]
    [InlineData(true, OrderStatus.IN_REPAIR, false)]
    [InlineData(false, OrderStatus.REJECTED, true)]
    public async Task ownerCanSeeAndDecideOwnQuotedBudgetOnlyOnce(bool approved, OrderStatus status, bool availableForPickup)
    {
        using var client = createClient();
        await login(client, owner);

        // Los filtros de identidad enviados por el cliente no amplían el listado.
        var orders = await client.GetFromJsonAsync<ClientRepairOrderDTO[]>(endpoint + $"/mine?clientId={otherClient.id}");
        Assert.NotNull(orders);
        Assert.Equal(2, orders.Length);
        var quoted = Assert.Single(orders, item => item.order.orderId == quotedOrderId);
        Assert.Equal("Notebook", quoted.order.equipmentType);
        Assert.Equal("QUOTED", quoted.order.status);
        Assert.True(quoted.canDecideBudget);
        Assert.False(quoted.availableForPickup);
        Assert.NotNull(quoted.budget);
        Assert.Equal("Cargador dañado", quoted.budget.technicalDiagnosis);
        Assert.Equal(8000, quoted.budget.laborCost);
        Assert.Equal(10000, quoted.budget.partsCost);
        Assert.Equal(18000, quoted.budget.totalCost);
        var received = Assert.Single(orders, item => item.order.orderId == receivedOrderId);
        Assert.Null(received.budget);
        Assert.False(received.canDecideBudget);

        var before = DateTime.UtcNow;
        using var response = await client.PutAsJsonAsync(decisionUrl(quotedOrderId), new { approved });
        response.EnsureSuccessStatusCode();
        var decision = await response.Content.ReadFromJsonAsync<BudgetDecisionResponseDTO>();
        Assert.NotNull(decision);
        Assert.Equal(status.ToString(), decision.status);
        Assert.Equal(availableForPickup, decision.availableForPickup);
        Assert.Equal(approved ? "Presupuesto aprobado." : "Presupuesto rechazado.", decision.message);
        Assert.InRange(decision.decisionDate, before, DateTime.UtcNow);

        using var repeat = await client.PutAsJsonAsync(decisionUrl(quotedOrderId), new { approved = !approved });
        await assertRejection(repeat, HttpStatusCode.Conflict, unavailable);
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var order = await context.repairOrders.Include(item => item.logs).SingleAsync(item => item.id == quotedOrderId);
        Assert.Equal(approved, order.budgetApproved);
        Assert.Equal(status, order.status);
        Assert.Equal(decision.decisionDate, order.decisionDate);
        Assert.Null(order.deliveredAt);
        var log = Assert.Single(order.logs, entry => entry.responsibleUserId == owner.id);
        Assert.Equal(status, log.loggedStatus);
        Assert.Equal(order.decisionDate, log.loggedAt);
        Assert.Contains(approved ? "aprobado" : "rechazado", log.comment);

        var refreshedOrders = await client.GetFromJsonAsync<ClientRepairOrderDTO[]>(endpoint + "/mine");
        var refreshed = Assert.Single(refreshedOrders!, item => item.order.orderId == quotedOrderId);
        Assert.False(refreshed.canDecideBudget);
        Assert.Equal(availableForPickup, refreshed.availableForPickup);
        Assert.Equal(status.ToString(), refreshed.order.status);
    }

    [Fact]
    public async Task unquotedOrderCannotBeDecided()
    {
        using var client = createClient();
        await login(client, owner);
        using var response = await client.PutAsJsonAsync(decisionUrl(receivedOrderId), new { approved = true });
        await assertRejection(response, HttpStatusCode.Conflict, unavailable);
    }

    [Fact]
    public async Task identityInTheBodyCannotGrantAccessToAnotherClientsOrder()
    {
        using var client = createClient();
        await login(client, owner);
        using var response = await client.PutAsJsonAsync(decisionUrl(otherOrderId), new { approved = true, clientId = otherClient.id });
        await assertRejection(response, HttpStatusCode.Forbidden, "No tiene acceso a esta orden.");
    }

    [Theory]
    [InlineData(null, HttpStatusCode.Unauthorized)]
    [InlineData(UserRole.ADMIN, HttpStatusCode.Forbidden)]
    [InlineData(UserRole.TECHNICIAN, HttpStatusCode.Forbidden)]
    public async Task sessionWithClientRoleIsRequired(UserRole? role, HttpStatusCode status)
    {
        using var client = createClient();
        if (role.HasValue) await login(client, role == UserRole.ADMIN ? admin : technician);

        using var list = await client.GetAsync(endpoint + "/mine");
        using var response = await client.PutAsJsonAsync(decisionUrl(quotedOrderId), new { approved = true });
        Assert.Equal(status, list.StatusCode);
        Assert.Equal(status, response.StatusCode);
    }

    [Fact]
    public async Task missingApprovalFieldIsNotTreatedAsRejection()
    {
        using var client = createClient();
        await login(client, owner);
        using var response = await client.PutAsJsonAsync(decisionUrl(quotedOrderId), new { });
        await assertRejection(response, HttpStatusCode.BadRequest, "Debe indicar si aprueba o rechaza el presupuesto.");
    }

    [Fact]
    public async Task nonExistentOrderReturnsNotFound()
    {
        using var client = createClient();
        await login(client, owner);
        using var response = await client.PutAsJsonAsync(decisionUrl(int.MaxValue), new { approved = true });
        await assertRejection(response, HttpStatusCode.NotFound, "La orden no existe.");
    }

    [Fact]
    public async Task staleDecisionCannotOverwriteWinnerOrAddSecondLog()
    {
        using var scope = factory.Services.CreateScope();
        var staleRepository = scope.ServiceProvider.GetRequiredService<IRepairOrderRepository>();
        var staleOrder = await staleRepository.findById(quotedOrderId);
        Assert.NotNull(staleOrder);
        Assert.True(staleOrder.canDecideBudget);

        using var client = createClient();
        await login(client, owner);
        using var response = await client.PutAsJsonAsync(decisionUrl(quotedOrderId), new { approved = true });
        response.EnsureSuccessStatusCode();

        var staleLog = new OrderLog
        {
            id = Guid.NewGuid(),
            orderId = quotedOrderId,
            responsibleUserId = owner.id,
            loggedStatus = OrderStatus.REJECTED,
            loggedAt = DateTime.UtcNow
        };
        Assert.False(await staleRepository.trySaveBudgetDecision(staleOrder, false, staleLog));

        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var order = await context.repairOrders.Include(item => item.logs).SingleAsync(item => item.id == quotedOrderId);
        Assert.Equal(OrderStatus.IN_REPAIR, order.status);
        Assert.Equal(true, order.budgetApproved);
        Assert.Equal(OrderStatus.IN_REPAIR, Assert.Single(order.logs, item => item.responsibleUserId == owner.id).loggedStatus);
    }

    private HttpClient createClient() => factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost")
    });

    private static async Task login(HttpClient client, User user)
    {
        using var response = await client.PostAsJsonAsync("/api/auth/login", new { user.email, password });
        response.EnsureSuccessStatusCode();
    }

    private static string decisionUrl(int orderId) => $"{endpoint}/{orderId}/budget-decision";

    private static async Task assertRejection(HttpResponseMessage response, HttpStatusCode status, string message)
    {
        Assert.Equal(status, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(message, body.GetProperty("message").GetString());
    }

    private static User newUser(string name, UserRole role, string hash) => new()
    {
        id = Guid.NewGuid(), name = name, email = $"{name}@example.test", role = role, password = hash
    };

    private async Task<int> registerOrder(Guid clientId, Guid equipmentTypeId, IRepairOrderService repairOrders)
    {
        var result = await repairOrders.registerOrder(new RegisterRepairOrderRequestDTO
        {
            clientId = clientId,
            equipmentTypeId = equipmentTypeId,
            brandModel = "Lenovo ThinkPad",
            faultDescription = "No enciende"
        }, admin.id, isTechnician: false);
        return result.orderNumber;
    }

    private sealed class BudgetFactory(SqliteConnection connection) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "budget-decision-test-key-only-123456789",
                    ["Jwt:Issuer"] = "TecnoFix",
                    ["Jwt:Audience"] = "TecnoFixUsers",
                    ["Jwt:ExpirationMinutes"] = "60"
                }));
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
                services.AddDbContext<AppDbContext>(options => options.UseSqlite(connection));
            });
        }
    }
}
