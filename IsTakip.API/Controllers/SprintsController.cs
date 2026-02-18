using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsTakip.API.Data;
using IsTakip.API.Models;

namespace IsTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SprintsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SprintsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sprint>>> GetSprints()
        {
            return await _context.Sprints.OrderByDescending(s => s.StartDate).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Sprint>> PostSprint(Sprint sprint)
        {
            // --- TARİH ÇAKIŞMA KONTROLÜ (YENİ EKLENEN KISIM) ---

            // Veritabanında tarihleri çakışan başka bir sprint var mı?
            // Mantık: (Mevcut.Bitiş >= Yeni.Başlangıç) VE (Mevcut.Başlangıç <= Yeni.Bitiş)
            var cakismanSprint = await _context.Sprints
                .Where(s => s.EndDate >= sprint.StartDate && s.StartDate <= sprint.EndDate)
                .FirstOrDefaultAsync();

            if (cakismanSprint != null)
            {
                return BadRequest($"Hata: Bu tarihler '{cakismanSprint.Name}' isimli sprint ile çakışıyor! ({cakismanSprint.StartDate:dd.MM.yyyy} - {cakismanSprint.EndDate:dd.MM.yyyy})");
            }
            // ----------------------------------------------------

            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSprint", new { id = sprint.Id }, sprint);
        }

        // Aktif sprinti getiren özel bir endpoint
        [HttpGet("active")]
        public async Task<ActionResult<Sprint>> GetActiveSprint()
        {
            var today = DateTime.UtcNow; // UTC kullanmak daha güvenlidir
            var activeSprint = await _context.Sprints
                .FirstOrDefaultAsync(s => s.StartDate <= today && s.EndDate >= today);

            if (activeSprint == null) return NotFound("Şu an aktif bir sprint yok.");

            return activeSprint;
        }
    }
}