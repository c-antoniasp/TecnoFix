using Microsoft.EntityFrameworkCore;
using Npgsql;
using TecnoFix.Models;
using Npgsql.NameTranslation;

namespace TecnoFix.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> users => Set<User>();
        public DbSet<Admin> administrators => Set<Admin>();
        public DbSet<Client> clients => Set<Client>();
        public DbSet<Engineer> engineers => Set<Engineer>();

        public DbSet<RepairOrder> repairOrders => Set<RepairOrder>();
        public DbSet<Diagnosis> diagnoses => Set<Diagnosis>();
        public DbSet<OrderLog> orderLogs => Set<OrderLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<UserRole>("user_role", nameTranslator: new NpgsqlNullNameTranslator());
            modelBuilder.HasPostgresEnum<OrderStatus>("order_status", nameTranslator: new NpgsqlNullNameTranslator());


            modelBuilder.Entity<User>(e =>
            {
                e.ToTable("User");
                e.HasKey(x => x.id);
                e.Property(x => x.id).HasColumnName("user_id");
                e.Property(x => x.name).HasColumnName("name");
                e.Property(x => x.email).HasColumnName("email");
                e.Property(x => x.password).HasColumnName("password");
                e.Property(x => x.role).HasColumnName("role");
            });

            modelBuilder.Entity<Engineer>(e =>
            {
                e.ToTable("Technician");
                e.Property(x => x.id).HasColumnName("technician_id");
                e.Property(x => x.technicianType).HasColumnName("technician_type");
                e.Property(x => x.enabled).HasColumnName("enabled");
            });

            modelBuilder.Entity<Admin>(e =>
            {
                e.ToTable("Administrator");
                e.Property(x => x.id).HasColumnName("administrator_id");
            });

            modelBuilder.Entity<Client>(e =>
            {
                e.ToTable("Client");
                e.Property(x => x.id).HasColumnName("client_id");
                e.Property(x => x.rut).HasColumnName("rut");
                e.Property(x => x.phone).HasColumnName("phone");
            });
            modelBuilder.Entity<RepairOrder>(e =>
            {
                e.ToTable("RepairOrder");
                e.HasKey(x => x.id);
                
                e.Property(x => x.id).HasColumnName("order_id");
                e.Property(x => x.clientId).HasColumnName("client_id");
                e.Property(x => x.orderNumber).HasColumnName("order_number");
                e.Property(x => x.equipmentType).HasColumnName("equipment_type");
                e.Property(x => x.brandModel).HasColumnName("brand_model");
                e.Property(x => x.serialNumber).HasColumnName("serial_number");
                e.Property(x => x.reportedFailure).HasColumnName("reported_failure");
                e.Property(x => x.accessories).HasColumnName("accessories");
                e.Property(x => x.status).HasColumnName("status");
                e.Property(x => x.receivedAt).HasColumnName("recieved_at");

                e.HasOne(x => x.diagnosis).WithOne(d => d.order).HasForeignKey<Diagnosis>(d => d.orderId);
            });
            modelBuilder.Entity<Diagnosis>(e =>
            {
               e.ToTable("Diagnosis");
               e.HasKey(x => x.id);

               e.Property(x => x.id).HasColumnName("diagnosis_id");
               e.Property(x => x.orderId).HasColumnName("order_id");
               e.Property(x => x.technicalDiagnosis).HasColumnName("technical_diagnosis");

               e.Property(x => x.laborCost).HasColumnName("labor_cost").HasPrecision(12,2);
               e.Property(x => x.partsCost).HasColumnName("parts_cost").HasPrecision(12,2);
               e.Property(x => x.totalCost).HasPrecision(12,2); 
            });
            modelBuilder.Entity<OrderLog>(e =>
            {
               e.ToTable("OrderLog");
               e.HasKey(x => x.id);

               e.Property(x => x.id).HasColumnName("log_id");
               e.Property(x => x.orderId).HasColumnName("order_id");
               e.Property(x => x.userId).HasColumnName("user_id");
               e.Property(x => x.status).HasColumnName("status");
               e.Property(x => x.comment).HasColumnName("comment");
               e.Property(x => x.createdAt).HasColumnName("created_at");

               e.HasOne(x => x.order).WithMany().HasForeignKey(x => x.orderId); 
            });    
        }
    }
}