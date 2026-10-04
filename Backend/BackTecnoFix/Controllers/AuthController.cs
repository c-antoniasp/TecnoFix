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

    [HttpPost("login")]
    public async Task<IActionResult> login([FromBody] LoginRequestDTO request)
    {
        try
        {
            LoginResponseDTO response = await authService.login(request);
            var cookieOptions = createSessionCookieOptions();
            cookieOptions.Expires = DateTimeOffset.UtcNow.AddMinutes(60);
            Response.Cookies.Append("access_token", response.token, cookieOptions);

            return Ok(new
            {
                userId = response.userId,
                name = response.name,
                email = response.email,
                role = response.role
            });
        }
        catch (AuthException exception)
        {
            return StatusCode(exception.statusCode, new { message = exception.Message });
        }
    }

    [HttpPost("logout")]
    public IActionResult logout()
    {
        Response.Cookies.Delete("access_token", createSessionCookieOptions());
        return Ok(new { message = "Sesión cerrada" });
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
            Response.Cookies.Delete("access_token", createSessionCookieOptions());
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

    private static CookieOptions createSessionCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None,
        Path = "/"
    };
}
