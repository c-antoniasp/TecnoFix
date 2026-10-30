namespace TecnoFix.Models
{
    public class RepairOrder
    {
        public int id { get; set; }
        public int clientId { get; set; }
        public int orderNumber { get; set; }
        public string equipmentType { get; set; } = string.Empty;
        public string brandModel { get; set; } = string.Empty;
        public string? serialNumber { get; set; }
        public string reportedFailure { get; set; } = string.Empty;
        public string? accessories { get; set; }
        public OrderStatus status { get; set; } = OrderStatus.RECEIVED;
        public DateTime receivedAt { get; set; } = DateTime.Now;

        // Relación uno a uno con Diagnosis.
        public Diagnosis? diagnosis { get; set; }
    }
}