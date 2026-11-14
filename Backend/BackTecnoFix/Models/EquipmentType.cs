namespace BackTecnoFix.Models;

/// <summary>
/// Entidad que representa la tabla "EquipmentType" en la base de datos PostgreSQL.
/// Cumple con el estándar de nombres en inglés y propiedades en camelCase.
/// </summary>
public class EquipmentType
{
    // Clave primaria correspondiente a equipment_type_id
    public int id { get; set; }

    // Nombre único del tipo de equipo (por ejemplo: Notebook, Impresora, Teléfono)
    public string name { get; set; } = string.Empty;

    // Descripción opcional de la categoría del equipo
    public string? description { get; set; }

    // Estado que indica si está habilitado para nuevas órdenes (ORD-001)
    public bool enabled { get; set; } = true;
}
