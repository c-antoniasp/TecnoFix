using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Services;

namespace TecnoFix.Controller
{
    // Órdenes de reparación: las registran técnicos y administradores (ORD-001).
    [ApiController]
    [Route("api/repair-orders")]
    [Authorize(Roles = "ADMIN,TECHNICIAN")]
    public class RepairOrderController : ControllerBase
    {
        private readonly IRepairOrderService _repairOrderService;

        public RepairOrderController(IRepairOrderService repairOrderService)
        {
            _repairOrderService = repairOrderService;
        }

        // Listado de clientes para el campo «Cliente» del formulario.
        [HttpGet("clients")]
        public async Task<IActionResult> getClients()
        {
            try
            {
                return Ok(await _repairOrderService.getClients());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno en el servidor." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> registerOrder([FromBody] RegisterRepairOrderRequestDTO request)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized(new { message = "Debe iniciar sesión nuevamente." });
            }

            try
            {
                var result = await _repairOrderService.registerOrder(request, userId, User.IsInRole("TECHNICIAN"));
                return StatusCode(StatusCodes.Status201Created, result);
            }
            catch (BusinessException ex)
            {
                return StatusCode(ex.statusCode, new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno en el servidor." });
            }
        }
    }
}
