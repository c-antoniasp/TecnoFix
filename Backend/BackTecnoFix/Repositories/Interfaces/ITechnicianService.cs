using TecnoFix.DTO;

namespace TecnoFix.Services
{
    public interface ITechnicianService
    {
        Task registerTechnician(RegisterTechnicianRequestDTO request);
    }
}