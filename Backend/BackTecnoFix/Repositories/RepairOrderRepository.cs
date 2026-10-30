using Microsoft.EntityFrameworkCore;
using TecnoFix.Data;
using TecnoFix.Models;

namespace TecnoFix.Repositories
{
    public class RepairOrderRepository : IRepairOrderRepository
    {
        private readonly AppDbContext _dbContext;

        public RepairOrderRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RepairOrder?> findById(int orderId)
        {
            return await _dbContext.repairOrders
                .Include(o => o.diagnosis)
                .FirstOrDefaultAsync(o => o.id == orderId);
        }

        public async Task<List<RepairOrder>> findByStatuses(params OrderStatus[] statuses)
        {
            return await _dbContext.repairOrders
                .Where(o => statuses.Contains(o.status))
                .OrderBy(o => o.receivedAt)
                .ToListAsync();
        }

        public void addDiagnosis(Diagnosis diagnosis)
        {
            _dbContext.diagnoses.Add(diagnosis);
        }

        public void addOrderLog(OrderLog orderLog)
        {
            _dbContext.orderLogs.Add(orderLog);
        }

        public async Task saveChanges()
        {
            await _dbContext.SaveChangesAsync();
        }
    }
}