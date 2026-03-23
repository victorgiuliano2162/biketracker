# Estágio 1 — build da aplicação Angular
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --configuration=production

# Estágio 2 — servir com Nginx
FROM nginx:alpine

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o build do Angular para a pasta pública do Nginx
COPY --from=builder /app/dist/app-front/browser /usr/share/nginx/html

# Config mínima para o roteamento do Angular funcionar
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80