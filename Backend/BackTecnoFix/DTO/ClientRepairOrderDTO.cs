namespace TecnoFix.DTO;

public record RepairOrderBudgetDTO(string? technicalDiagnosis, decimal laborCost, decimal partsCost, decimal totalCost);

public record ClientRepairOrderDTO(
    RepairOrderSummaryDTO order, RepairOrderBudgetDTO? budget,
    bool canDecideBudget, bool availableForPickup, DateTime? decisionDate);

public record BudgetDecisionRequestDTO(bool? approved);

public record BudgetDecisionResponseDTO(
    string status, DateTime decisionDate, bool availableForPickup, string message);
