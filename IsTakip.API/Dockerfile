# 1. Aşama: Build (Derleme) - .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala ve restore et
COPY *.csproj ./
RUN dotnet restore

# Tüm kodları kopyala ve yayınla (Publish)
COPY . ./
RUN dotnet publish -c Release -o out

# 2. Aşama: Runtime (BURASI DEĞİŞTİ - SDK KULLANIYORUZ)
FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /app
COPY --from=build /app/out .

# EF Core Aracını Yüklüyoruz (YENİ EKLENDİ)
RUN dotnet tool install --global dotnet-ef
# Aracı çalıştırabilmek için PATH'e ekliyoruz
ENV PATH="$PATH:/root/.dotnet/tools"

# Konteynırın dinleyeceği port
EXPOSE 8080

# Uygulamayı başlat
ENTRYPOINT ["dotnet", "IsTakip.API.dll"]