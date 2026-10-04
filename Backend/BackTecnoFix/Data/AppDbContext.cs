using Microsoft.EntityFrameworkCore;
using TecnoFix.Models;

namespace TecnoFix.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> users => Set<User>();
}