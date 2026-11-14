using BackTecnoFix.DTO;

namespace BackTecnoFix.Services;

/// <summary>
/// Contrato del servicio de negocio para la gestión del catálogo de tipos de equipo (ADM-001).
/// </summary>
public interface IEquipmentTypeService
{
    // Obtiene la lista completa de tipos de equipo registrados
    Task<IEnumerable<EquipmentTypeResponseDTO>> getAll();

    // Obtiene únicamente los tipos de equipo habilitados (para ORD-001)
    Task<IEnumerable<EquipmentTypeResponseDTO>> getEnabled();

    // Obtiene un tipo de equipo por su ID
    Task<EquipmentTypeResponseDTO> getById(int id);

    // Registra un nuevo tipo de equipo con sus validaciones de negocio
    Task<EquipmentTypeResponseDTO> create(EquipmentTypeRequestDTO dto);

    // Actualiza el nombre y descripción de un tipo de equipo existente
    Task<EquipmentTypeResponseDTO> update(int id, EquipmentTypeRequestDTO dto);

    // Habilita o deshabilita un tipo de equipo validando si tiene órdenes en proceso
    Task<EquipmentTypeResponseDTO> toggleStatus(int id);
}
