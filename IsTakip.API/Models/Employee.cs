namespace IsTakip.API.Models
{
    public class Employee
    {
        public int Id { get; set; } // Otomatik Primary Key olur
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        // Soft Delete: Çalışan ayrıldığında true → false yapılır, kayıtlar korunur
        public bool IsActive { get; set; } = true;
    }
}