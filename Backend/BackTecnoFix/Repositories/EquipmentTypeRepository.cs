using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Models;

namespace TecnoFix.Repositories;

/// <summary>
/// Implementación del repositorio de tipos de equipo utilizando Entity Framework Core.
/// Único componente autorizado para consultar el DbContext en este módulo.
/// </summary>
public class EquipmentTypeRepository : IEquipmentTypeRepository
{
    private readonly AppDbContext dbContext;

    public EquipmentTypeRepository(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    /// <summary>
    /// Devuelve todos los tipos de equipo ordenados alfabéticamente por nombre.
    /// </summary>
    public async Task<IEnumerable<EquipmentType>> getAll()
    {
        return await dbContext.equipmentTypes
            .AsNoTracking()
            .OrderBy(e => e.name)
            .ToListAsync();
    }

    /// <summary>
    /// Devuelve únicamente los tipos de equipo con enabled = true.
    /// </summary>
    public async Task<IEnumerable<EquipmentType>> getEnabled()
    {
        return await dbContext.equipmentTypes
            .AsNoTracking()
            .Where(e => e.enabled)
            .OrderBy(e => e.name)
            .ToListAsync();
    }

    /// <summary>
    /// Busca un tipo de equipo por ID.
    /// </summary>
    public async Task<EquipmentType?> getById(Guid id)
    {
        return await dbContext.equipmentTypes
            .FirstOrDefaultAsync(e => e.id == id);
    }

    /// <summary>
    /// Busca un tipo de equipo por coincidencia exacta de nombre ignorando mayúsculas.
    /// </summary>
    public async Task<EquipmentType?> getByName(string name)
    {
        string normalizedName = name.Trim().ToLower();
        return await dbContext.equipmentTypes
            .FirstOrDefaultAsync(e => e.name.ToLower() == normalizedName);
    }

    /// <summary>
    /// Inserta un nuevo tipo de equipo y persiste los cambios.
    /// </summary>
    public async Task<EquipmentType> create(EquipmentType equipmentType)
    {
        await dbContext.equipmentTypes.AddAsync(equipmentType);
        await dbContext.SaveChangesAsync();
        return equipmentType;
    }

    /// <summary>
    /// Guarda los cambios de una entidad existente.
    /// </summary>
    public async Task<EquipmentType> update(EquipmentType equipmentType)
    {
        dbContext.equipmentTypes.Update(equipmentType);
        await dbContext.SaveChangesAsync();
        return equipmentType;
    }

    /// <summary>
    /// Verifica si existen órdenes de reparación asociadas a este tipo de equipo
    /// cuyo estado sea diferente de «Entregada» (DELIVERED).
    /// </summary>
    public async Task<bool> hasOrdersInProgress(Guid equipmentTypeId)
    {
        // repair_orders aún no tiene entidad en EF, así que se consulta con SQL parametrizado.
        return await dbContext.Database
            .SqlQuery<bool>($"""
                SELECT EXISTS (
                    SELECT 1 FROM repair_orders
                    WHERE equipment_type_id = {equipmentTypeId} AND status <> 'DELIVERED'
                ) AS "Value"
                """)
            .SingleAsync();
    }
}
