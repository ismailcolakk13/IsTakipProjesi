using Microsoft.EntityFrameworkCore;
using IsTakip.API.Models;

namespace IsTakip.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Veritabanında "Employees" adında bir tablo oluşacak
        public DbSet<Employee> Employees { get; set; }

        public DbSet<Sprint> Sprints { get; set; }
        public DbSet<WorkLog> WorkLogs { get; set; }
    }
}