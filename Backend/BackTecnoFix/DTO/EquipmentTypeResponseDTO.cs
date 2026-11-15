namespace TecnoFix.DTO;

/// <summary>
/// Objeto de transferencia de datos de salida para exponer tipos de equipo sin exponer la entidad de dominio.
/// </summary>
public class EquipmentTypeResponseDTO
{
    // Identificador único
    public Guid id { get; set; }

    // Nombre del tipo de equipo
    public string name { get; set; } = string.Empty;

    // Descripción del tipo de equipo
    public string? description { get; set; }

    // Indica si el tipo de equipo está habilitado para recibir nuevas órdenes
    public bool enabled { get; set; }
}
