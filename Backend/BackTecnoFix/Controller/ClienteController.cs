using Microsoft.AspNetCore.Mvc;
using TecnoFix.DTO;
using TecnoFix.Services;

namespace TecnoFix.Controller;

/// <summary>
/// Controlador para la gestión y registro de clientes.
/// Requerimiento: USU-002 (Registrar cliente).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ClienteController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClienteController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>
    /// Endpoint para registrar un nuevo cliente en la plataforma.
    /// Valida campos obligatorios, unicidad de correo y RUT, y algoritmo Módulo 11.
    /// </summary>
    /// <param name="request">Datos del cliente a registrar (Nombre, Correo, Rut, Teléfono).</param>
    /// <returns>Resultado del registro con código de estado HTTP adecuado.</returns>
    [HttpPost("registro")]
    [ProducesResponseType(typeof(RegisterClientResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(RegisterClientResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(RegisterClientResponseDto), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegistrarCliente([FromBody] RegisterClientRequestDto request)
    {
        var result = await _clientService.RegisterClientAsync(request);

        if (!result.Success)
        {
            // Si el error es por duplicidad de correo o RUT, se retorna 409 Conflict
            if (result.Message.Contains("ya se encuentra registrado", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(result);
            }

            // Para errores de validación de campos, formato o algoritmo, se retorna 400 Bad Request
            return BadRequest(result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }
}
