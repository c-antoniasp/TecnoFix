using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> users => Set<User>();
    public DbSet<Administrator> administrators => Set<Administrator>();
    public DbSet<Client> clients => Set<Client>();
    public DbSet<Technician> technicians => Set<Technician>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        modelBuilder.Entity<Administrator>(e =>
        {
            e.ToTable("Administrator");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("administrator_id");
            e.Property(x => x.userId).HasColumnName("user_id");
            e.HasOne(x => x.user).WithOne().HasForeignKey<Administrator>(x => x.userId);
        });

        modelBuilder.Entity<Client>(e =>
        {
            e.ToTable("Client");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("client_id");
            e.Property(x => x.userId).HasColumnName("user_id");
            e.Property(x => x.rut).HasColumnName("rut");
            e.Property(x => x.phone).HasColumnName("phone");
            e.HasOne(x => x.user).WithOne().HasForeignKey<Client>(x => x.userId);
        });

        modelBuilder.Entity<Technician>(e =>
        {
            e.ToTable("Technician");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("technician_id");
            e.Property(x => x.userId).HasColumnName("user_id");
            e.Property(x => x.technicianType).HasColumnName("technician_type");
            e.Property(x => x.enabled).HasColumnName("enabled");
            e.HasOne(x => x.user).WithOne().HasForeignKey<Technician>(x => x.userId);
        });
    }
}
