using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface ITechnicianService
    {
        Task registerTechnician(RegisterTechnicianRequestDTO request);
        Task<List<DiagnosisOrderResponseDTO>> getOrdersForDiagnosis();
        Task startDiagnosis(int orderId, int technicianUserId);
        Task<decimal> registerDiagnosis(
            int orderId,
            RegisterDiagnosisRequestDTO request,
            int technicianUserId);
    }
}