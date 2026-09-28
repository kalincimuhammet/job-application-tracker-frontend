# 1. Build-Phase: Nutzt ein garantiertes, brandaktuelles Node 22 Image
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# 2. Runtime-Phase: Liefert die fertige SPA über einen schlanken Webserver aus
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /app/dist/bewerbungs/browser /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]