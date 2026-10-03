using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Services;

namespace TecnoFix.Controller
{
    [ApiController]
    [Route("api/technician")]
    [Authorize(Roles = "ADMIN")]
    public class TechnicianController : ControllerBase
    {
        private readonly ITechnicianService _technicianService;

        public TechnicianController(ITechnicianService technicianService)
        {
            _technicianService = technicianService;
        }

        [HttpPost]
        public async Task<IActionResult> registerTechnician([FromBody] RegisterTechnicianRequestDTO request)
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
                return StatusCode(500, new { message = "Ocurrió un error interno en el servidor." });
            }
        }
    }
}