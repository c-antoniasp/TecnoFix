using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IRepairOrderRepository
    {
        Task<List<User>> findClients();
        Task<bool> clientExists(Guid clientId);
        // Guarda la orden y su primer evento de bitácora en una sola transacción.
        Task<RepairOrder> add(RepairOrder order, OrderLog firstLog);

        Task<RepairOrder?> findById(int orderId);

        Task<List<RepairOrder>> findByStatuses(params OrderStatus[] statuses);

        void addOrderLog(OrderLog orderLog);

        Task saveChanges();
    }
}
