# VirtualUni — Plataforma Educativa SaaS Multi-Tenant

Plataforma educativa virtual con paneles de **Estudiante**, **Docente** y **Administrador**, arquitectura multi-tenant (aislamiento de datos por institución) y más de 20 módulos funcionales.

> 📖 Documentación completa en [`docs/`](docs/README.md) · Estado actual y plan: [`docs/PLAN_CORRECCION_2026-07-19.md`](docs/PLAN_CORRECCION_2026-07-19.md)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite 6 + Tailwind CSS (puerto **3000**) |
| Backend | NestJS 10 + Prisma 5 (puerto **4000**, prefijo `api/v1`) |
| Base de datos | PostgreSQL 15 |
| Cache (opcional) | Redis 7 |
| Despliegue | Docker Compose + nginx |

## Estructura del proyecto

```
VirtualUni-main/
├── src/                  # Frontend React
│   ├── api/endpoints/    # Clientes HTTP por módulo (calcados de los DTOs del backend)
│   ├── components/       # Componentes por rol: admin/, teacher/, student/
│   ├── hooks/            # useAdminDashboard, useTeacherDashboard, useStudentDashboard
│   ├── pages/            # Login, StudentDashboard, TeacherDashboard, AdminDashboard
│   └── store/            # Zustand (authStore, tenantStore)
├── backend/
│   ├── src/modules/      # 27 módulos NestJS (auth, tenants, courses, exams, attendance, ...)
│   ├── src/common/       # Guards, decoradores, middleware de tenant, Prisma
│   └── prisma/           # schema.prisma, migrations/, seed.ts
├── docs/                 # Documentación del proyecto
├── docker-compose.yml    # postgres + backend + nginx
└── nginx.conf            # Proxy /api → backend, SPA fallback
```

## Puesta en marcha (desarrollo)

### 1. Requisitos
- Node.js 18+
- PostgreSQL 15 corriendo en `localhost:5432` (o `docker compose up -d postgres`)

### 2. Backend

```bash
cd backend
npm install
# Edita .env: DATABASE_URL con tus credenciales reales de PostgreSQL
# (caracteres especiales codificados: * = %2A, # = %23)
npx prisma migrate dev      # aplica las migraciones
npm run prisma:seed         # crea tenant demo "uniprueba" + usuarios
npm run start:dev           # API en http://localhost:4000
```

- Swagger: http://localhost:4000/api/docs
- Salud: http://localhost:4000/api/v1/health

### 3. Frontend

```bash
npm install
npm run dev                 # http://localhost:3000
```

En `localhost` el frontend usa automáticamente el tenant demo `uniprueba` (`src/utils/tenantDetection.ts`).

### 4. Credenciales demo (creadas por el seed)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@uniprueba.com` | `Admin123!` |
| Docente | `profesor1@uniprueba.com` … `profesor6@uniprueba.com` | `Profesor123!` |
| Estudiante | `estudiante@uniprueba.com` … `estudiante25@uniprueba.com` | `Estudiante123!` |

## Comandos de verificación

| Comando | Dónde | Qué hace |
|---|---|---|
| `npx tsc --noEmit` | raíz y `backend/` | Chequeo de tipos |
| `npm run build` | raíz | Build de producción del frontend (falla si hay errores de tipos) |
| `npm run build` | `backend/` | Build de producción del backend |
| `npx eslint . --quiet` | raíz | Solo errores de lint |
| `npm test` | `backend/` | Tests unitarios (Jest) |
| `npx prisma validate` | `backend/` | Valida el schema |

## Multi-tenancy (resumen)

- Cada request lleva el header `X-Tenant-ID` (lo inyecta `src/api/client.ts` desde localStorage tras el login) o se resuelve por subdominio (`uniprueba.localhost`).
- `TenantMiddleware` adjunta `tenantId` al request; los guards (`JwtAuthGuard`, `TenantGuard`, `RolesGuard`) validan sesión, tenant y rol.
- **Todas** las consultas Prisma filtran por `tenantId`.
- Roles: `SUPER_ADMIN`, `TENANT_ADMIN` (→ `/admin`), `TEACHER` (→ `/docente`), `STUDENT` (→ `/estudiante`).

## Reglas para contribuir

1. El `ValidationPipe` global usa `forbidNonWhitelisted: true`: cualquier campo extra en un request devuelve **400**. Los tipos de `src/api/endpoints/*.ts` deben calcarse de los DTOs de `backend/src/modules/*/dto/`.
2. En controladores NestJS, declara las rutas estáticas (`stats`, `my`, `bulk`, …) **antes** de las rutas con parámetro (`:id`).
3. Los hooks de docente/estudiante siguen un patrón híbrido: intentan el API y caen a datos mock si el backend no responde (ver `docs/PLAN_CORRECCION_2026-07-19.md` §5 para saber qué secciones ya son 100% API).
4. Nuevos modelos de datos: agrega el modelo a `schema.prisma`, la migración SQL en `prisma/migrations/`, y ejecuta `npx prisma generate`.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/README.md`](docs/README.md) | Descripción general y características |
| [`docs/PLAN_CORRECCION_2026-07-19.md`](docs/PLAN_CORRECCION_2026-07-19.md) | Auditoría, correcciones aplicadas y roadmap |
| [`docs/API_EXAMENES_ASISTENCIA.md`](docs/API_EXAMENES_ASISTENCIA.md) | Referencia de API de exámenes y asistencia |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Despliegue con Docker/nginx |
| [`docs/ADMIN_MODULES_DOCUMENTATION.md`](docs/ADMIN_MODULES_DOCUMENTATION.md) | Módulos administrativos |
# VirtualUni
