using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface ITechnicianService
    {
        Task registerTechnician(RegisterTechnicianRequestDTO request);
        Task<List<RepairOrderSummaryDTO>> getOrdersForDiagnosis();
        Task startDiagnosis(int orderId, Guid technicianUserId);
        Task<decimal> registerDiagnosis(
            int orderId,
            RegisterDiagnosisRequestDTO request,
            Guid technicianUserId);
    }
}
