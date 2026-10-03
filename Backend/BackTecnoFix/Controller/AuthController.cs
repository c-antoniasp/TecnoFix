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

                // El token viaja en una cookie HttpOnly (no en el body), para que
                // JavaScript en el navegador no pueda leerlo. Se repite en cada
                // request automáticamente gracias a credentials: "include" en el frontend.
                Response.Cookies.Append("access_token", response.token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(60)
                });

                // Al frontend solo le devolvemos lo que necesita mostrar en pantalla.
                return Ok(new
                {
                    userId = response.userId,
                    name = response.name,
                    email = response.email,
                    role = response.role
                });
            }
            catch (AuthException ex)
            {
                return StatusCode(ex.statusCode, new { message = ex.Message });
            }
        }

        // POST api/auth/logout
        [HttpPost("logout")]
        public IActionResult logout()
        {
            Response.Cookies.Delete("access_token");
            return Ok(new { message = "Sesión cerrada" });
        }
    }
}
