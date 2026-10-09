# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# URL del backend, horneada en el bundle en tiempo de build (Vite sustituye
# import.meta.env.* al compilar; no se puede cambiar despues sin reconstruir).
#
# Vacio por defecto = mismo origen, que es la topologia de este compose: el
# nginx de esta misma imagen hace proxy de /api/ hacia el backend, y las rutas
# de src/api/endpoints/ ya incluyen el prefijo /api/v1. Solo hay que pasar un
# valor si el backend vive en otro dominio, y entonces debe ser el ORIGEN
# (https://api.ejemplo.com), sin /api/v1.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx config
#
# nginx.conf es un bloque `server { ... }`, no una configuración principal: no
# tiene `events` ni `http`. Copiarlo como /etc/nginx/nginx.conf hacía que nginx
# abortara al arrancar con "no events section in configuration", asi que esta
# imagen nunca podia levantarse. Va en conf.d, que es donde docker-compose ya lo
# monta correctamente.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
