using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Services;

namespace TecnoFix.Controller
{
    [ApiController]
    [Route("api/technician")]
    [Authorize]
    public class TechnicianController : ControllerBase
    {
        private readonly ITechnicianService _technicianService;

        public TechnicianController(ITechnicianService technicianService)
        {
            _technicianService = technicianService;
        }

        // USU-003: solo Administrador.
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> registerTechnician(
            [FromBody] RegisterTechnicianRequestDTO request)
        {
            try
            {
                await _technicianService.registerTechnician(request);
                return Ok(new { message = "Técnico registrado exitosamente." });
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Ocurrió un error interno en el servidor."
                });
            }
        }

        // ORD-002: listado de órdenes en "Recibida" o "En diagnóstico".
        [HttpGet("orders/diagnosis")]
        [Authorize(Roles = "TECHNICIAN")]
        public async Task<IActionResult> getOrdersForDiagnosis()
        {
            try
            {
                var orders = await _technicianService.getOrdersForDiagnosis();
                return Ok(orders);
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Ocurrió un error interno en el servidor."
                });
            }
        }

        // ORD-002: abrir la orden y pasarla a "En diagnóstico".
        [HttpPatch("orders/{orderId:int}/diagnosis/start")]
        [Authorize(Roles = "TECHNICIAN")]
        public async Task<IActionResult> startDiagnosis(int orderId)
        {
            int? technicianUserId = getAuthenticatedUserId();

            if (technicianUserId is null)
                return Unauthorized(new { message = "Debe iniciar sesión nuevamente." });

            try
            {
                await _technicianService.startDiagnosis(
                    orderId,
                    technicianUserId.Value);

                return Ok(new { message = "Orden abierta para diagnóstico." });
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Ocurrió un error interno en el servidor."
                });
            }
        }

        // ORD-002: registrar diagnóstico y presupuesto.
        [HttpPost("orders/{orderId:int}/diagnosis")]
        [Authorize(Roles = "TECHNICIAN")]
        public async Task<IActionResult> registerDiagnosis(
            int orderId,
            [FromBody] RegisterDiagnosisRequestDTO request)
        {
            int? technicianUserId = getAuthenticatedUserId();

            if (technicianUserId is null)
                return Unauthorized(new { message = "Debe iniciar sesión nuevamente." });

            try
            {
                decimal totalCost = await _technicianService.registerDiagnosis(
                    orderId,
                    request,
                    technicianUserId.Value);

                return Ok(new
                {
                    message = "Diagnóstico y presupuesto registrados exitosamente.",
                    totalCost
                });
            }
            catch (BusinessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Ocurrió un error interno en el servidor."
                });
            }
        }

        private int? getAuthenticatedUserId()
        {
            string? value = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.TryParse(value, out int userId) ? userId : null;
        }
    }
}