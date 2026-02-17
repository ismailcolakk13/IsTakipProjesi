# 1. Aşama: Build (Node 25 kullanarak derle)
FROM node:25-alpine AS build
WORKDIR /app

# Paketleri yükle
COPY package.json package-lock.json ./
RUN npm install

# Kodları kopyala ve derle
COPY . .
RUN npm run build

# 2. Aşama: Serve (Nginx ile yayınla)
FROM nginx:alpine
# Build aşamasından çıkan dosyaları Nginx'in içine at
COPY --from=build /app/dist /usr/share/nginx/html

# React Router ayarı (Sayfa yenileyince hata vermemesi için)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]