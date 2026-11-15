using TecnoFix.Models;

namespace TecnoFix.DTO;

public record RepairOrderSummaryDTO(
    int orderId, int orderNumber, string equipmentType, string brandModel,
    string reportedFailure, string status, DateTime receivedAt)
{
    public static RepairOrderSummaryDTO fromOrder(RepairOrder order) => new(
        order.id, order.id, order.equipmentType?.name ?? string.Empty, order.brandModel,
        order.faultDescription, order.status.ToString(), order.receivedAt);
}
