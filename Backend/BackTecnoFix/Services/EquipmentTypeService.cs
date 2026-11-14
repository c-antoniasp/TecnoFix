using BackTecnoFix.DTO;
using BackTecnoFix.Models;
using BackTecnoFix.Repositories;

namespace BackTecnoFix.Services;

/// <summary>
/// Implementación de las reglas de negocio para el requerimiento ADM-001 (Gestionar catálogo de tipos de equipo).
/// Aplica validaciones obligatorias según la ERS de TecnoFix.
/// </summary>
public class EquipmentTypeService : IEquipmentTypeService
{
    private readonly IEquipmentTypeRepository equipmentTypeRepository;

    public EquipmentTypeService(IEquipmentTypeRepository equipmentTypeRepository)
    {
        this.equipmentTypeRepository = equipmentTypeRepository;
    }

    /// <summary>
    /// Retorna todos los tipos de equipo transformados a DTO de respuesta.
    /// </summary>
    public async Task<IEnumerable<EquipmentTypeResponseDTO>> getAll()
    {
        var list = await equipmentTypeRepository.getAll();
        return list.Select(mapToResponseDTO);
    }

    /// <summary>
    /// Retorna solo los tipos de equipo habilitados (los que se ofrecen en ORD-001).
    /// </summary>
    public async Task<IEnumerable<EquipmentTypeResponseDTO>> getEnabled()
    {
        var list = await equipmentTypeRepository.getEnabled();
        return list.Select(mapToResponseDTO);
    }

    /// <summary>
    /// Obtiene un tipo de equipo por ID.
    /// </summary>
    public async Task<EquipmentTypeResponseDTO> getById(int id)
    {
        var equipmentType = await equipmentTypeRepository.getById(id);
        if (equipmentType == null)
        {
            throw new BusinessException("Tipo de equipo no encontrado", 404);
        }

        return mapToResponseDTO(equipmentType);
    }

    /// <summary>
    /// Registra un nuevo tipo de equipo validando obligatoriedad y unicidad del nombre.
    /// </summary>
    public async Task<EquipmentTypeResponseDTO> create(EquipmentTypeRequestDTO dto)
    {
        // Validación 1: El nombre es obligatorio
        if (string.IsNullOrWhiteSpace(dto.name))
        {
            throw new BusinessException("Debe completar el campo Nombre", 400);
        }

        string trimmedName = dto.name.Trim();

        // Validación 2: El nombre del tipo de equipo debe ser único en el sistema
        var existing = await equipmentTypeRepository.getByName(trimmedName);
        if (existing != null)
        {
            throw new BusinessException("El tipo de equipo ingresado ya se encuentra registrado", 409);
        }

        var newEntity = new EquipmentType
        {
            name = trimmedName,
            description = string.IsNullOrWhiteSpace(dto.description) ? null : dto.description.Trim(),
            enabled = true // Habilitado por defecto al registrarse
        };

        var created = await equipmentTypeRepository.create(newEntity);
        return mapToResponseDTO(created);
    }

    /// <summary>
    /// Edita el nombre y la descripción de un tipo de equipo existente.
    /// </summary>
    public async Task<EquipmentTypeResponseDTO> update(int id, EquipmentTypeRequestDTO dto)
    {
        var entity = await equipmentTypeRepository.getById(id);
        if (entity == null)
        {
            throw new BusinessException("Tipo de equipo no encontrado", 404);
        }

        // Validación 1: El nombre es obligatorio
        if (string.IsNullOrWhiteSpace(dto.name))
        {
            throw new BusinessException("Debe completar el campo Nombre", 400);
        }

        string trimmedName = dto.name.Trim();

        // Validación 2: Comprobar unicidad si el nombre cambió
        if (!string.Equals(entity.name, trimmedName, StringComparison.OrdinalIgnoreCase))
        {
            var existingWithSameName = await equipmentTypeRepository.getByName(trimmedName);
            if (existingWithSameName != null && existingWithSameName.id != id)
            {
                throw new BusinessException("El tipo de equipo ingresado ya se encuentra registrado", 409);
            }
        }

        entity.name = trimmedName;
        entity.description = string.IsNullOrWhiteSpace(dto.description) ? null : dto.description.Trim();

        var updated = await equipmentTypeRepository.update(entity);
        return mapToResponseDTO(updated);
    }

    /// <summary>
    /// Habilita o deshabilita un tipo de equipo.
    /// Validación crítica de ERS:
    /// «No se puede deshabilitar un tipo de equipo que tenga órdenes en un estado distinto de "Entregada"».
    /// </summary>
    public async Task<EquipmentTypeResponseDTO> toggleStatus(int id)
    {
        var entity = await equipmentTypeRepository.getById(id);
        if (entity == null)
        {
            throw new BusinessException("Tipo de equipo no encontrado", 404);
        }

        // Si actualmente está habilitado y se intenta deshabilitar:
        if (entity.enabled)
        {
            bool hasActiveOrders = await equipmentTypeRepository.hasOrdersInProgress(id);
            if (hasActiveOrders)
            {
                throw new BusinessException("El tipo de equipo tiene órdenes en proceso y no puede ser deshabilitado", 400);
            }

            entity.enabled = false;
        }
        else
        {
            // Habilitar de nuevo no tiene restricción
            entity.enabled = true;
        }

        var updated = await equipmentTypeRepository.update(entity);
        return mapToResponseDTO(updated);
    }

    /// <summary>
    /// Mapeo auxiliar de entidad a DTO de respuesta.
    /// </summary>
    private static EquipmentTypeResponseDTO mapToResponseDTO(EquipmentType entity)
    {
        return new EquipmentTypeResponseDTO
        {
            id = entity.id,
            name = entity.name,
            description = entity.description,
            enabled = entity.enabled
        };
    }
}
