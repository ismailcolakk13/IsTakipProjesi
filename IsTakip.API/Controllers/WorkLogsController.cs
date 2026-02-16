using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsTakip.API.Data;
using IsTakip.API.Models;

namespace IsTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkLogsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Belirli bir tarih aralığındaki tüm kayıtları getir (Sprint için)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkLog>>> GetWorkLogs(DateTime start, DateTime end)
        {
            // Tarihleri UTC'ye çevirip karşılaştıralım ki saat farkı sorunu olmasın
            return await _context.WorkLogs
                .Where(w => w.Date >= start && w.Date <= end)
                .ToListAsync();
        }

        // 2. Efor Gir veya Güncelle (Upsert Mantığı)
        [HttpPost]
        public async Task<ActionResult> SaveWorkLog(WorkLog log)
        {
            // Tarihin saat kısmını sıfırla (Sadece gün önemli)
            var logDate = log.Date.Date; 
            log.Date = DateTime.SpecifyKind(logDate, DateTimeKind.Utc);

            // Bu kişi, bu tarihte daha önce efor girmiş mi?
            var existingLog = await _context.WorkLogs
                .FirstOrDefaultAsync(w => w.EmployeeId == log.EmployeeId && w.Date == log.Date);

            if (existingLog != null)
            {
                // Varsa güncelle
                existingLog.Hours = log.Hours;
                existingLog.Description = log.Description;
            }
            else
            {
                // Yoksa yeni ekle
                _context.WorkLogs.Add(log);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}