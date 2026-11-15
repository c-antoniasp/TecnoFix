namespace TecnoFix.Models
{
    // Tabla "order_logs": bitácora con cada cambio de estado de una orden.
    public class OrderLog
    {
        public Guid id { get; set; }
        public int orderId { get; set; }
        public Guid responsibleUserId { get; set; }
        public OrderStatus loggedStatus { get; set; }
        public string? comment { get; set; }
        public DateTime loggedAt { get; set; } = DateTime.UtcNow;

        public RepairOrder? order { get; set; }
    }
}
