# Stage 1: Build
FROM registry.access.redhat.com/ubi9/nodejs-24 AS build
WORKDIR /opt/app-root/src
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM registry.access.redhat.com/ubi9/nginx-126
COPY --from=build --chown=1001:0 /opt/app-root/src/dist/job-application-tracker-frontend/browser/ /opt/app-root/src/
COPY spa.conf /opt/app-root/etc/nginx.default.d/spa.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
