using System.Text.RegularExpressions;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace TecnoFix.Services
{
    public class TechnicianService : ITechnicianService
    {
        private const string requiredDiagnosisMessage =
            "Debe completar el campo Diagnóstico técnico";
        private const string requiredLaborCostMessage =
            "Debe completar el campo Costo de mano de obra";
        private const string requiredPartsCostMessage =
            "Debe completar el campo Costo de repuestos";
        private const string invalidCostMessage =
            "El costo ingresado no es válido";
        private const string orderNotFoundMessage =
            "La orden de reparación no existe";
        private const string orderNotAvailableMessage =
            "La orden no se encuentra disponible para diagnóstico";
        private const string diagnosisAlreadyExistsMessage =
            "La orden ya tiene un diagnóstico registrado";

        private readonly IUserRepository _userRepository;
        private readonly IEngineerRepository _engineerRepository;
        private readonly IRepairOrderRepository _repairOrderRepository;

        public TechnicianService(
            IUserRepository userRepository,
            IEngineerRepository engineerRepository,
            IRepairOrderRepository repairOrderRepository)
        {
            _userRepository = userRepository;
            _engineerRepository = engineerRepository;
            _repairOrderRepository = repairOrderRepository;
        }

        // USU-003: registrar técnico.
        public async Task registerTechnician(RegisterTechnicianRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.name))
                throw new BusinessException("Debe completar el campo Nombre y apellidos");
            if (string.IsNullOrWhiteSpace(request.email))
                throw new BusinessException("Debe completar el campo Correo electrónico");
            if (string.IsNullOrWhiteSpace(request.specialty))
                throw new BusinessException("Debe completar el campo Especialidad");

            if (!Regex.IsMatch(request.name, @"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"))
                throw new BusinessException("El nombre solo puede contener letras y espacios");

            var existingUser = await _userRepository.findByEmail(request.email);
            if (existingUser != null)
                throw new BusinessException("El correo electrónico ingresado ya se encuentra registrado");

            string tempPassword = generateRandomPassword(8);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(tempPassword);

            var newEngineer = new Engineer
            {
                name = request.name,
                email = request.email,
                password = hashedPassword,
                role = UserRole.TECHNICIAN,
                technicianType = request.specialty,
                enabled = true
            };

            await _engineerRepository.add(newEngineer);
        }

        // ORD-002: listado de órdenes que pueden diagnosticarse.
        public async Task<List<DiagnosisOrderResponseDTO>> getOrdersForDiagnosis()
        {
            var orders = await _repairOrderRepository.findByStatuses(
                OrderStatus.RECEIVED,
                OrderStatus.IN_DIAGNOSIS);

            return orders.Select(order => new DiagnosisOrderResponseDTO
            {
                orderId = order.id,
                orderNumber = order.orderNumber,
                equipmentType = order.equipmentType,
                brandModel = order.brandModel,
                reportedFailure = order.reportedFailure,
                status = order.status.ToString(),
                receivedAt = order.receivedAt
            }).ToList();
        }

        // ORD-002: al abrir la orden para diagnosticar, pasa a "En diagnóstico".
        public async Task startDiagnosis(int orderId, int technicianUserId)
        {
            var order = await getOrderForDiagnosis(orderId);

            // Si ya está en diagnóstico, no se duplica el evento en la bitácora.
            if (order.status == OrderStatus.IN_DIAGNOSIS)
                return;

            order.status = OrderStatus.IN_DIAGNOSIS;

            _repairOrderRepository.addOrderLog(new OrderLog
            {
                orderId = order.id,
                userId = technicianUserId,
                status = OrderStatus.IN_DIAGNOSIS,
                comment = "Orden abierta para diagnóstico",
                createdAt = DateTime.Now
            });

            await _repairOrderRepository.saveChanges();
        }

        // ORD-002: registrar diagnóstico y presupuesto.
        public async Task<decimal> registerDiagnosis(
            int orderId,
            RegisterDiagnosisRequestDTO request,
            int technicianUserId)
        {
            if (request is null)
                throw new BusinessException("Debe completar los datos del diagnóstico");

            string technicalDiagnosis = request.technicalDiagnosis?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(technicalDiagnosis))
                throw new BusinessException(requiredDiagnosisMessage);

            if (!request.laborCost.HasValue)
                throw new BusinessException(requiredLaborCostMessage);

            if (!request.partsCost.HasValue)
                throw new BusinessException(requiredPartsCostMessage);

            decimal laborCost = request.laborCost.Value;
            decimal partsCost = request.partsCost.Value;

            if (laborCost < 0 || partsCost < 0)
                throw new BusinessException(invalidCostMessage);

            var order = await getOrderForDiagnosis(orderId);

            if (order.diagnosis != null)
                throw new BusinessException(diagnosisAlreadyExistsMessage);

            // Si el técnico registra el diagnóstico directamente desde "Recibida",
            // se deja también el evento de paso a "En diagnóstico".
            if (order.status == OrderStatus.RECEIVED)
            {
                order.status = OrderStatus.IN_DIAGNOSIS;

                _repairOrderRepository.addOrderLog(new OrderLog
                {
                    orderId = order.id,
                    userId = technicianUserId,
                    status = OrderStatus.IN_DIAGNOSIS,
                    comment = "Orden abierta para diagnóstico",
                    createdAt = DateTime.Now
                });
            }

            decimal totalCost = laborCost + partsCost;

            _repairOrderRepository.addDiagnosis(new Diagnosis
            {
                orderId = order.id,
                technicalDiagnosis = technicalDiagnosis,
                laborCost = laborCost,
                partsCost = partsCost,
                totalCost = totalCost
            });

            order.status = OrderStatus.QUOTED;

            _repairOrderRepository.addOrderLog(new OrderLog
            {
                orderId = order.id,
                userId = technicianUserId,
                status = OrderStatus.QUOTED,
                comment = "Diagnóstico y presupuesto registrados",
                createdAt = DateTime.Now
            });

            // Un solo SaveChanges: orden + diagnóstico + bitácora.
            await _repairOrderRepository.saveChanges();

            return totalCost;
        }

        private async Task<RepairOrder> getOrderForDiagnosis(int orderId)
        {
            var order = await _repairOrderRepository.findById(orderId);

            if (order == null)
                throw new BusinessException(orderNotFoundMessage);

            if (order.status != OrderStatus.RECEIVED &&
                order.status != OrderStatus.IN_DIAGNOSIS)
            {
                throw new BusinessException(orderNotAvailableMessage);
            }

            return order;
        }

        private string generateRandomPassword(int length)
        {
            const string chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            var random = new Random();

            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}