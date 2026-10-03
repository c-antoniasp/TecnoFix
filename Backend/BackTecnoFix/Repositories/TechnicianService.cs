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

        public TechnicianService(IUserRepository userRepository, IEngineerRepository engineerRepository)
        {
            _userRepository = userRepository;
            _engineerRepository = engineerRepository;
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

        private string generateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}