using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Services;

namespace TecnoFix.Controller;

/// <summary>
/// Controlador HTTP para el catálogo de tipos de equipo (ADM-001).
/// Expone los endpoints REST bajo el prefijo api/equipment-types.
/// Protegido por rol ADMIN para operaciones de administración.
/// </summary>
[ApiController]
[Route("api/equipment-types")]
public class EquipmentTypeController : ControllerBase
{
    private readonly IEquipmentTypeService equipmentTypeService;

    public EquipmentTypeController(IEquipmentTypeService equipmentTypeService)
    {
        this.equipmentTypeService = equipmentTypeService;
    }

    /// <summary>
    /// Lista todos los tipos de equipo registrados (habilitados y deshabilitados).
    /// Uso exclusivo del Administrador.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> getAll()
    {
        try
        {
            var result = await equipmentTypeService.getAll();
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Lista únicamente los tipos de equipo habilitados.
    /// Utilizado por ORD-001 (Registrar orden de reparación) para técnicos y administradores.
    /// </summary>
    [HttpGet("enabled")]
    [Authorize]
    public async Task<IActionResult> getEnabled()
    {
        try
        {
            var result = await equipmentTypeService.getEnabled();
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtiene el detalle de un tipo de equipo por ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> getById(Guid id)
    {
        try
        {
            var result = await equipmentTypeService.getById(id);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Registra un nuevo tipo de equipo.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> create([FromBody] EquipmentTypeRequestDTO requestDto)
    {
        try
        {
            var result = await equipmentTypeService.create(requestDto);
            return StatusCode(201, result);
        }
        catch (BusinessException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Edita el nombre y la descripción de un tipo de equipo existente.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> update(Guid id, [FromBody] EquipmentTypeRequestDTO requestDto)
    {
        try
        {
            var result = await equipmentTypeService.update(id, requestDto);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Cambia el estado (habilitado / deshabilitado) de un tipo de equipo.
    /// Un tipo de equipo no se elimina físicamente, solo se deshabilita.
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> toggleStatus(Guid id)
    {
        try
        {
            var result = await equipmentTypeService.toggleStatus(id);
            return Ok(result);
        }
        catch (BusinessException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
