using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;
using TecnoFix.Services;

namespace BackTecnoFix.Tests;

// ORD-001: registro de órdenes de reparación por técnicos y administradores.
public class RepairOrderServiceTests : IAsyncLifetime
{
    private SqliteConnection connection = null!;
    private AppDbContext context = null!;
    private RepairOrderService service = null!;
    private User client = null!;
    private User technician = null!;
    private User admin = null!;
    private EquipmentType notebook = null!;

    public async Task InitializeAsync()
    {
        connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
        await context.Database.EnsureCreatedAsync();

        client = newUser(UserRole.CLIENT, "Juan Pérez", "juan@example.test");
        technician = newUser(UserRole.TECHNICIAN, "Ana Rojas", "ana@example.test");
        admin = newUser(UserRole.ADMIN, "Antonio Barraza", "admin@example.test");
        notebook = new EquipmentType { id = Guid.NewGuid(), name = "Notebook", enabled = true };
        context.users.AddRange(client, technician, admin);
        context.equipmentTypes.Add(notebook);
        await context.SaveChangesAsync();

        service = new RepairOrderService(new RepairOrderRepository(context), new EquipmentTypeRepository(context));
    }

    public async Task DisposeAsync()
    {
        await context.DisposeAsync();
        await connection.DisposeAsync();
    }

    [Fact]
    public async Task registersTheOrderAsReceivedAndLogsTheFirstEvent()
    {
        var response = await service.registerOrder(validRequest(), technician.id, isTechnician: true);

        var order = await context.repairOrders.Include(o => o.logs).SingleAsync();
        Assert.Equal(order.id, response.orderNumber);
        Assert.Equal(OrderStatus.RECEIVED, order.status);
        Assert.Equal(client.id, order.clientId);
        Assert.Equal(technician.id, order.technicianId);
        Assert.Equal(notebook.id, order.equipmentTypeId);
        Assert.Equal("Lenovo ThinkPad T14", order.brandModel);
        Assert.Null(order.serialNumber);
        Assert.Equal("Cargador", order.accessories);

        var log = Assert.Single(order.logs);
        Assert.Equal(technician.id, log.responsibleUserId);
        Assert.Equal(OrderStatus.RECEIVED, log.loggedStatus);
        Assert.Equal(order.receivedAt, log.loggedAt);
    }

    [Fact]
    public async Task orderNumbersAreUniqueAndCorrelative()
    {
        var first = await service.registerOrder(validRequest(), technician.id, isTechnician: true);
        var second = await service.registerOrder(validRequest(), technician.id, isTechnician: true);

        Assert.Equal(first.orderNumber + 1, second.orderNumber);
    }

    [Fact]
    public async Task orderRegisteredByAnAdministratorHasNoTechnicianAssigned()
    {
        await service.registerOrder(validRequest(), admin.id, isTechnician: false);

        var order = await context.repairOrders.Include(o => o.logs).SingleAsync();
        Assert.Null(order.technicianId);
        Assert.Equal(admin.id, Assert.Single(order.logs).responsibleUserId);
    }

    [Theory]
    [InlineData("clientId", "Debe completar el campo Cliente")]
    [InlineData("equipmentTypeId", "Debe completar el campo Tipo de equipo")]
    [InlineData("brandModel", "Debe completar el campo Marca y modelo")]
    [InlineData("faultDescription", "Debe completar el campo Descripción de la falla")]
    public async Task requiredFieldsMustBeCompleted(string emptyField, string expectedMessage)
    {
        var request = validRequest();
        switch (emptyField)
        {
            case "clientId": request.clientId = null; break;
            case "equipmentTypeId": request.equipmentTypeId = null; break;
            case "brandModel": request.brandModel = "   "; break;
            case "faultDescription": request.faultDescription = ""; break;
        }

        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => service.registerOrder(request, technician.id, isTechnician: true));

        Assert.Equal(expectedMessage, exception.Message);
        Assert.Equal(0, await context.repairOrders.CountAsync());
    }

    [Fact]
    public async Task disabledEquipmentTypeCannotBeUsed()
    {
        notebook.enabled = false;
        await context.SaveChangesAsync();

        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => service.registerOrder(validRequest(), technician.id, isTechnician: true));

        Assert.Equal("El tipo de equipo seleccionado no está disponible", exception.Message);
    }

    [Fact]
    public async Task onlyClientsCanOwnAnOrder()
    {
        var request = validRequest();
        request.clientId = technician.id;

        var exception = await Assert.ThrowsAsync<BusinessException>(
            () => service.registerOrder(request, admin.id, isTechnician: false));

        Assert.Equal(404, exception.statusCode);
    }

    [Fact]
    public async Task clientListOnlyIncludesClients()
    {
        var clients = await service.getClients();

        var only = Assert.Single(clients);
        Assert.Equal(client.id, only.id);
    }

    private RegisterRepairOrderRequestDTO validRequest() => new()
    {
        clientId = client.id,
        equipmentTypeId = notebook.id,
        brandModel = " Lenovo ThinkPad T14 ",
        serialNumber = "  ",
        faultDescription = "No enciende",
        accessories = "Cargador"
    };

    private static User newUser(UserRole role, string name, string email) => new()
    {
        id = Guid.NewGuid(),
        role = role,
        name = name,
        email = email,
        password = "hash"
    };
}
