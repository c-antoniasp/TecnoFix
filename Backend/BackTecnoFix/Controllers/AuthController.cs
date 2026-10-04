using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Services;

namespace TecnoFix.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService authService;

    public AuthController(IAuthService authService)
    {
        this.authService = authService;
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(int userId, ChangePasswordRequestDTO request)
    {
        await authService.changePassoword(userId, request);
        return Ok(new { message = "Contraseña actualizada correctamente." });
    }
}