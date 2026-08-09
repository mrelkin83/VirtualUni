# Guía de Despliegue - VirtualUni Platform

Esta guía explica cómo desplegar VirtualUni en producción usando Docker y Docker Compose.

---

## 📋 Requisitos Previos

### Hardware Mínimo
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 20 GB SSD
- **Red**: Conexión estable a internet

### Hardware Recomendado (Producción)
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Disco**: 50+ GB SSD
- **Red**: Conexión de alta velocidad

### Software
- **Sistema Operativo**: Linux (Ubuntu 20.04+ recomendado) o Windows con WSL2
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+

---

## 🚀 Despliegue Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/your-org/virtualuni.git
cd virtualuni
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivos de ejemplo
cp .env.example .env
cp backend/.env.example backend/.env

# Editar con tus valores
nano .env
nano backend/.env
```

**Importante**: Cambia TODAS las contraseñas y secretos por valores seguros.

### 3. Ejecutar Script de Setup

```bash
chmod +x scripts/setup.sh
sudo ./scripts/setup.sh
```

Selecciona opción 2 (Production).

### 4. Iniciar los Servicios

```bash
docker-compose up -d
```

### 5. Ejecutar Migraciones

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 6. (Opcional) Seed de Datos

```bash
docker-compose exec backend npx prisma db seed
```

### 7. Verificar Servicios

```bash
docker-compose ps
```

Todos los servicios deben estar `Up` y `healthy`.

---

## 🔧 Configuración Detallada

### Variables de Entorno Críticas

#### `.env` (Raíz del proyecto)

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu-contraseña-segura
POSTGRES_DB=virtualuni
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=tu-contraseña-redis-segura
REDIS_PORT=6379

# Puertos de aplicación
BACKEND_PORT=3001
FRONTEND_PORT=80
```

#### `backend/.env`

```env
# Database
DATABASE_URL="postgresql://postgres:tu-contraseña@postgres:5432/virtualuni?schema=public"

# JWT (mínimo 32 caracteres)
JWT_SECRET="tu-secret-jwt-muy-largo-y-seguro-de-al-menos-32-caracteres"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="tu-refresh-secret-muy-largo-y-seguro-de-al-menos-32-caracteres"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com

# Stripe
STRIPE_SECRET_KEY=sk_live_tu_clave_live
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
STRIPE_BASIC_PRICE_ID=price_id_basico
STRIPE_PRO_PRICE_ID=price_id_pro
STRIPE_ENTERPRISE_PRICE_ID=price_id_enterprise

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=tu-contraseña-redis-segura
```

---

## 🌐 Configuración de Dominio

### Usando un Dominio Personalizado

#### 1. Configurar DNS

Apunta tu dominio a la IP del servidor:

```
Tipo: A
Nombre: @
Valor: tu.ip.del.servidor

Tipo: A
Nombre: www
Valor: tu.ip.del.servidor
```

#### 2. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

#### 3. Actualizar Nginx

Edita `nginx.conf` y agrega:

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # ... resto de la configuración
}
```

#### 4. Reiniciar

```bash
docker-compose restart frontend
```

---

## 🔐 Seguridad

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Usar contraseñas fuertes (mínimo 16 caracteres)
- [ ] Configurar JWT_SECRET único y largo (32+ caracteres)
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar firewall (UFW en Ubuntu)
- [ ] Actualizar regularmente las dependencias
- [ ] Habilitar fail2ban para protección contra ataques
- [ ] Configurar backups automáticos
- [ ] Limitar acceso a Prisma Studio (solo herramientas internas)

### Configurar Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar estado
sudo ufw status
```

---

## 📊 Monitoreo

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo database
docker-compose logs -f postgres
```

### Verificar Estado de Servicios

```bash
docker-compose ps
```

### Health Checks

```bash
# Frontend
curl http://localhost:80/health

# Backend
curl http://localhost:3001/api/health
```

---

## 💾 Backups

### Crear Backup Manual

```bash
chmod +x scripts/backup.sh
sudo ./scripts/backup.sh
```

Los backups se guardan en `./backups/` con formato:
`virtualuni_backup_YYYYMMDD_HHMMSS.sql.gz`

### Restaurar Backup

```bash
chmod +x scripts/restore.sh
sudo ./scripts/restore.sh
```

### Backups Automáticos con Cron

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * /path/to/virtualuni/scripts/backup.sh
```

---

## 🔄 Actualizaciones

### Actualizar a Nueva Versión

```bash
# Detener servicios
docker-compose down

# Hacer backup
./scripts/backup.sh

# Actualizar código
git pull origin main

# Reconstruir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Verificar
docker-compose ps
```

---

## 🐛 Solución de Problemas

### Problema: Contenedor no inicia

```bash
# Ver logs del contenedor
docker-compose logs nombre_servicio

# Reiniciar contenedor específico
docker-compose restart nombre_servicio
```

### Problema: Base de datos no conecta

```bash
# Verificar que postgres esté corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres

# Verificar conexión
docker-compose exec backend npx prisma studio
```

### Problema: Frontend no carga

```bash
# Ver logs de nginx
docker-compose logs frontend

# Verificar archivos build
docker-compose exec frontend ls -la /usr/share/nginx/html
```

### Problema: Memoria insuficiente

```bash
# Aumentar límites en docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

---

## 📈 Optimización de Producción

### 1. Configurar Redis Cache

Redis ya está incluido en docker-compose.yml. El backend lo usa automáticamente.

### 2. Configurar CDN (Opcional)

Para mejor rendimiento, usa CloudFlare o similar:
- Servir assets estáticos
- Protección DDoS
- SSL automático

### 3. Scaling Horizontal

Para múltiples instancias del backend:

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### 4. Load Balancer

Usa Nginx como load balancer para múltiples backends:

```nginx
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

---

## 🌍 Despliegue en Cloud Providers

### AWS (EC2)

1. Lanzar instancia Ubuntu 20.04+
2. Configurar Security Groups (puertos 80, 443, 22)
3. Seguir pasos de "Despliegue Rápido"
4. Configurar Elastic IP
5. Usar RDS para PostgreSQL (recomendado para producción)

### Google Cloud Platform (GCP)

1. Crear VM en Compute Engine
2. Configurar firewall rules
3. Seguir pasos de "Despliegue Rápido"
4. Usar Cloud SQL para PostgreSQL (recomendado)

### DigitalOcean

1. Crear Droplet Ubuntu 20.04+
2. Configurar firewall
3. Seguir pasos de "Despliegue Rápido"
4. Usar Managed PostgreSQL Database (opcional)

### Heroku (No recomendado para esta app)

Esta aplicación usa Docker Compose con múltiples servicios. Para Heroku necesitarías:
- Separar servicios
- Usar Heroku Postgres
- Configurar Redis addon

---

## 📞 Soporte

Para problemas o preguntas:
- Revisar logs: `docker-compose logs -f`
- Verificar documentación: `README.md`
- Abrir issue en GitHub

---

## ✅ Checklist de Despliegue

- [ ] Servidor configurado (CPU, RAM, Disco)
- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Contraseñas cambiadas
- [ ] Dominio configurado (opcional)
- [ ] SSL/HTTPS configurado (recomendado)
- [ ] Firewall configurado
- [ ] Servicios iniciados con docker-compose
- [ ] Migraciones ejecutadas
- [ ] Base de datos seeded (opcional)
- [ ] Health checks pasando
- [ ] Backups automáticos configurados
- [ ] Monitoreo configurado

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0
