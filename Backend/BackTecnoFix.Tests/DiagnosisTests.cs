using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;
using TecnoFix.Services;

namespace BackTecnoFix.Tests;

// ORD-002: diagnóstico y presupuesto sobre una orden registrada con ORD-001.
public class DiagnosisTests : IAsyncLifetime
{
    private SqliteConnection connection = null!;
    private AppDbContext context = null!;
    private TechnicianService technicianService = null!;
    private User technician = null!;
    private int orderId;

    public async Task InitializeAsync()
    {
        connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
        await context.Database.EnsureCreatedAsync();

        var client = new User { id = Guid.NewGuid(), role = UserRole.CLIENT, name = "Juan Pérez", email = "juan@example.test", password = "hash" };
        var admin = new User { id = Guid.NewGuid(), role = UserRole.ADMIN, name = "Antonio Barraza", email = "admin@example.test", password = "hash" };
        technician = new User { id = Guid.NewGuid(), role = UserRole.TECHNICIAN, name = "Ana Rojas", email = "ana@example.test", password = "hash" };
        var notebook = new EquipmentType { id = Guid.NewGuid(), name = "Notebook", enabled = true };
        context.users.AddRange(client, admin, technician);
        context.equipmentTypes.Add(notebook);
        await context.SaveChangesAsync();

        var repairOrderRepository = new RepairOrderRepository(context);
        // La orden la registra el administrador, así que aún no tiene técnico asignado.
        var order = await new RepairOrderService(repairOrderRepository, new EquipmentTypeRepository(context))
            .registerOrder(new RegisterRepairOrderRequestDTO
            {
                clientId = client.id,
                equipmentTypeId = notebook.id,
                brandModel = "Lenovo ThinkPad T14",
                faultDescription = "No enciende"
            }, admin.id, isTechnician: false);
        orderId = order.orderNumber;

        technicianService = new TechnicianService(
            new UserRepository(context), new EngineerRepository(context), new NoEmailService(), repairOrderRepository);
    }

    public async Task DisposeAsync()
    {
        await context.DisposeAsync();
        await connection.DisposeAsync();
    }

    [Fact]
    public async Task receivedOrdersAreListedForDiagnosis()
    {
        var orders = await technicianService.getOrdersForDiagnosis();

        var order = Assert.Single(orders);
        Assert.Equal(orderId, order.orderNumber);
        Assert.Equal("Notebook", order.equipmentType);
        Assert.Equal("No enciende", order.reportedFailure);
        Assert.Equal("RECEIVED", order.status);
    }

    [Fact]
    public async Task openingTheOrderMovesItToDiagnosisAndAssignsTheTechnician()
    {
        await technicianService.startDiagnosis(orderId, technician.id);

        var order = await context.repairOrders.Include(o => o.logs).SingleAsync();
        Assert.Equal(OrderStatus.IN_DIAGNOSIS, order.status);
        Assert.Equal(technician.id, order.technicianId);
        Assert.Contains(order.logs, log => log.loggedStatus == OrderStatus.IN_DIAGNOSIS && log.responsibleUserId == technician.id);
    }

    [Fact]
    public async Task registeringTheDiagnosisQuotesTheOrderWithTheTotalCost()
    {
        var total = await technicianService.registerDiagnosis(orderId, new RegisterDiagnosisRequestDTO
        {
            technicalDiagnosis = " Placa madre dañada ",
            laborCost = 25000,
            partsCost = 40000.50m
        }, technician.id);

        context.ChangeTracker.Clear();
        var order = await context.repairOrders.Include(o => o.logs).SingleAsync();
        Assert.Equal(65000.50m, total);
        Assert.Equal(65000.50m, order.totalCost);
        Assert.Equal(OrderStatus.QUOTED, order.status);
        Assert.Equal("Placa madre dañada", order.technicalDiagnosis);
        // Recibida → En diagnóstico → Presupuestada quedan en la bitácora.
        Assert.Equal(
            new[] { OrderStatus.RECEIVED, OrderStatus.IN_DIAGNOSIS, OrderStatus.QUOTED },
            order.logs.OrderBy(log => log.loggedAt).ThenBy(log => log.loggedStatus).Select(log => log.loggedStatus));
    }

    [Fact]
    public async Task negativeCostsAreRejected()
    {
        var exception = await Assert.ThrowsAsync<BusinessException>(() => technicianService.registerDiagnosis(
            orderId, new RegisterDiagnosisRequestDTO { technicalDiagnosis = "x", laborCost = -1, partsCost = 0 }, technician.id));

        Assert.Equal("El costo ingresado no es válido", exception.Message);
    }

    [Fact]
    public async Task quotedOrdersCannotBeDiagnosedAgain()
    {
        var request = new RegisterDiagnosisRequestDTO { technicalDiagnosis = "x", laborCost = 1, partsCost = 1 };
        await technicianService.registerDiagnosis(orderId, request, technician.id);

        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => technicianService.registerDiagnosis(orderId, request, technician.id));

        Assert.Equal("La orden no se encuentra disponible para diagnóstico", exception.Message);
    }

    private sealed class NoEmailService : IEmailService
    {
        public Task SendEmailAsync(string to, string subject, string body, string? htmlBody = null) => Task.CompletedTask;
    }
}
