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

        public Task<List<User>> findClients()
        {
            return _dbContext.users
                .AsNoTracking()
                .Where(u => u.role == UserRole.CLIENT)
                .OrderBy(u => u.name)
                .ToListAsync();
        }

        public Task<bool> clientExists(Guid clientId)
        {
            return _dbContext.users.AnyAsync(u => u.id == clientId && u.role == UserRole.CLIENT);
        }

        public async Task<RepairOrder> add(RepairOrder order, OrderLog firstLog)
        {
            // El evento cuelga de la orden, así EF inserta ambos en el mismo SaveChanges
            // y completa order_id con el número que genera la base de datos.
            order.logs.Add(firstLog);
            _dbContext.repairOrders.Add(order);
            await _dbContext.SaveChangesAsync();
            return order;
        }

        public async Task<RepairOrder?> findById(int orderId)
        {
            return await _dbContext.repairOrders
                .FirstOrDefaultAsync(o => o.id == orderId);
        }

        public async Task<List<RepairOrder>> findByStatuses(params OrderStatus[] statuses)
        {
            return await _dbContext.repairOrders
                .Include(o => o.equipmentType)
                .Where(o => statuses.Contains(o.status))
                .OrderBy(o => o.receivedAt)
                .ToListAsync();
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
