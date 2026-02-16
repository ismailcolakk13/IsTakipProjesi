using System.ComponentModel.DataAnnotations.Schema;

namespace IsTakip.API.Models
{
    public class WorkLog
    {
        public int Id { get; set; }
        
        // Hangi çalışan?
        public int EmployeeId { get; set; }
        
        // Hangi görev/açıklama?
        public string Description { get; set; } = string.Empty;
        
        // Kaç saat çalıştı?
        public decimal Hours { get; set; }
        
        // Hangi gün?
        public DateTime Date { get; set; }

        // İlişkiler (Navigation Properties)
        // Bu log hangi çalışana ait?
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
    }
}