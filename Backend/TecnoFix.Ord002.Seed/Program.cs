using Microsoft.Extensions.Configuration;
using Npgsql;

// Herramienta de desarrollo para ORD-002.
// Crea ordenes de prueba, las reinicia a RECEIVED o las lista.
//
//   dotnet run                 -> crea 1 orden de prueba
//   dotnet run -- 5            -> crea 5 ordenes de prueba
//   dotnet run -- --reset      -> devuelve las ordenes de prueba a RECEIVED
//   dotnet run -- --list       -> lista las ordenes
//   dotnet run -- --delete     -> elimina las ordenes de prueba

var config = new ConfigurationBuilder()
    .AddUserSecrets<Program>(optional: true)
    .AddEnvironmentVariables()
    .Build();

string? connectionString = config.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine(
        "No se encontro ConnectionStrings:DefaultConnection. " +
        "Configurala con 'dotnet user-secrets set' en Backend/BackTecnoFix " +
        "o con la variable ConnectionStrings__DefaultConnection.");
    return 1;
}

var flags = args.Select(arg => arg.ToLowerInvariant()).ToHashSet();
int quantity = args
    .Select(arg => int.TryParse(arg, out int value) ? value : 0)
    .FirstOrDefault(value => value > 0);

if (quantity == 0) quantity = 1;

await using var connection = new NpgsqlConnection(connectionString);
await connection.OpenAsync();

if (flags.Contains("--list"))
{
    await listOrders(connection);
    return 0;
}

if (flags.Contains("--reset"))
{
    int affected = await resetOrders(connection);
    Console.WriteLine($"Ordenes de prueba devueltas a RECEIVED: {affected}");
    return 0;
}

if (flags.Contains("--delete"))
{
    int deleted = await deleteOrders(connection);
    Console.WriteLine($"Ordenes de prueba eliminadas: {deleted}");
    return 0;
}

int clientId = await getClientId(connection);
int nextNumber = await getNextOrderNumber(connection);

for (int i = 0; i < quantity; i++)
{
    int orderNumber = nextNumber + i;
    var (equipment, brand, failure, accessories) = sampleData(i);

    const string sql = """
        INSERT INTO "RepairOrder"
            (client_id, order_number, equipment_type, brand_model, serial_number,
             reported_failure, accessories, status, received_at)
        VALUES
            (@clientId, @orderNumber, @equipment, @brand, @serial,
             @failure, @accessories, 'RECEIVED', NOW())
        RETURNING order_id;
        """;

    await using var cmd = new NpgsqlCommand(sql, connection);
    cmd.Parameters.AddWithValue("clientId", clientId);
    cmd.Parameters.AddWithValue("orderNumber", orderNumber);
    cmd.Parameters.AddWithValue("equipment", equipment);
    cmd.Parameters.AddWithValue("brand", brand);
    cmd.Parameters.AddWithValue("serial", $"SN-TEST-{orderNumber}");
    cmd.Parameters.AddWithValue("failure", failure);
    cmd.Parameters.AddWithValue("accessories", accessories);

    var id = await cmd.ExecuteScalarAsync();
    Console.WriteLine($"Creada orden #{orderNumber} (order_id={id}) estado RECEIVED");
}

return 0;

static async Task listOrders(NpgsqlConnection connection)
{
    const string sql = """
        SELECT r.order_id, r.order_number, r.equipment_type, r.brand_model, r.status,
               d.total_cost
        FROM "RepairOrder" AS r
        LEFT JOIN "Diagnosis" AS d ON d.order_id = r.order_id
        ORDER BY r.order_id;
        """;

    await using var cmd = new NpgsqlCommand(sql, connection);
    await using var reader = await cmd.ExecuteReaderAsync();

    Console.WriteLine("order_id | order_number | equipo | marca | estado | total");
    Console.WriteLine(new string('-', 78));

    while (await reader.ReadAsync())
    {
        Console.WriteLine(
            $"{reader.GetInt32(0),8} | {reader.GetInt32(1),12} | " +
            $"{reader.GetString(2)} | {reader.GetString(3)} | " +
            $"{reader.GetString(4)} | " +
            (reader.IsDBNull(5) ? "-" : reader.GetDecimal(5).ToString("N0")));
    }
}

static async Task<int> resetOrders(NpgsqlConnection connection)
{
    const string sql = """
        DELETE FROM "Diagnosis"
        WHERE order_id IN (SELECT order_id FROM "RepairOrder" WHERE order_number >= 2000);

        DELETE FROM "OrderLog"
        WHERE order_id IN (SELECT order_id FROM "RepairOrder" WHERE order_number >= 2000);

        UPDATE "RepairOrder"
        SET status = 'RECEIVED'
        WHERE order_number >= 2000;
        """;

    await using var cmd = new NpgsqlCommand(sql, connection);
    return await cmd.ExecuteNonQueryAsync();
}

static async Task<int> deleteOrders(NpgsqlConnection connection)
{
    const string sql = """
        DELETE FROM "Diagnosis"
        WHERE order_id IN (SELECT order_id FROM "RepairOrder" WHERE order_number >= 2000);

        DELETE FROM "OrderLog"
        WHERE order_id IN (SELECT order_id FROM "RepairOrder" WHERE order_number >= 2000);

        DELETE FROM "RepairOrder" WHERE order_number >= 2000;
        """;

    await using var cmd = new NpgsqlCommand(sql, connection);
    return await cmd.ExecuteNonQueryAsync();
}

static async Task<int> getClientId(NpgsqlConnection connection)
{
    const string sql = """SELECT client_id FROM "Client" ORDER BY client_id LIMIT 1;""";

    await using var cmd = new NpgsqlCommand(sql, connection);
    var result = await cmd.ExecuteScalarAsync();

    return result is int clientId
        ? clientId
        : throw new InvalidOperationException(
            "No hay clientes en la tabla \"Client\". Crea uno antes de generar ordenes.");
}

static async Task<int> getNextOrderNumber(NpgsqlConnection connection)
{
    const string sql = """
        SELECT COALESCE(MAX(order_number), 2000) + 1 FROM "RepairOrder";
        """;

    await using var cmd = new NpgsqlCommand(sql, connection);
    var result = await cmd.ExecuteScalarAsync();

    return Convert.ToInt32(result);
}

static (string equipment, string brand, string failure, string accessories) sampleData(int index)
{
    var samples = new (string, string, string, string)[]
    {
        ("Notebook", "Lenovo ThinkPad", "No enciende", "Cargador"),
        ("PC de escritorio", "Armada", "Pantalla azul", "Cable de poder"),
        ("Notebook", "HP Pavilion", "Se sobrecalienta", "Cargador"),
        ("Impresora", "Epson L3250", "No imprime", "Cable USB"),
        ("Notebook", "Dell Inspiron", "Teclado no responde", "Cargador"),
        ("Monitor", "Samsung 24\"", "Sin imagen", "Cable HDMI"),
        ("PC de escritorio", "Acer Aspire", "No da video", "Cable de poder"),
        ("Notebook", "Asus VivoBook", "Bateria no carga", "Cargador"),
    };

    return samples[index % samples.Length];
}
