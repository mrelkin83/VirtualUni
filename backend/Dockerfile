# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production
#
# Node 22, no 18: @nestjs/schedule v6 usa el `crypto` GLOBAL
# (crypto.randomUUID en scheduler.orchestrator), que solo existe a partir de
# Node 19. Con node:18-alpine el backend arrancaba y moria en el onModuleInit
# de ScheduleExplorer con "ReferenceError: crypto is not defined", en bucle de
# reinicio (medido en el VPS de produccion). Ademas Node 18 esta fuera de
# soporte desde abril de 2025, los workflows de .github usan Node 22 y el
# package.json de la raiz declara "node": ">=22.22.2".
FROM node:22-alpine

WORKDIR /app

# OpenSSL para el engine de Prisma.
#
# node:18-alpine es hoy Alpine 3.21, que trae solo libssl.so.3 y NO incluye el
# CLI de openssl. Sin ese CLI `prisma generate` no detecta la version, cae al
# valor por defecto "openssl-1.1.x" y genera
# libquery_engine-linux-musl.so.node, que enlaza contra libssl.so.1.1 -
# ausente en la imagen. El contenedor arrancaba, mapeaba todas las rutas y
# moria en el onModuleInit de PrismaService con "Error loading shared library
# libssl.so.1.1", quedando en bucle de reinicio (medido en el VPS de
# produccion). Con openssl instalado detecta 3.0.x y genera el engine correcto,
# libquery_engine-linux-musl-openssl-3.0.x.so.node.
RUN apk add --no-cache openssl

# Install production dependencies only.
#
# `prisma` (la CLI) es ahora una dependencia de producción, no de desarrollo, asi
# que npm ci --only=production la instala. Antes quedaba fuera y tanto este
# `prisma generate` como el `prisma migrate deploy` del despliegue dependian de
# que npx la bajara de la red en cada ejecucion, dentro de un contenedor que
# corre como usuario sin privilegios. Ahora el binario esta en node_modules.
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Directorio de archivos subidos.
#
# Tiene que existir en la imagen y pertenecer a nestjs ANTES del chown: cuando
# docker-compose monta el volumen con nombre sobre una ruta que no existe en la
# imagen, crea el punto de montaje como root, y este contenedor corre como
# usuario sin privilegios. El mkdirSync de uploads.service.ts fallaria con
# EACCES y ninguna subida funcionaria. Creandolo aqui, el volumen hereda esta
# pertenencia al inicializarse.
RUN mkdir -p /app/uploads

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check.
#
# La ruta real lleva el prefijo global api/v1: /api/health devuelve 404 (medido),
# asi que el healthcheck anterior marcaba la imagen como unhealthy para siempre y
# un orquestador la reiniciaria en bucle. docker-compose.yml ya usa la ruta
# correcta; esta imagen, construida por si sola, no.
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["node", "dist/main.js"]
