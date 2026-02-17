## **Çalışanların Verimliliğini Takip Edip Arttırabileceği Bir Uygulama.**
Sprintler oluşturulabilir. Çalışanlar bu sprintlerde sağladıkları katkıları saat olarak ekleyebilir. Bu sayede kişilerin katkıları rahatlıkla gözlemlenebilir.



.NET(10.0) ile backend, ReactJS ile frontend yazılmıştır. Veritabanı olarak PostgreSQL kullanmaktadır.

### Docker ile Çalıştırmak için (önerilir)

    docker-compose up --build

### Localde Çalıştırmak için

**!!PostgreSQL veritabanı kullanır bağlantıyı appsetings.json dosyasından ayarlamanız gerekmektedir**.

#### Backend

    cd ./IsTakip.API
    dotnet restore
    dotnet tool install --global dotnet-ef        (yüklü değilse bu satırı çalıştır)
    dotnet ef database update
    dotnet run

#### Frontend

    cd ./IsTakip.UI
    npm install
    npm run dev

### Erişim
- Çalıştırdıktan sonra <localhost:5173> adresinden bağlanabilirsiniz.
- Backendde swagger yüklü api kontrolü için <localhost:5090/swagger> adresine gidin