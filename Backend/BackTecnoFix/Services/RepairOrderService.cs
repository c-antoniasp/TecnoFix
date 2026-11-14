using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace TecnoFix.Services
{
    // Reglas de negocio de ORD-001 (Registrar orden de reparación).
    public class RepairOrderService : IRepairOrderService
    {
        private readonly IRepairOrderRepository _repairOrderRepository;
        private readonly IEquipmentTypeRepository _equipmentTypeRepository;

        public RepairOrderService(IRepairOrderRepository repairOrderRepository, IEquipmentTypeRepository equipmentTypeRepository)
        {
            _repairOrderRepository = repairOrderRepository;
            _equipmentTypeRepository = equipmentTypeRepository;
        }

        public async Task<List<OrderClientDTO>> getClients()
        {
            var clients = await _repairOrderRepository.findClients();
            return clients
                .Select(c => new OrderClientDTO { id = c.id, name = c.name, email = c.email, rut = c.rut })
                .ToList();
        }

        public async Task<RegisterRepairOrderResponseDTO> registerOrder(
            RegisterRepairOrderRequestDTO request, Guid responsibleUserId, bool isTechnician)
        {
            // Campos obligatorios, en el mismo orden en que aparecen en el formulario.
            if (request.clientId is null || request.clientId == Guid.Empty)
                throw new BusinessException("Debe completar el campo Cliente");
            if (request.equipmentTypeId is null || request.equipmentTypeId == Guid.Empty)
                throw new BusinessException("Debe completar el campo Tipo de equipo");
            if (string.IsNullOrWhiteSpace(request.brandModel))
                throw new BusinessException("Debe completar el campo Marca y modelo");
            if (string.IsNullOrWhiteSpace(request.faultDescription))
                throw new BusinessException("Debe completar el campo Descripción de la falla");

            if (!await _repairOrderRepository.clientExists(request.clientId.Value))
                throw new BusinessException("El cliente seleccionado no se encuentra registrado", 404);

            // Solo se ofrecen tipos de equipo habilitados (ADM-001).
            var equipmentType = await _equipmentTypeRepository.getById(request.equipmentTypeId.Value);
            if (equipmentType is null || !equipmentType.enabled)
                throw new BusinessException("El tipo de equipo seleccionado no está disponible");

            var receivedAt = DateTime.UtcNow;
            var order = new RepairOrder
            {
                clientId = request.clientId.Value,
                // Si quien recibe el equipo es un técnico, queda como responsable de la orden.
                technicianId = isTechnician ? responsibleUserId : null,
                equipmentTypeId = equipmentType.id,
                status = OrderStatus.RECEIVED,
                brandModel = request.brandModel.Trim(),
                serialNumber = emptyToNull(request.serialNumber),
                faultDescription = request.faultDescription.Trim(),
                accessories = emptyToNull(request.accessories),
                receivedAt = receivedAt
            };
            var firstLog = new OrderLog
            {
                id = Guid.NewGuid(),
                responsibleUserId = responsibleUserId,
                loggedStatus = OrderStatus.RECEIVED,
                comment = "Equipo recibido y orden registrada",
                loggedAt = receivedAt
            };

            var saved = await _repairOrderRepository.add(order, firstLog);

            return new RegisterRepairOrderResponseDTO
            {
                orderNumber = saved.id,
                status = saved.status.ToString(),
                receivedAt = saved.receivedAt,
                message = $"Orden N° {saved.id} registrada exitosamente."
            };
        }

        private static string? emptyToNull(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}
