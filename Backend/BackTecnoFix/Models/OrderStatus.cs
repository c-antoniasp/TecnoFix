namespace TecnoFix.Models
{
    // Estados del enum order_status en PostgreSQL (Recibida → … → Entregada, y Rechazada).
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
