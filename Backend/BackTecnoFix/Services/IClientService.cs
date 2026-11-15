using TecnoFix.DTO;

namespace TecnoFix.Services;

/// <summary>
/// Interfaz para la lógica de negocio y validaciones del registro y gestión de clientes.
/// Requerimiento: USU-002 (Registrar cliente).
/// </summary>
public interface IClientService
{
    /// <summary>
    /// Registra un nuevo cliente aplicando todas las validaciones de negocio requeridas por USU-002.
    /// </summary>
    /// <param name="dto">Datos del cliente a registrar.</param>
    /// <returns>Respuesta con el resultado, mensaje y datos del cliente registrado.</returns>
    Task<RegisterClientResponseDto> RegisterClientAsync(RegisterClientRequestDto dto);
}
