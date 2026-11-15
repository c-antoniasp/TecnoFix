using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> users => Set<User>();
    public DbSet<EquipmentType> equipmentTypes => Set<EquipmentType>();
    public DbSet<RepairOrder> repairOrders => Set<RepairOrder>();
    public DbSet<OrderLog> orderLogs => Set<OrderLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Administradores, técnicos y clientes viven en la tabla "users" de Neon.
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("id");
            e.Property(x => x.name).HasColumnName("full_name").IsRequired();
            e.Property(x => x.email).HasColumnName("email").IsRequired();
            e.Property(x => x.password).HasColumnName("password").IsRequired();
            e.Property(x => x.role).HasColumnName("role");
            e.Property(x => x.rut).HasColumnName("rut").HasMaxLength(9);
            e.Property(x => x.phone).HasColumnName("phone");
            e.Property(x => x.specialty).HasColumnName("specialty");
            e.Property(x => x.accountStatus).HasColumnName("account_status");
            e.Property(x => x.createdAt).HasColumnName("created_at");
            e.HasIndex(x => x.email).IsUnique();
            e.HasIndex(x => x.rut).IsUnique();
        });

        // Catálogo de tipos de equipo (ADM-001).
        modelBuilder.Entity<EquipmentType>(e =>
        {
            e.ToTable("equipment_types");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("id");
            e.Property(x => x.name).HasColumnName("name").IsRequired();
            e.Property(x => x.description).HasColumnName("description");
            e.Property(x => x.enabled).HasColumnName("enabled");
            e.HasIndex(x => x.name).IsUnique();
        });

        // Órdenes de reparación (ORD-001 en adelante).
        modelBuilder.Entity<RepairOrder>(e =>
        {
            e.ToTable("repair_orders");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("id");
            e.Property(x => x.clientId).HasColumnName("client_id");
            e.Property(x => x.technicianId).HasColumnName("technician_id");
            e.Property(x => x.equipmentTypeId).HasColumnName("equipment_type_id");
            e.Property(x => x.status).HasColumnName("status");
            e.Property(x => x.brandModel).HasColumnName("brand_model").IsRequired();
            e.Property(x => x.serialNumber).HasColumnName("serial_number");
            e.Property(x => x.faultDescription).HasColumnName("fault_description").IsRequired();
            e.Property(x => x.accessories).HasColumnName("accessories");
            e.Property(x => x.technicalDiagnosis).HasColumnName("technical_diagnosis");
            e.Property(x => x.laborCost).HasColumnName("labor_cost").HasPrecision(12, 2);
            e.Property(x => x.partsCost).HasColumnName("parts_cost").HasPrecision(12, 2);
            e.Property(x => x.totalCost).HasColumnName("total_cost").HasPrecision(12, 2)
                .HasComputedColumnSql("labor_cost + parts_cost", stored: true);
            e.Property(x => x.budgetApproved).HasColumnName("budget_approved");
            e.Property(x => x.decisionDate).HasColumnName("decision_date");
            e.Property(x => x.pickupName).HasColumnName("pickup_name");
            e.Property(x => x.deliveryNotes).HasColumnName("delivery_notes");
            e.Property(x => x.receivedAt).HasColumnName("received_at");
            e.Property(x => x.deliveredAt).HasColumnName("delivered_at");
            e.HasOne<User>().WithMany().HasForeignKey(x => x.clientId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.technicianId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.equipmentType).WithMany().HasForeignKey(x => x.equipmentTypeId).OnDelete(DeleteBehavior.Restrict);
        });

        // Bitácora de cambios de estado de cada orden.
        modelBuilder.Entity<OrderLog>(e =>
        {
            e.ToTable("order_logs");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("id");
            e.Property(x => x.orderId).HasColumnName("order_id");
            e.Property(x => x.responsibleUserId).HasColumnName("responsible_user_id");
            e.Property(x => x.loggedStatus).HasColumnName("logged_status");
            e.Property(x => x.comment).HasColumnName("comment");
            e.Property(x => x.loggedAt).HasColumnName("logged_at");
            e.HasOne(x => x.order).WithMany(o => o.logs).HasForeignKey(x => x.orderId);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.responsibleUserId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
