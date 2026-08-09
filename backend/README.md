# VirtualUni Backend - Multi-Tenant SaaS Platform

Backend API completo para plataforma educativa multi-tenant con arquitectura SaaS.

## 🚀 Características Implementadas

### ✅ Multi-Tenancy Completo
- **Detección automática de tenant** por subdomain, custom domain o header
- **Aislamiento de datos** por tenant usando Prisma
- **Middleware de tenant** que detecta y valida el tenant en cada request
- **Guards de seguridad** para validar acceso por tenant

### ✅ Sistema de Planes y Límites
- **4 planes disponibles**: FREE, BASIC, PROFESSIONAL, ENTERPRISE
- **Límites por plan**:
  - Estudiantes (20 a ilimitado)
  - Docentes (2 a ilimitado)
  - Cursos (5 a ilimitado)
  - Almacenamiento (1GB a 500GB)
- **Features por plan**:
  - Mensajería
  - Videoconferencia
  - Pagos
  - Certificados

### ✅ Facturación con Stripe
- **Checkout sessions** para suscripciones
- **Webhooks** para eventos de pago
- **Gestión de suscripciones** (activar, cancelar, actualizar)
- **Historial de facturas** por tenant

### ✅ Gestión Completa
- **Tenants**: CRUD completo, estadísticas de uso
- **Usuarios**: Estudiantes, Docentes, Administradores
- **Cursos**: Creación, matriculación, gestión
- **Tareas**: Creación, envío, calificación
- **Calificaciones**: Por estudiante, por curso, promedios
- **Mensajería**: Inbox, sent, no leídos

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── common/
│   │   ├── decorators/          # Decoradores personalizados
│   │   │   ├── current-tenant.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/              # Guards de seguridad
│   │   │   ├── tenant.guard.ts         # Valida tenant activo
│   │   │   ├── jwt-auth.guard.ts       # Autenticación JWT
│   │   │   ├── roles.guard.ts          # Validación de roles
│   │   │   ├── resource-limit.guard.ts # Límites por plan
│   │   │   └── feature.guard.ts        # Features por plan
│   │   ├── middleware/          # Middleware
│   │   │   └── tenant.middleware.ts    # Detección de tenant
│   │   └── prisma/              # Configuración Prisma
│   │
│   ├── modules/
│   │   ├── tenants/             # Gestión de tenants
│   │   │   ├── tenants.service.ts
│   │   │   ├── tenants.controller.ts
│   │   │   ├── tenants.module.ts
│   │   │   └── dto/
│   │   │       ├── create-tenant.dto.ts
│   │   │       └── update-tenant.dto.ts
│   │   │
│   │   ├── students/            # Gestión de estudiantes
│   │   ├── teachers/            # Gestión de docentes
│   │   ├── courses/             # Gestión de cursos
│   │   ├── assignments/         # Gestión de tareas
│   │   ├── grades/              # Gestión de calificaciones
│   │   ├── messages/            # Sistema de mensajería
│   │   ├── billing/             # Facturación y suscripciones
│   │   ├── auth/                # Autenticación
│   │   └── users/               # Gestión de usuarios
│   │
│   ├── app.module.ts            # Módulo principal
│   └── main.ts                  # Punto de entrada
│
├── prisma/
│   └── schema.prisma            # Schema de base de datos
│
└── .env.example                 # Variables de entorno

```

## 🔧 Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/virtualuni"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
PORT=3001
FRONTEND_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### 2. Instalación

```bash
npm install
```

### 3. Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Opcional: Seed de datos
npm run prisma:seed
```

### 4. Iniciar Servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación API

Swagger disponible en: `http://localhost:3001/api/docs`

## 🔐 Autenticación Multi-Tenant

Todas las peticiones (excepto auth y webhooks) requieren:

1. **Token JWT** en header `Authorization: Bearer {token}`
2. **Tenant ID** mediante una de estas opciones:
   - Header `X-Tenant-ID: {tenant-uuid}`
   - Subdomain: `{tenant-slug}.domain.com`
   - Custom domain: `custom-domain.com`

## 🎯 Endpoints Principales

### Tenants
- `POST /api/v1/tenants` - Crear nuevo tenant (público)
- `GET /api/v1/tenants` - Listar tenants (super admin)
- `GET /api/v1/tenants/:id` - Ver tenant
- `GET /api/v1/tenants/:id/usage` - Estadísticas de uso
- `PATCH /api/v1/tenants/:id` - Actualizar tenant
- `DELETE /api/v1/tenants/:id` - Eliminar tenant

### Students
- `POST /api/v1/students` - Crear estudiante
- `GET /api/v1/students` - Listar estudiantes
- `GET /api/v1/students/:id` - Ver estudiante
- `GET /api/v1/students/:id/stats` - Estadísticas del estudiante
- `PATCH /api/v1/students/:id` - Actualizar estudiante
- `DELETE /api/v1/students/:id` - Eliminar estudiante

### Teachers
- `POST /api/v1/teachers` - Crear docente
- `GET /api/v1/teachers` - Listar docentes
- `GET /api/v1/teachers/:id/stats` - Estadísticas del docente

### Courses
- `POST /api/v1/courses` - Crear curso
- `GET /api/v1/courses` - Listar cursos
- `POST /api/v1/courses/:id/enroll` - Matricular estudiante
- `GET /api/v1/courses/:id/stats` - Estadísticas del curso

### Billing
- `GET /api/v1/billing/plans` - Ver planes disponibles
- `POST /api/v1/billing/checkout` - Crear sesión de pago
- `GET /api/v1/billing/subscription` - Ver suscripción actual
- `POST /api/v1/billing/subscription/cancel` - Cancelar suscripción
- `POST /api/v1/billing/webhook` - Webhook de Stripe

## 🛡️ Guards y Middleware

### TenantMiddleware
Detecta automáticamente el tenant en cada request:
1. Verifica header `X-Tenant-ID`
2. Extrae subdomain del host
3. Verifica custom domain
4. Adjunta `tenantId` al request

### TenantGuard
Valida que el tenant existe y está activo:
- Verifica estado (no SUSPENDED ni CANCELLED)
- Adjunta objeto `tenant` completo al request

### ResourceLimitGuard
Valida límites del plan antes de crear recursos:
```typescript
@Post()
@UseGuards(ResourceLimitGuard)
@ResourceLimit('students')
create() { ... }
```

### FeatureGuard
Valida que una característica está habilitada:
```typescript
@Post()
@UseGuards(FeatureGuard)
@RequireFeature('videoConf')
startVideoCall() { ... }
```

## 🔄 Webhooks de Stripe

Configura en Stripe Dashboard:
- URL: `https://tu-dominio.com/api/v1/billing/webhook`
- Eventos:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

## 📊 Límites por Plan

| Recurso      | FREE | BASIC | PROFESSIONAL | ENTERPRISE |
|--------------|------|-------|--------------|------------|
| Estudiantes  | 20   | 100   | 500          | Ilimitado  |
| Docentes     | 2    | 10    | 50           | Ilimitado  |
| Cursos       | 5    | 20    | 100          | Ilimitado  |
| Almacenamiento| 1GB  | 10GB  | 50GB         | 500GB      |
| Mensajería   | ✅   | ✅    | ✅           | ✅         |
| Videoconf    | ❌   | ✅    | ✅           | ✅         |
| Pagos        | ❌   | ❌    | ✅           | ✅         |
| Certificados | ❌   | ✅    | ✅           | ✅         |

## 🚀 Despliegue

### Variables de Entorno en Producción
- Configura `DATABASE_URL` con tu base de datos PostgreSQL
- Usa secretos seguros para `JWT_SECRET` y `JWT_REFRESH_SECRET`
- Configura claves de Stripe en modo producción
- Actualiza `FRONTEND_URL` con tu dominio real

### Stripe
1. Crea productos y precios en Stripe Dashboard
2. Copia los Price IDs a las variables de entorno
3. Configura webhook endpoint en producción
4. Copia el webhook secret

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

MIT

---

**VirtualUni Backend** - Plataforma SaaS Multi-Tenant para Educación
