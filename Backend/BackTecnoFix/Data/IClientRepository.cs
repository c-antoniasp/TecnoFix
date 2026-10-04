using TecnoFix.Models;

namespace TecnoFix.Data;

/// <summary>
/// Interfaz para el repositorio de datos de clientes.
/// Sigue el patrón Repository para desacoplar la capa de persistencia de la lógica de negocio.
/// </summary>
public interface IClientRepository
{
    /// <summary>
    /// Verifica si ya existe un cliente con el correo electrónico especificado.
    /// </summary>
    /// <param name="email">Correo electrónico a consultar.</param>
    /// <returns>True si ya se encuentra registrado, de lo contrario False.</returns>
    Task<bool> ExistsByEmailAsync(string email);

    /// <summary>
    /// Verifica si ya existe un cliente con el RUT especificado.
    /// </summary>
    /// <param name="rut">RUT chileno a consultar (sin puntos ni guion).</param>
    /// <returns>True si ya se encuentra registrado, de lo contrario False.</returns>
    Task<bool> ExistsByRutAsync(string rut);

    /// <summary>
    /// Agrega un nuevo cliente al almacenamiento de datos.
    /// </summary>
    /// <param name="client">Instancia del cliente a almacenar.</param>
    /// <returns>Instancia del cliente guardado con su identificador generado.</returns>
    Task<Client> AddAsync(Client client);

    /// <summary>
    /// Obtiene un cliente según su identificador único.
    /// </summary>
    /// <param name="id">Identificador del cliente.</param>
    /// <returns>El cliente correspondiente o null si no existe.</returns>
    Task<Client?> GetByIdAsync(int id);

    /// <summary>
    /// Obtiene la lista completa de clientes registrados.
    /// </summary>
    /// <returns>Colección de clientes.</returns>
    Task<IEnumerable<Client>> GetAllAsync();
}
