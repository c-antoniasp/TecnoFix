using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface IRepairOrderService
    {
        Task<List<OrderClientDTO>> getClients();
        Task<List<ClientRepairOrderDTO>> getClientOrders(Guid clientId);
        Task<BudgetDecisionResponseDTO> decideBudget(int orderId, Guid clientId, BudgetDecisionRequestDTO request);
        Task<RegisterRepairOrderResponseDTO> registerOrder(RegisterRepairOrderRequestDTO request, Guid responsibleUserId, bool isTechnician);
    }
}
