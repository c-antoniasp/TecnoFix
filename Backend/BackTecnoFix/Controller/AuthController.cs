using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Services;

namespace TecnoFix.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> login([FromBody] LoginRequestDTO request)
        {
            try
            {
                LoginResponseDTO response = await authService.login(request);
                return Ok(response);
            }
            catch (AuthException ex)
            {
                return StatusCode(ex.statusCode, new { message = ex.Message });
            }
        }
    }
}