using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface IRepairOrderService
    {
        Task<List<OrderClientDTO>> getClients();
        Task<RegisterRepairOrderResponseDTO> registerOrder(RegisterRepairOrderRequestDTO request, Guid responsibleUserId, bool isTechnician);
    }
}
