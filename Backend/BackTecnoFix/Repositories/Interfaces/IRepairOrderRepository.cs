using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public interface IRepairOrderRepository
    {
        Task<RepairOrder?> findById(int orderId);

        Task<List<RepairOrder>> findByStatuses(params OrderStatus[] statuses);

        void addDiagnosis(Diagnosis diagnosis);

        void addOrderLog(OrderLog orderLog);

        Task saveChanges();
    }
}