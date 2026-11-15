namespace TecnoFix.Models
{
    // Tabla "repair_orders". El id (IDENTITY) es el número de orden único y correlativo.
    public class RepairOrder
    {
        public int id { get; set; }
        public Guid clientId { get; set; }
        public Guid? technicianId { get; set; }
        public Guid equipmentTypeId { get; set; }
        public OrderStatus status { get; set; } = OrderStatus.RECEIVED;
        public string brandModel { get; set; } = string.Empty;
        public string? serialNumber { get; set; }
        public string faultDescription { get; set; } = string.Empty;
        public string? accessories { get; set; }
        public string? technicalDiagnosis { get; set; }
        public decimal laborCost { get; set; }
        public decimal partsCost { get; set; }
        public decimal totalCost { get; private set; } // columna calculada: labor_cost + parts_cost
        public bool? budgetApproved { get; set; }
        public DateTime? decisionDate { get; set; }
        public string? pickupName { get; set; }
        public string? deliveryNotes { get; set; }
        public DateTime receivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? deliveredAt { get; set; }

        public EquipmentType? equipmentType { get; set; }
        public List<OrderLog> logs { get; set; } = new();
    }
}
