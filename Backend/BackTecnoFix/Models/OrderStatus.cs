namespace TecnoFix.Models
{
    // Estados reales del enum order_status en PostgreSQL.
    public enum OrderStatus
    {
        RECEIVED,
        IN_DIAGNOSIS,
        QUOTED,
        IN_REPAIR,
        READY_FOR_PICKUP,
        DELIVERED,
        REJECTED
    }
}