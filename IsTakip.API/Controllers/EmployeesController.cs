using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsTakip.API.Data;
using IsTakip.API.Models;

namespace IsTakip.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Employees (Aktif çalışanları getir, ?includeInactive=true ile hepsini getir)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees([FromQuery] bool includeInactive = false)
        {
            if (includeInactive)
                return await _context.Employees.ToListAsync();

            return await _context.Employees.Where(e => e.IsActive).ToListAsync();
        }

        // GET: api/Employees/5 (ID'ye göre tek çalışan getir)
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            return employee;
        }

        // POST: api/Employees (Yeni çalışan ekle)
        [HttpPost]
        public async Task<ActionResult<Employee>> PostEmployee(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEmployee", new { id = employee.Id }, employee);
        }

        // PUT: api/Employees/5 (Çalışan güncelle)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmployee(int id, Employee employee)
        {
            if (id != employee.Id)
            {
                return BadRequest();
            }

            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Employees.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Employees/5 (Soft Delete — Çalışanı pasif yap, WorkLog'lar korunsun)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            // Soft delete: DB'den silme, sadece pasif yap
            employee.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
