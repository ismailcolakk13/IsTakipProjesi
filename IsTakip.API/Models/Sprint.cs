namespace IsTakip.API.Models
{
    public class Sprint
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Örn: "Sprint 24"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Bu sprintin aktif olup olmadığını basitçe anlayalım
        public bool IsActive => DateTime.Now >= StartDate && DateTime.Now <= EndDate;
    }
}