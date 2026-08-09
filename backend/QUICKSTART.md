# 🚀 Guía de Inicio Rápido - VirtualUni SaaS

## Paso 1: Configurar Base de Datos

### Instalar PostgreSQL
```bash
# Windows (con Chocolatey)
choco install postgresql

# macOS (con Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt install postgresql
```

### Crear Base de Datos
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE virtualuni;

# Crear usuario (opcional)
CREATE USER virtualuni_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE virtualuni TO virtualuni_user;

# Salir
\q
```

## Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
```

Configuración mínima para empezar:
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/virtualuni"
JWT_SECRET="cambia-esto-por-un-secreto-seguro"
JWT_REFRESH_SECRET="cambia-esto-por-otro-secreto-seguro"
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Paso 3: Instalar Dependencias

```bash
npm install
```

## Paso 4: Configurar Base de Datos con Prisma

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones (crear tablas)
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la BD
npm run prisma:studio
```

## Paso 5: Iniciar Servidor

```bash
# Modo desarrollo (con hot reload)
npm run start:dev
```

El servidor estará disponible en:
- API: http://localhost:3001/api/v1
- Documentación: http://localhost:3001/api/docs

## 🎯 Primeros Pasos

### 1. Crear tu Primer Tenant

```bash
curl -X POST http://localhost:3001/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Universidad",
    "slug": "mi-uni",
    "adminEmail": "admin@mi-uni.com",
    "adminPassword": "Admin123!",
    "adminFirstName": "Juan",
    "adminLastName": "Pérez",
    "plan": "FREE"
  }'
```

Respuesta (guarda el `id` del tenant):
```json
{
  "id": "tenant-uuid-aqui",
  "name": "Mi Universidad",
  "slug": "mi-uni",
  "plan": "FREE",
  "status": "TRIAL"
}
```

### 2. Iniciar Sesión como Admin

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-uuid-aqui" \
  -d '{
    "email": "admin@mi-uni.com",
    "password": "Admin123!"
  }'
```

Respuesta (guarda el `accessToken`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@mi-uni.com",
    "role": "TENANT_ADMIN"
  }
}
```

### 3. Crear un Estudiante

```bash
curl -X POST http://localhost:3001/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-access-token" \
  -H "X-Tenant-ID: tenant-uuid-aqui" \
  -d '{
    "firstName": "María",
    "lastName": "García",
    "email": "maria@estudiante.com",
    "password": "Student123!",
    "program": "Ingeniería de Sistemas",
    "semester": "2024-1"
  }'
```

### 4. Crear un Docente

```bash
curl -X POST http://localhost:3001/api/v1/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-access-token" \
  -H "X-Tenant-ID: tenant-uuid-aqui" \
  -d '{
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "email": "carlos@profesor.com",
    "password": "Teacher123!",
    "department": "Ingeniería",
    "specialization": "Programación"
  }'
```

### 5. Crear un Curso

```bash
curl -X POST http://localhost:3001/api/v1/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-access-token" \
  -H "X-Tenant-ID: tenant-uuid-aqui" \
  -d '{
    "code": "CS101",
    "name": "Introducción a la Programación",
    "description": "Curso básico de programación",
    "credits": 4,
    "semester": "2024-1",
    "teacherId": "teacher-uuid-aqui"
  }'
```

### 6. Ver Documentación Completa

Abre en tu navegador: http://localhost:3001/api/docs

Aquí encontrarás todos los endpoints disponibles con ejemplos interactivos.

## 🔧 Configuración de Stripe (Opcional)

### 1. Crear Cuenta en Stripe
- Ve a https://stripe.com
- Crea una cuenta de prueba

### 2. Obtener Claves
- Dashboard > Developers > API Keys
- Copia la "Secret key" (empieza con `sk_test_`)

### 3. Crear Productos y Precios
```bash
# En Stripe Dashboard:
# Products > Add Product

# Crear 3 productos:
# - Basic Plan ($29/mes)
# - Professional Plan ($99/mes)
# - Enterprise Plan ($299/mes)

# Copiar los Price IDs (empiezan con price_)
```

### 4. Configurar Webhook
```bash
# Dashboard > Developers > Webhooks > Add Endpoint
# URL: http://localhost:3001/api/v1/billing/webhook
# Eventos a escuchar:
# - checkout.session.completed
# - customer.subscription.updated
# - customer.subscription.deleted
# - invoice.paid
# - invoice.payment_failed

# Copiar el Webhook Secret (empieza con whsec_)
```

### 5. Actualizar .env
```env
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
STRIPE_BASIC_PRICE_ID=price_id_basic
STRIPE_PRO_PRICE_ID=price_id_professional
STRIPE_ENTERPRISE_PRICE_ID=price_id_enterprise
```

### 6. Probar Checkout
```bash
curl -X POST http://localhost:3001/api/v1/billing/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-access-token" \
  -H "X-Tenant-ID: tenant-uuid" \
  -d '{
    "plan": "BASIC",
    "successUrl": "http://localhost:5173/success",
    "cancelUrl": "http://localhost:5173/cancel"
  }'
```

Respuesta:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

Abre el URL en tu navegador para completar el pago de prueba.

## 📱 Testing con Subdominios (Localhost)

Para probar detección de subdominios en localhost:

### Opción 1: Editar hosts file
```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# macOS/Linux: /etc/hosts

# Agregar:
127.0.0.1 mi-uni.localhost
127.0.0.1 otra-uni.localhost
```

Luego puedes acceder:
- http://mi-uni.localhost:3001/api/v1/students
- http://otra-uni.localhost:3001/api/v1/courses

### Opción 2: Usar X-Tenant-ID header
Más simple para desarrollo:
```bash
curl http://localhost:3001/api/v1/students \
  -H "X-Tenant-ID: tenant-uuid-aqui"
```

## 🐛 Troubleshooting

### Error: "Tenant ID is required"
- Asegúrate de enviar el header `X-Tenant-ID` en todas las peticiones
- O usa un subdomain configurado

### Error: "Tenant not found"
- Verifica que el tenant existe: `GET /api/v1/tenants/:id`
- Verifica que el UUID es correcto

### Error: "Student limit reached"
- Has alcanzado el límite del plan FREE (20 estudiantes)
- Actualiza el plan del tenant o borra estudiantes de prueba

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL está corriendo: `pg_isready`
- Verifica el DATABASE_URL en .env
- Verifica usuario/contraseña

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de Stripe](https://stripe.com/docs/api)
- Backend README completo: `./README.md`

## ✅ Checklist de Implementación

- [x] Multi-tenancy con detección de subdomain
- [x] Sistema de planes (FREE, BASIC, PRO, ENTERPRISE)
- [x] Límites por plan (estudiantes, docentes, cursos)
- [x] Guards de validación de límites
- [x] Integración completa con Stripe
- [x] Webhooks de Stripe
- [x] Módulos: Tenants, Students, Teachers, Courses
- [x] Módulos: Assignments, Grades, Messages
- [x] Autenticación JWT multi-tenant
- [x] Documentación Swagger
- [x] Middleware de tenant
- [x] Guards de features por plan

## 🎉 ¡Listo!

Tu backend SaaS multi-tenant está 100% funcional. Ahora puedes:

1. Crear múltiples tenants (universidades/instituciones)
2. Gestionar estudiantes, docentes y cursos por tenant
3. Implementar facturación con Stripe
4. Escalar a miles de tenants

Para más información, revisa `README.md` y la documentación Swagger.
