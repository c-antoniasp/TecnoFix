using Microsoft.EntityFrameworkCore;
using BackTecnoFix.Models;

namespace BackTecnoFix.Data;

/// <summary>
/// Contexto de Entity Framework Core para la aplicación TecnoFix.
/// Mapea las tablas existentes en PostgreSQL (Neon) a entidades de C#.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Conjuntos de datos existentes
    public DbSet<User> users => Set<User>();
    public DbSet<Administrator> administrators => Set<Administrator>();
    public DbSet<Client> clients => Set<Client>();
    public DbSet<Technician> technicians => Set<Technician>();

    // Conjunto de datos para el catálogo de tipos de equipo (ADM-001)
    public DbSet<EquipmentType> equipmentTypes => Set<EquipmentType>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Mapeo de la tabla "EquipmentType" (sensible a mayúsculas en PostgreSQL)
        modelBuilder.Entity<EquipmentType>(e =>
        {
            e.ToTable("EquipmentType");
            e.HasKey(x => x.id);
            e.Property(x => x.id).HasColumnName("equipment_type_id");
            e.Property(x => x.name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(x => x.description).HasColumnName("description").HasMaxLength(255);
            e.Property(x => x.enabled).HasColumnName("enabled").IsRequired();
            e.HasIndex(x => x.name).IsUnique();
        });
    }
}
