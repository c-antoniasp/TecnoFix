using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IRepairOrderRepository
    {
        Task<List<User>> findClients();
        Task<bool> clientExists(Guid clientId);
        // Guarda la orden y su primer evento de bitácora en una sola transacción.
        Task<RepairOrder> add(RepairOrder order, OrderLog firstLog);
    }
}
