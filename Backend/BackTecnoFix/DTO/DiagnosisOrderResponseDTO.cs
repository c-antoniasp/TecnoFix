namespace TecnoFix.DTO
{
    public class DiagnosisOrderResponseDTO
    {
        public int orderId { get; set; }
        public int orderNumber { get; set; }
        public string equipmentType { get; set; } = string.Empty;
        public string brandModel { get; set; } = string.Empty;
        public string reportedFailure { get; set; } = string.Empty;
        public string status { get; set; } = string.Empty;
        public DateTime receivedAt { get; set; }
    }
}