using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;
using TecnoFix.Services;

namespace TecnoFix.Ord002.Tests;

// Prueba aislada de ORD-002. No usa base de datos, ni red, ni JWT:
// reemplaza los repositorios por versiones en memoria y ejecuta el
// TechnicianService real (el mismo que usa el controller).
internal static class Program
{
    private static int failures;

    private static async Task<int> Main()
    {
        Console.WriteLine("ORD-002 - Pruebas del flujo de diagnostico y presupuesto");
        Console.WriteLine(new string('=', 64));

        await listingOnlyReturnsDiagnosableOrders();
        await openingOrderChangesStatusToInDiagnosis();
        await openingTwiceDoesNotDuplicateLog();
        await registeringDiagnosisComputesTotal();
        await registeringDirectlyFromReceivedLogsTransition();
        await registeringNegativeCostIsRejected();
        await registeringEmptyDiagnosisIsRejected();
        await registeringOnQuotedOrderIsRejected();
        await openingNonExistentOrderIsRejected();

        Console.WriteLine(new string('=', 64));
        Console.WriteLine(failures == 0
            ? "RESULTADO: todas las pruebas pasaron."
            : $"RESULTADO: {failures} prueba(s) fallaron.");

        return failures == 0 ? 0 : 1;
    }

    // ---------------------------------------------------------------- casos

    private static async Task listingOnlyReturnsDiagnosableOrders()
    {
        Console.WriteLine("\n[1] Listado de ordenes diagnosticables");

        var (service, repo) = build();
        repo.Orders.Add(newOrder(1, 1001, OrderStatus.RECEIVED));
        repo.Orders.Add(newOrder(2, 1002, OrderStatus.IN_DIAGNOSIS));
        repo.Orders.Add(newOrder(3, 1003, OrderStatus.QUOTED));
        repo.Orders.Add(newOrder(4, 1004, OrderStatus.IN_REPAIR));

        var result = await service.getOrdersForDiagnosis();

        Check("solo devuelve RECEIVED e IN_DIAGNOSIS", result.Count == 2);
        Check("conserva el estado real de cada orden",
            result.Any(o => o.status == "IN_DIAGNOSIS"));
        Check("no devuelve ordenes ya presupuestadas",
            result.All(o => o.status != "QUOTED"));
    }

    private static async Task openingOrderChangesStatusToInDiagnosis()
    {
        Console.WriteLine("\n[2] Abrir una orden cambia el estado a IN_DIAGNOSIS");

        var (service, repo) = build();
        var order = newOrder(10, 1010);
        repo.Orders.Add(order);

        await service.startDiagnosis(10, 3);

        Check("la orden pasa a IN_DIAGNOSIS", order.status == OrderStatus.IN_DIAGNOSIS);

        var list = await service.getOrdersForDiagnosis();
        Check("el nuevo estado se ve en el listado (tiempo real)",
            list.Single(o => o.orderId == 10).status == "IN_DIAGNOSIS");

        var log = repo.Logs.SingleOrDefault(l =>
            l.orderId == 10 && l.status == OrderStatus.IN_DIAGNOSIS);
        Check("se registra el evento en la bitacora", log is not null);
        Check("la bitacora guarda el tecnico autenticado", log?.userId == 3);
    }

    private static async Task openingTwiceDoesNotDuplicateLog()
    {
        Console.WriteLine("\n[3] Abrir la misma orden dos veces");

        var (service, repo) = build();
        repo.Orders.Add(newOrder(11, 1011));

        await service.startDiagnosis(11, 3);
        await service.startDiagnosis(11, 3);

        Check("no se duplica el evento en la bitacora",
            repo.Logs.Count(l => l.orderId == 11) == 1);
    }

    private static async Task registeringDiagnosisComputesTotal()
    {
        Console.WriteLine("\n[4] Registrar diagnostico y presupuesto");

        var (service, repo) = build();
        var order = newOrder(12, 1012);
        repo.Orders.Add(order);

        await service.startDiagnosis(12, 3);

        var total = await service.registerDiagnosis(12, new RegisterDiagnosisRequestDTO
        {
            technicalDiagnosis = "Limpieza interna y cambio de pasta termica.",
            laborCost = 25000m,
            partsCost = 15000m
        }, 3);

        Check("total = laborCost + partsCost (40000)", total == 40000m);
        Check("la orden queda en QUOTED", order.status == OrderStatus.QUOTED);
        Check("se guarda un diagnostico", repo.Diagnoses.Count == 1);
        Check("el diagnostico guarda el total calculado",
            repo.Diagnoses[0].totalCost == 40000m);
        Check("el diagnostico queda asociado a la orden",
            order.diagnosis?.id == repo.Diagnoses[0].id);
        Check("la bitacora registra QUOTED",
            repo.Logs.Any(l => l.orderId == 12 && l.status == OrderStatus.QUOTED));
    }

    private static async Task registeringDirectlyFromReceivedLogsTransition()
    {
        Console.WriteLine("\n[5] Registrar diagnostico directo desde RECEIVED");

        var (service, repo) = build();
        var order = newOrder(13, 1013);
        repo.Orders.Add(order);

        var total = await service.registerDiagnosis(13, new RegisterDiagnosisRequestDTO
        {
            technicalDiagnosis = "Diagnostico directo.",
            laborCost = 10000m,
            partsCost = 5000m
        }, 4);

        Check("calcula el total (15000)", total == 15000m);
        Check("la orden queda en QUOTED", order.status == OrderStatus.QUOTED);
        Check("deja el evento IN_DIAGNOSIS",
            repo.Logs.Any(l => l.orderId == 13 && l.status == OrderStatus.IN_DIAGNOSIS));
        Check("deja el evento QUOTED",
            repo.Logs.Any(l => l.orderId == 13 && l.status == OrderStatus.QUOTED));
    }

    private static async Task registeringNegativeCostIsRejected()
    {
        Console.WriteLine("\n[6] Costo negativo");

        var (service, repo) = build();
        repo.Orders.Add(newOrder(14, 1014));

        var error = await expectBusinessError(() =>
            service.registerDiagnosis(14, new RegisterDiagnosisRequestDTO
            {
                technicalDiagnosis = "Prueba",
                laborCost = -1m,
                partsCost = 1000m
            }, 3));

        Check("rechaza el costo negativo",
            error == "El costo ingresado no es válido");
        Check("la orden sigue en RECEIVED",
            repo.Orders[0].status == OrderStatus.RECEIVED);
        Check("no se guarda un diagnostico invalido", repo.Diagnoses.Count == 0);
    }

    private static async Task registeringEmptyDiagnosisIsRejected()
    {
        Console.WriteLine("\n[7] Diagnostico tecnico vacio");

        var (service, repo) = build();
        repo.Orders.Add(newOrder(15, 1015));

        var error = await expectBusinessError(() =>
            service.registerDiagnosis(15, new RegisterDiagnosisRequestDTO
            {
                technicalDiagnosis = "   ",
                laborCost = 1000m,
                partsCost = 1000m
            }, 3));

        Check("exige el diagnostico tecnico",
            error == "Debe completar el campo Diagnóstico técnico");
        Check("la orden no cambia de estado",
            repo.Orders[0].status == OrderStatus.RECEIVED);
    }

    private static async Task registeringOnQuotedOrderIsRejected()
    {
        Console.WriteLine("\n[8] Orden ya presupuestada");

        var (service, repo) = build();
        repo.Orders.Add(newOrder(16, 1016, OrderStatus.QUOTED));

        var error = await expectBusinessError(() =>
            service.registerDiagnosis(16, new RegisterDiagnosisRequestDTO
            {
                technicalDiagnosis = "Otro diagnostico",
                laborCost = 1000m,
                partsCost = 1000m
            }, 3));

        Check("rechaza ordenes fuera de RECEIVED/IN_DIAGNOSIS",
            error == "La orden no se encuentra disponible para diagnóstico");
        Check("no guarda diagnostico", repo.Diagnoses.Count == 0);
    }

    private static async Task openingNonExistentOrderIsRejected()
    {
        Console.WriteLine("\n[9] Orden inexistente");

        var (service, _) = build();

        var error = await expectBusinessError(() =>
            service.startDiagnosis(999, 3));

        Check("responde que la orden no existe",
            error == "La orden de reparación no existe");
    }

    // ---------------------------------------------------------------- apoyo

    private static (TechnicianService service, FakeRepairOrderRepository repo) build()
    {
        var repo = new FakeRepairOrderRepository();

        var service = new TechnicianService(
            new FakeUserRepository(),
            new FakeEngineerRepository(),
            repo);

        return (service, repo);
    }

    private static RepairOrder newOrder(
        int id,
        int orderNumber,
        OrderStatus status = OrderStatus.RECEIVED)
    {
        return new RepairOrder
        {
            id = id,
            clientId = 1,
            orderNumber = orderNumber,
            equipmentType = "Notebook",
            brandModel = "Lenovo ThinkPad",
            reportedFailure = "No enciende",
            status = status,
            receivedAt = DateTime.Now
        };
    }

    private static async Task<string?> expectBusinessError(Func<Task> action)
    {
        try
        {
            await action();
            return null;
        }
        catch (BusinessException ex)
        {
            return ex.Message;
        }
    }

    private static void Check(string name, bool ok)
    {
        if (ok)
        {
            Console.WriteLine($"  [OK]    {name}");
            return;
        }

        failures++;
        Console.WriteLine($"  [FALLA] {name}");
    }
}

// ------------------------------------------------------- repositorios falsos

internal sealed class FakeRepairOrderRepository : IRepairOrderRepository
{
    public List<RepairOrder> Orders { get; } = new();
    public List<Diagnosis> Diagnoses { get; } = new();
    public List<OrderLog> Logs { get; } = new();

    public Task<RepairOrder?> findById(int orderId)
    {
        return Task.FromResult(Orders.FirstOrDefault(o => o.id == orderId));
    }

    public Task<List<RepairOrder>> findByStatuses(params OrderStatus[] statuses)
    {
        var result = Orders
            .Where(o => statuses.Contains(o.status))
            .OrderBy(o => o.receivedAt)
            .ToList();

        return Task.FromResult(result);
    }

    public void addDiagnosis(Diagnosis diagnosis)
    {
        Diagnoses.Add(diagnosis);

        var order = Orders.FirstOrDefault(o => o.id == diagnosis.orderId);
        if (order is not null)
            order.diagnosis = diagnosis;
    }

    public void addOrderLog(OrderLog orderLog)
    {
        Logs.Add(orderLog);
    }

    public Task saveChanges()
    {
        return Task.CompletedTask;
    }
}

internal sealed class FakeUserRepository : IUserRepository
{
    public Task<User?> findByEmail(string email)
    {
        return Task.FromResult<User?>(null);
    }
}

internal sealed class FakeEngineerRepository : IEngineerRepository
{
    public List<Engineer> Engineers { get; } = new();

    public Task<Engineer> add(Engineer engineer)
    {
        Engineers.Add(engineer);
        return Task.FromResult(engineer);
    }
}
