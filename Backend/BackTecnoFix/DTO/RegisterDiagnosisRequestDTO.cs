namespace TecnoFix.DTO
{
    public class RegisterDiagnosisRequestDTO
    {
        public string technicalDiagnosis { get; set; } = string.Empty;
        public decimal? laborCost { get; set; }
        public decimal? partsCost { get; set; }
    }
}