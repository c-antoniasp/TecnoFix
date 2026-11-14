using BackTecnoFix.Models;

namespace BackTecnoFix.Repositories;

/// <summary>
/// Contrato del repositorio para la entidad EquipmentType.
/// Define las operaciones de persistencia y consulta contra la base de datos PostgreSQL.
/// </summary>
public interface IEquipmentTypeRepository
{
    // Obtiene todos los tipos de equipo registrados
    Task<IEnumerable<EquipmentType>> getAll();

    // Obtiene solo los tipos de equipo habilitados (requerido para ORD-001)
    Task<IEnumerable<EquipmentType>> getEnabled();

    // Busca un tipo de equipo por su identificador primario
    Task<EquipmentType?> getById(int id);

    // Busca un tipo de equipo por su nombre (comparación insensible a mayúsculas/minúsculas)
    Task<EquipmentType?> getByName(string name);

    // Registra un nuevo tipo de equipo en la base de datos
    Task<EquipmentType> create(EquipmentType equipmentType);

    // Actualiza los datos de un tipo de equipo existente
    Task<EquipmentType> update(EquipmentType equipmentType);

    // Verifica si el tipo de equipo está asociado a órdenes cuyo estado sea distinto de «Entregada»
    Task<bool> hasOrdersInProgress(int equipmentTypeId);
}
