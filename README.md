## **Çalışanların verimliliğini takip edip arttırabileceği bir uygulama.**

Çalıştırmak için:

!!PostgreSQL veritabanı kullanır bağlantıyı appsetings.json dosyasından ayarlamanız gerekmektedir.

Backend:

    cd ./IsTakıp.API
    dotnet restore
    dotnet tool install --global dotnet-ef        (yüklü değilse bu satırı çalıştır)
    dotnet ef database update
    dotnet run

Frontend:

    cd ./IsTakip.UI
    npm install
    npm run dev
