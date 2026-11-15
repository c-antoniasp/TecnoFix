namespace TecnoFix.DTO
{
    // Datos de la orden que ingresa el técnico o administrador al recibir un equipo (ORD-001).
    public class RegisterRepairOrderRequestDTO
    {
        public Guid? clientId { get; set; }
        public Guid? equipmentTypeId { get; set; }
        public string brandModel { get; set; } = string.Empty;
        public string? serialNumber { get; set; }
        public string faultDescription { get; set; } = string.Empty;
        public string? accessories { get; set; }
    }

    public class RegisterRepairOrderResponseDTO
    {
        public int orderNumber { get; set; }
        public string status { get; set; } = string.Empty;
        public DateTime receivedAt { get; set; }
        public string message { get; set; } = string.Empty;
    }

    // Cliente que se puede seleccionar al registrar una orden.
    public class OrderClientDTO
    {
        public Guid id { get; set; }
        public string name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string? rut { get; set; }
    }
}
