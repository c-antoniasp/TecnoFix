using Microsoft.AspNetCore.Mvc;
using BackTecnoFix.DTO;
using BackTecnoFix.Services;

namespace BackTecnoFix.Controller;

/// <summary>
/// Controlador de autenticación según sección 2.1 del estándar.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService authService;

    public AuthController(IAuthService authService)
    {
        this.authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> login([FromBody] LoginRequestDTO requestDto)
    {
        try
        {
            var result = await authService.login(requestDto);
            return Ok(result);
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.statusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error al iniciar sesión" });
        }
    }
}
