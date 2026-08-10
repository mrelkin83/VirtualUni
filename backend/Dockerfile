# Stage 1: Build
FROM node:18-alpine AS builder

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
FROM node:18-alpine

WORKDIR /app

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
