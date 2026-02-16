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
            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetSprints", new { id = sprint.Id }, sprint);
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