namespace TecnoFix.Models
{
    public class OrderLog
    {
        public int id { get; set; }
        public int orderId { get; set; }
        public int userId { get; set; }
        public OrderStatus status { get; set; }
        public string? comment { get; set; }
        public DateTime createdAt { get; set; } = DateTime.Now;

        public RepairOrder? order { get; set; }
    }
}