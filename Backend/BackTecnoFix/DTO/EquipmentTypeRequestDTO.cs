namespace BackTecnoFix.DTO;

/// <summary>
/// Objeto de transferencia de datos de entrada para registrar o actualizar un tipo de equipo.
/// </summary>
public class EquipmentTypeRequestDTO
{
    // Nombre del tipo de equipo (campo obligatorio)
    public string name { get; set; } = string.Empty;

    // Descripción informativa (campo opcional)
    public string? description { get; set; }
}
