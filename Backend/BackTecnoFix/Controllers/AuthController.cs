using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using TecnoFix.DTO;
using TecnoFix.Services;

namespace TecnoFix.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService authService;

    public AuthController(IAuthService authService)
    {
        this.authService = authService;
    }

    [HttpPut("change-password")]
    [Authorize]
    [ChangePasswordValidation]
    public async Task<IActionResult> changePassword(
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ChangePasswordRequestDTO? request)
    {
        if (User.Identity?.IsAuthenticated != true
            || !int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            || userId <= 0)
        {
            return Unauthorized(new { message = "Debe iniciar sesión nuevamente." });
        }

        try
        {
            await authService.changePassword(userId, request);
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });
            return Ok(new
            {
                message = "Contraseña actualizada correctamente. Debe iniciar sesión nuevamente.",
                requiresLogin = true
            });
        }
        catch (AuthException exception)
        {
            return StatusCode(exception.statusCode, new { message = exception.Message });
        }
    }
}
