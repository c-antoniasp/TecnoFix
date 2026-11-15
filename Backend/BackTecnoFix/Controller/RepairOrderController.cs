using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Services;

namespace TecnoFix.Controller
{
    [ApiController]
    [Route("api/repair-orders")]
    [Authorize]
    public class RepairOrderController : ControllerBase
    {
        private readonly IRepairOrderService _repairOrderService;

        public RepairOrderController(IRepairOrderService repairOrderService)
        {
            _repairOrderService = repairOrderService;
        }

        // Listado de clientes para el campo «Cliente» del formulario.
        [HttpGet("clients")]
        [Authorize(Roles = "ADMIN,TECHNICIAN")]
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
        [Authorize(Roles = "ADMIN,TECHNICIAN")]
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

        [HttpGet("mine")]
        [Authorize(Roles = "CLIENT")]
        public async Task<IActionResult> getClientOrders()
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var clientId) || clientId == Guid.Empty)
                return Unauthorized(new { message = "Debe iniciar sesión nuevamente." });

            try
            {
                return Ok(await _repairOrderService.getClientOrders(clientId));
            }
            catch (BusinessException ex)
            {
                return StatusCode(ex.statusCode, new { message = ex.Message });
            }
        }

        [HttpPut("{orderId:int}/budget-decision")]
        [Authorize(Roles = "CLIENT")]
        public async Task<IActionResult> decideBudget(int orderId, [FromBody] BudgetDecisionRequestDTO request)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var clientId) || clientId == Guid.Empty)
                return Unauthorized(new { message = "Debe iniciar sesión nuevamente." });

            try
            {
                return Ok(await _repairOrderService.decideBudget(orderId, clientId, request));
            }
            catch (BusinessException ex)
            {
                return StatusCode(ex.statusCode, new { message = ex.Message });
            }
        }
    }
}
