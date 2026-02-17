using Microsoft.EntityFrameworkCore;
using IsTakip.API.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin()   // Şimdilik herkese izin ver (Test için)
                  .AllowAnyMethod()   // GET, POST, PUT, DELETE hepsine izin ver
                  .AllowAnyHeader();  // Tüm başlıklara izin ver
        });
});

// 1. Controller servisini ekliyoruz (Burası EKSİKTİ)
builder.Services.AddControllers();

// 2. PostgreSQL bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Swagger/OpenAPI ayarları
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. Swagger arayüzünü açıyoruz
// if (app.Environment.IsDevelopment())

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

// 5. Controller'ları haritalıyoruz (Burası EKSİKTİ)
app.MapControllers();

// --- OTOMATİK MIGRATION (BU KISIM YENİ) ---
// Uygulama her başladığında veritabanını kontrol eder ve eksik tablo varsa oluşturur.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();