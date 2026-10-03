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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresEnum<UserRole>("user_role", nameTranslator: new NpgsqlNullNameTranslator());

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
        }
    }
}