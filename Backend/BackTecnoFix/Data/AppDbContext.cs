using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Admin>();
        modelBuilder.Entity<Engineer>();
        modelBuilder.Entity<Client>();
    }
}
