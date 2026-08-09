# Configuración VPS — Univirtual Producción

> **Proveedor:** Contabo  
> **Estado:** Configurado en plan, pendiente acceso para deploy  
> **Fecha de inicio:** 2025-05-12

---

## Especificaciones del Hardware

| Recurso | Valor |
|---------|-------|
| CPU | 4 vCPU Cores |
| RAM | 8 GB |
| Storage | 75 GB NVMe (o 150 GB SSD) |
| Snapshot | 1 Snapshot |
| Puerto de red | 200 Mbit/s |
| Sistema Operativo | Ubuntu 22.04 LTS (recomendado) |

---

## Datos de Acceso (Completar)

| Campo | Valor | Estado |
|-------|-------|--------|
| IP Pública del VPS | `___PENDIENTE___` | Pendiente |
| Dominio principal | `___PENDIENTE___` | Pendiente |
| Subdominio API (opcional) | `api.dominio.com` | Pendiente |
| Usuario SSH | `root` o `ubuntu` | Pendiente |
| Puerto SSH | `22` | Por defecto |
| Email para Let's Encrypt | `___PENDIENTE___` | Pendiente |
| Clave SSH pública local | `~/.ssh/id_rsa.pub` | Verificar existencia |

---

## Stack a Desplegar

| Servicio | Contenedor/Puerto | Recursos estimados |
|----------|-------------------|-------------------|
| PostgreSQL 16 | `db:5432` | 1-2 GB RAM |
| Redis 7 | `redis:6379` | 256-512 MB RAM |
| NestJS Backend | `backend:4000` | 1-2 GB RAM |
| Nginx + React Frontend | `frontend:80/443` | 256-512 MB RAM |
| **Total estimado** | — | **~3-5 GB RAM** |

> Margen disponible: ~3-5 GB RAM para picos de tráfico y builds.

---

## Configuración Inicial del VPS (Checklist)

### 1. Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker y Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y
```

### 3. Configurar swap (4 GB)
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. Configurar firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 5. Configurar timezone
```bash
sudo timedatectl set-timezone America/Bogota  # Ajustar según ubicación
```

---

## Variables de Entorno de Producción

Archivo: `/opt/univirtual/.env`

```bash
# === BASE DE DATOS ===
DATABASE_URL=postgresql://univirtual:STRONG_PASSWORD@db:5432/univirtual?schema=public

# === JWT & SEGURIDAD ===
JWT_SECRET=GENERATE_STRONG_SECRET_64_CHARS_MINIMUM
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d
BCRYPT_ROUNDS=12

# === FRONTEND ===
VITE_API_URL=https://api.tudominio.com  # o /api si es mismo dominio

# === STRIPE (si aplica) ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# === REDIS ===
REDIS_URL=redis://redis:6379

# === MULTI-TENANCY ===
DEFAULT_TENANT_SLUG=demo

# === BACKEND ===
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://tudominio.com
```

> ⚠️ **IMPORTANTE:** Generar contraseñas fuertes antes del primer deploy. Nunca commitear este archivo.

---

## Estructura de Archivos en VPS

```
/opt/univirtual/
├── docker-compose.yml
├── .env
├── scripts/
│   ├── deploy.sh
│   └── init-ssl.sh
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   └── dist/
├── frontend/
│   └── dist/  (servido por Nginx)
└── nginx/
    └── nginx.conf
```

---

## Comandos de Operación Diaria

### Ver logs
```bash
cd /opt/univirtual
sudo docker compose logs -f backend   # Logs del backend
sudo docker compose logs -f db        # Logs de PostgreSQL
sudo docker compose ps                # Estado de contenedores
```

### Reiniciar servicios
```bash
sudo docker compose restart backend
sudo docker compose restart frontend
```

### Backup manual de base de datos
```bash
sudo docker compose exec db pg_dump -U univirtual univirtual > backup_$(date +%F).sql
```

### Restaurar backup
```bash
sudo docker compose exec -T db psql -U univirtual univirtual < backup_YYYY-MM-DD.sql
```

### Actualizar deploy
```bash
cd /opt/univirtual
./scripts/deploy.sh
```

---

## SSL / HTTPS

### Let's Encrypt (Certbot)
```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com
```

### Renovación automática (cron)
```bash
sudo crontab -e
# Agregar:
0 3 * * * certbot renew --quiet && docker compose restart frontend
```

---

## Monitoreo Básico

### Uso de recursos
```bash
htop                    # Procesos y RAM
df -h                   # Disco
docker system df        # Uso de Docker
```

### Health checks
```bash
curl -f https://tudominio.com/api/health || echo "ALERTA: Backend caído"
curl -f https://tudominio.com || echo "ALERTA: Frontend caído"
```

---

## Notas

- **Snapshot:** Crear snapshot manual en Contabo antes del primer deploy y antes de actualizaciones grandes.
- **Seguridad:** Cambiar puerto SSH si es posible. Deshabilitar login root si se usa usuario no-root.
- **Backups:** Programar backup automático de PostgreSQL diario a S3 o almacenamiento externo.

---

**Última actualización:** 2025-05-11  
**Próxima acción:** Completar datos de acceso e iniciar deploy mañana.
