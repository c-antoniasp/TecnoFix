using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> users => Set<User>();

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
    }
}
