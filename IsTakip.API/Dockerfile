# 1. Aşama: Build (Derleme) - .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala ve restore et
COPY *.csproj ./
RUN dotnet restore

# Tüm kodları kopyala ve yayınla (Publish)
COPY . ./
RUN dotnet publish -c Release -o out

# 2. Aşama: Runtime (daha hafif)
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# Konteynırın dinleyeceği port
EXPOSE 8080

# Uygulamayı başlat
ENTRYPOINT ["dotnet", "IsTakip.API.dll"]