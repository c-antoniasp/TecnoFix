using System.Security.Cryptography;
using System.Text.RegularExpressions;
using TecnoFix.Data;
using TecnoFix.DTO;
using TecnoFix.Models;

namespace TecnoFix.Services;

/// <summary>
/// Servicio que implementa la lógica de negocio y las validaciones del requerimiento USU-002: Registrar cliente.
/// </summary>
public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;
    private readonly IEmailService _emailService;

    // Expresión regular para verificar si el correo cumple con un formato estándar válido.
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    // Expresión regular para verificar que el RUT solo tenga entre 7 y 8 dígitos seguidos de un dígito verificador o 'K' (sin puntos ni guion).
    private static readonly Regex RutFormatRegex = new(
        @"^[0-9]{7,8}[0-9kK]$",
        RegexOptions.Compiled);

    public ClientService(IClientRepository clientRepository, IEmailService emailService)
    {
        _clientRepository = clientRepository;
        _emailService = emailService;
    }

    /// <summary>
    /// Procesa el registro de un nuevo cliente aplicando todas las validaciones especificadas en la ERS.
    /// </summary>
    /// <param name="dto">Datos de entrada para el registro del cliente.</param>
    /// <returns>DTO de respuesta con el resultado de la operación.</returns>
    public async Task<RegisterClientResponseDto> RegisterClientAsync(RegisterClientRequestDto dto)
    {
        // 1. Validación de campos obligatorios
        if (string.IsNullOrWhiteSpace(dto.Nombre))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "Debe completar el campo Nombre y apellidos"
            };
        }

        if (string.IsNullOrWhiteSpace(dto.Correo))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "Debe completar el campo Correo electrónico"
            };
        }

        if (string.IsNullOrWhiteSpace(dto.Rut))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "Debe completar el campo RUT"
            };
        }

        if (string.IsNullOrWhiteSpace(dto.Telefono))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "Debe completar el campo Teléfono de contacto"
            };
        }

        // Limpieza de datos
        var cleanEmail = dto.Correo.Trim().ToLowerInvariant();
        var cleanRut = dto.Rut.Trim().ToUpperInvariant();
        var cleanNombre = dto.Nombre.Trim();
        var cleanTelefono = dto.Telefono.Trim();

        // 2. Validación de formato de correo electrónico
        if (!EmailRegex.IsMatch(cleanEmail))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "El correo electrónico no tiene un formato válido"
            };
        }

        // 3. Validación de unicidad de correo electrónico
        if (await _clientRepository.ExistsByEmailAsync(cleanEmail))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "El correo electrónico ingresado ya se encuentra registrado"
            };
        }

        // 4. Validación de formato de RUT (sin puntos ni guion)
        if (!RutFormatRegex.IsMatch(cleanRut))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)"
            };
        }

        // 5. Validación del RUT mediante algoritmo de Chile (Módulo 11)
        if (!ValidarRutChileno(cleanRut))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "El RUT ingresado no es válido según el algoritmo de verificación"
            };
        }

        // 6. Validación de unicidad de RUT
        if (await _clientRepository.ExistsByRutAsync(cleanRut))
        {
            return new RegisterClientResponseDto
            {
                Success = false,
                Message = "El RUT ingresado ya se encuentra registrado"
            };
        }

        // 7. Generación de contraseña temporal de 8 caracteres de manera aleatoria
        string temporaryPassword = GenerarPasswordTemporal(8);

        // 8. Creación de la entidad del cliente
        var newClient = new Client
        {
            name = cleanNombre,
            email = cleanEmail,
            password = temporaryPassword, // Nota: En producción esto debe ser hasheado (ej. BCrypt)
            rut = cleanRut,
            phone = cleanTelefono
        };

        var savedClient = await _clientRepository.AddAsync(newClient);

        // 9. Envío de correo electrónico con la contraseña temporal
        string subject = "Bienvenido a TecnoFix - Su contraseña temporal de acceso";
        string body = $@"Estimado/a {cleanNombre},

Su registro en TecnoFix ha sido completado exitosamente.
A continuación, le proporcionamos su contraseña temporal de 8 caracteres para iniciar sesión en el sistema:

Contraseña temporal: {temporaryPassword}

Por seguridad, recuerde cambiar su contraseña una vez haya iniciado sesión.

Atentamente,
Equipo TecnoFix";

        await _emailService.SendEmailAsync(cleanEmail, subject, body);

        // 10. Retorno de respuesta exitosa
        return new RegisterClientResponseDto
        {
            Success = true,
            Id = savedClient.id,
            Correo = savedClient.email,
            Message = "Cliente registrado exitosamente. Se ha enviado una contraseña temporal a su correo electrónico."
        };
    }

    /// <summary>
    /// Valida un RUT chileno utilizando el algoritmo de Módulo 11.
    /// </summary>
    /// <param name="rutSinFormato">RUT sin puntos ni guion (ej: 12345670K).</param>
    /// <returns>True si el dígito verificador es correcto, de lo contrario False.</returns>
    public static bool ValidarRutChileno(string rutSinFormato)
    {
        if (string.IsNullOrWhiteSpace(rutSinFormato) || rutSinFormato.Length < 8)
            return false;

        string cuerpo = rutSinFormato[..^1];
        char dvIngresado = char.ToUpperInvariant(rutSinFormato[^1]);

        if (!int.TryParse(cuerpo, out int rutNumero))
            return false;

        int suma = 0;
        int multiplicador = 2;

        while (rutNumero > 0)
        {
            suma += (rutNumero % 10) * multiplicador;
            rutNumero /= 10;
            multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
        }

        int resto = 11 - (suma % 11);
        char dvEsperado = resto switch
        {
            11 => '0',
            10 => 'K',
            _ => (char)('0' + resto)
        };

        return dvIngresado == dvEsperado;
    }

    /// <summary>
    /// Genera una contraseña aleatoria y segura de longitud específica.
    /// </summary>
    /// <param name="longitud">Número de caracteres de la contraseña (8 por defecto).</param>
    /// <returns>Cadena alfanumérica generada aleatoriamente.</returns>
    public static string GenerarPasswordTemporal(int longitud = 8)
    {
        const string caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        var resultado = new char[longitud];
        var bytes = new byte[longitud];

        RandomNumberGenerator.Fill(bytes);

        for (int i = 0; i < longitud; i++)
        {
            resultado[i] = caracteres[bytes[i] % caracteres.Length];
        }

        return new string(resultado);
    }
}
