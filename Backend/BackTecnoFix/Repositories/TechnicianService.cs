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
        private readonly IEmailService _emailService;
        private readonly IRepairOrderRepository _repairOrderRepository;

        public TechnicianService(
            IUserRepository userRepository,
            IEngineerRepository engineerRepository,
            IEmailService emailService,
            IRepairOrderRepository repairOrderRepository)
        {
            _userRepository = userRepository;
            _engineerRepository = engineerRepository;
            _emailService = emailService;
            _repairOrderRepository = repairOrderRepository;
        }

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

            // Mismo formato de correo que valida el registro de clientes y el login.
            var email = request.email.Trim();
            if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new BusinessException("El correo electrónico no tiene un formato válido");

            var existingUser = await _userRepository.findByEmail(email);
            if (existingUser != null)
                throw new BusinessException("El correo electrónico ingresado ya se encuentra registrado");

            // Mismo generador seguro (RandomNumberGenerator) que usa el registro de clientes.
            string tempPassword = ClientService.GenerarPasswordTemporal(8);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(tempPassword);

            // Un técnico es un usuario con rol TECHNICIAN; su especialidad se guarda en "users".
            var newTechnician = new User
            {
                name = request.name,
                email = email,
                password = hashedPassword,
                role = UserRole.TECHNICIAN,
                specialty = request.specialty,
                accountStatus = true
            };

            await _engineerRepository.add(newTechnician);

            // Envía la contraseña temporal al técnico para que pueda iniciar sesión.
            const string roleDescription = "Ha sido registrado como técnico en TecnoFix.";

            try
            {
                await _emailService.SendEmailAsync(
                    email,
                    EmailTemplates.TemporaryPasswordSubject,
                    EmailTemplates.TemporaryPasswordText(request.name, tempPassword, roleDescription),
                    EmailTemplates.TemporaryPasswordHtml(request.name, tempPassword, roleDescription));
            }
            catch (InvalidOperationException)
            {
                throw new BusinessException("El técnico fue registrado, pero no se pudo enviar el correo con su contraseña temporal");
            }
        }

        // ORD-002: listado de órdenes que pueden diagnosticarse.
        public async Task<List<RepairOrderSummaryDTO>> getOrdersForDiagnosis()
        {
            var orders = await _repairOrderRepository.findByStatuses(
                OrderStatus.RECEIVED,
                OrderStatus.IN_DIAGNOSIS);

            return orders.Select(RepairOrderSummaryDTO.fromOrder).ToList();
        }

        // ORD-002: al abrir la orden para diagnosticar, pasa a "En diagnóstico".
        public async Task startDiagnosis(int orderId, Guid technicianUserId)
        {
            var order = await getOrderForDiagnosis(orderId);

            // Si ya está en diagnóstico, no se duplica el evento en la bitácora.
            if (order.status == OrderStatus.IN_DIAGNOSIS)
                return;

            moveToDiagnosis(order, technicianUserId);
            await _repairOrderRepository.saveChanges();
        }

        // ORD-002: registrar diagnóstico y presupuesto.
        public async Task<decimal> registerDiagnosis(
            int orderId,
            RegisterDiagnosisRequestDTO request,
            Guid technicianUserId)
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

            if (order.technicalDiagnosis != null)
                throw new BusinessException(diagnosisAlreadyExistsMessage);

            // Si el técnico registra el diagnóstico directamente desde "Recibida",
            // se deja también el evento de paso a "En diagnóstico".
            if (order.status == OrderStatus.RECEIVED)
                moveToDiagnosis(order, technicianUserId);

            // El diagnóstico y los costos viven en la misma orden; total_cost lo calcula la base de datos.
            order.technicalDiagnosis = technicalDiagnosis;
            order.laborCost = laborCost;
            order.partsCost = partsCost;
            order.status = OrderStatus.QUOTED;
            addLog(order, technicianUserId, OrderStatus.QUOTED, "Diagnóstico y presupuesto registrados");

            // Un solo SaveChanges: orden + bitácora.
            await _repairOrderRepository.saveChanges();

            return laborCost + partsCost;
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

        private void moveToDiagnosis(RepairOrder order, Guid technicianUserId)
        {
            order.status = OrderStatus.IN_DIAGNOSIS;
            // Si la orden la registró un administrador, el técnico que diagnostica queda como responsable.
            order.technicianId ??= technicianUserId;
            addLog(order, technicianUserId, OrderStatus.IN_DIAGNOSIS, "Orden abierta para diagnóstico");
        }

        private void addLog(RepairOrder order, Guid technicianUserId, OrderStatus status, string comment)
        {
            _repairOrderRepository.addOrderLog(new OrderLog
            {
                id = Guid.NewGuid(),
                orderId = order.id,
                responsibleUserId = technicianUserId,
                loggedStatus = status,
                comment = comment,
                loggedAt = DateTime.UtcNow
            });
        }
    }
}
