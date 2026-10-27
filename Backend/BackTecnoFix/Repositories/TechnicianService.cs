using System.Text.RegularExpressions;
using TecnoFix.DTO;
using TecnoFix.Exceptions;
using TecnoFix.Models;
using TecnoFix.Repositories;

namespace TecnoFix.Services
{
    public class TechnicianService : ITechnicianService
    {
        private readonly IUserRepository _userRepository;
        private readonly IEngineerRepository _engineerRepository;
        private readonly IEmailService _emailService;

        public TechnicianService(IUserRepository userRepository, IEngineerRepository engineerRepository, IEmailService emailService)
        {
            _userRepository = userRepository;
            _engineerRepository = engineerRepository;
            _emailService = emailService;
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

    }
}