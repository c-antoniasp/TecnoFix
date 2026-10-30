namespace TecnoFix.Models
{
    public class Diagnosis
    {
        public int id { get; set; }
        public int orderId { get; set; }
        public string technicalDiagnosis { get; set; } = string.Empty;
        public decimal laborCost { get; set; }
        public decimal partsCost { get; set; }
        public decimal totalCost { get; set; }

        public RepairOrder? order { get; set; }
    }
}