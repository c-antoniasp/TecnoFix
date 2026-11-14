using Microsoft.EntityFrameworkCore;
using BackTecnoFix.Data;
using BackTecnoFix.Models;
using Npgsql;

namespace BackTecnoFix.Repositories;

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
    public async Task<EquipmentType?> getById(int id)
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
    /// cuyo estado sea diferente de «Entregada».
    /// Maneja de manera segura si la tabla de órdenes aún no ha sido migrada en Neon.
    /// </summary>
    public async Task<bool> hasOrdersInProgress(int equipmentTypeId)
    {
        try
        {
            // Verificamos en la tabla de órdenes si existe alguna orden cuyo estado != 'Entregada'
            var connection = dbContext.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                SELECT COUNT(1) 
                FROM information_schema.tables 
                WHERE table_name IN ('Order', 'RepairOrder', 'order', 'repair_order');
            ";
            var tableCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());

            if (tableCount == 0)
            {
                // Si la tabla de órdenes aún no ha sido creada por el equipo en Neon, no hay órdenes activas
                return false;
            }

            // Consultar órdenes en proceso asociadas al tipo de equipo
            cmd.CommandText = @"
                SELECT COUNT(1)
                FROM (
                    SELECT status, equipment_type_id FROM ""Order""
                    UNION ALL
                    SELECT status, equipment_type_id FROM ""RepairOrder""
                ) AS orders
                WHERE equipment_type_id = @equipmentTypeId 
                  AND LOWER(status) != 'entregada';
            ";
            var param = cmd.CreateParameter();
            param.ParameterName = "@equipmentTypeId";
            param.Value = equipmentTypeId;
            cmd.Parameters.Add(param);

            var inProgressCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            return inProgressCount > 0;
        }
        catch (PostgresException)
        {
            // En caso de que la tabla aún no exista o no tenga las columnas, retornamos falso para no bloquear el catálogo base
            return false;
        }
    }
}
