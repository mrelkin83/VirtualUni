# Plan de Trabajo: Conectar Frontend al Backend Real

> **Para agentes:** Usar superpowers:subagent-driven-development para ejecutar este plan. Pasos usar sintaxis checkbox (`- [ ]`) para seguimiento.

**Goal:** Conectar el frontend React existente al backend NestJS real, remplazando datos mock por datos del API, para que la aplicación funcione completamente.

**Architecture:** Establecer la cadena completa: PostgreSQL → Prisma → NestJS API → React Client → Usuario final.

**Tech Stack:**
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: React + Vite + TailwindCSS + Zustand
- APIs: REST con JWT + Multi-tenancy

---

## Resumen Ejecutivo

El proyecto tiene ~70% de avance. El backend NestJS tiene 127 endpoints funcionando, pero la base de datos no está conectada y el frontend usa datos mock. Este plan conecta todo para tener una aplicación fully funcional.

**Horas estimadas:** 15-25 horas de trabajo
**Dependencias críticas:** PostgreSQL instalado, Node.js 18+

---

## TAREAS PRIORITARIAS

### [CRÍTICO] FASE 1: Configurar Base de Datos PostgreSQL

**Archivos relacionados:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/.env`
- Create: `backend/.env.example`

- [ ] **Step 1: Verificar instalación de PostgreSQL**

Verificar que PostgreSQL esté instalado y corriendo:
```bash
# Windows
Get-Service | Where-Object {$_.Name -like "*postgres*"}
# Linux/Mac
pg_isready
```

Si no está instalado, instalar PostgreSQL 14+ (instrucciones según SO).

- [ ] **Step 2: Crear base de datos para el proyecto**

```sql
CREATE DATABASE virtualuni;
-- Crear usuario específico (recomendado)
CREATE USER virtualuni_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE virtualuni TO virtualuni_user;
```

- [ ] **Step 3: Crear archivo .env con configuración**

Crear `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://virtualuni_user:tu_password_seguro@localhost:5432/virtualuni?schema=public"

# JWT
JWT_SECRET="super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe (opcional para desarrollo)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# App
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 4: Verificar schema de Prisma**

Revisar que `backend/prisma/schema.prisma` tenga el provider correcto:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- [ ] **Step 5: Ejecutar migraciones de Prisma**

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Expected: "Migration ... applied successfully"

**SI HAY ERRORES:** Verificar credenciales en .env y que PostgreSQL esté corriendo.

---

### [CRÍTICO] FASE 2: Iniciar y Probar Backend

**Archivos relacionados:**
- Modify: `backend/src/main.ts`
- Test: `backend/src/modules/auth/auth.controller.ts`

- [ ] **Step 1: Instalar dependencias del backend**

```bash
cd backend
npm install
```

- [ ] **Step 2: Compilar el backend**

```bash
cd backend
npm run build
```

Expected: "Build compiled successfully!" o al menos sin errores críticos.

- [ ] **Step 3: Iniciar el servidor backend**

```bash
cd backend
npm run start:dev
```

El servidor debe correr en http://localhost:3001

- [ ] **Step 4: Probar endpoint de salud**

En otra terminal:
```bash
curl http://localhost:3001
# o verificar en navegador
```

Expected: Respuesta del servidor (puede ser 404 o JSON de health)

- [ ] **Step 5: Probar endpoint de autenticación**

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-tenant" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

Expected: JSON con token o error 401 (significa que el endpoint funciona)

**SI HAY ERRORES:** Revisar logs del servidor, verificar configuración CORS en main.ts.

---

### [CRÍTICO] FASE 3: Configurar Datos Iniciales (Seed)

**Archivos relacionados:**
- Modify: `backend/prisma/seed.ts`
- Execute: `npm run prisma:seed`

- [ ] **Step 1: Revisar seed.ts actual**

Leer `backend/prisma/seed.ts` para ver qué datos crea.

- [ ] **Step 2: Ejecutar seed**

```bash
cd backend
npm run prisma:seed
```

Expected: "Seed completed successfully" y datos en la base de datos.

- [ ] **Step 3: Verificar datos en base de datos**

```bash
# Usando Prisma Studio
npm run prisma:studio
```

Esto abre una interfaz web para ver los datos.

- [ ] **Step 4: Crear tenant de prueba si no existe**

El sistema es multi-tenant. Necesitas al menos un tenant para probar:
- nombre: "Universidad de Prueba"
- subdomain: "test"
- plan: FREE

---

### [CRÍTICO] FASE 4: Conectar Frontend

**Archivos relacionados:**
- Modify: `src/config/api.config.ts`
- Modify: `src/pages/Login.tsx`
- Test: `src/components/admin/sections/ActivosSection.tsx`

- [ ] **Step 1: Verificar configuración del API client**

Revisar que `src/config/api.config.ts` apunte al backend correcto:
```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  // ...
};
```

- [ ] **Step 2: Iniciar servidor de desarrollo frontend**

```bash
npm run dev
```

Debe correr en http://localhost:3000

- [ ] **Step 3: Probar login con datos reales**

1. Ir a http://localhost:3000/login
2. Usar credenciales del seed (admin@test.com / password123)
3. Verificar que redirige al dashboard

**SI NO FUNCIONA:**
- Revisar consola del navegador (F12 → Console)
- Verificar que backend esté corriendo en puerto 3001
- Revisar ошибки de CORS en red

- [ ] **Step 4: Verificar que los datos se cargan del API**

En el dashboard admin:
1. Ir a sección "Activos"
2. Abrir DevTools → Network
3. Verificar que hay requests a `/api/v1/assets`
4. Ver que los datos vienen del servidor, no de mock

- [ ] **Step 5: Probar otros módulos**

Verificar que funcionan:
- [ ] Estudiantes
- [ ] Docentes
- [ ] Cursos
- [ ] Tareas
- [ ] Inventario
- [ ] Nómina

---

### FASE 5: Testing y Validación

**Objetivo:** Verificar que toda la aplicación funciona correctamente.

- [ ] **Step 1: Testing de flujos principales**

- [ ] Login y logout funciona
- [ ] Navegación entre secciones carga datos
- [ ] CRUD completo en módulos admin
- [ ] Crear/editar/eliminar estudiantes
- [ ] Crear/editar/eliminar cursos
- [ ] Matricular estudiantes

- [ ] **Step 2: Verificar multi-tenancy**

Crear un segundo tenant y verificar aislamiento de datos.

- [ ] **Step 3: Probar panel de estudiante**

1. Login como estudiante
2. Ver cursos matriculados
3. Ver tareas
4. Ver calificaciones

- [ ] **Step 4: Probar panel de docente**

1. Login como docente
2. Ver cursos asignados
3. Crear tarea
4. Ver estudiantes

- [ ] **Step 5: Verificar persistencia de datos**

Recargar la página y verificar que los datos se mantienen.

---

### FASE 6: Limpieza y Documentación

**Objetivo:** Dejar el proyecto listo para uso producción (desarrollo).

- [ ] **Step 1: Eliminar datos mock no usados**

Los archivos en `src/data/*.ts` pueden conservarse como fallback pero ya no se usarán primary.

- [ ] **Step 2: Actualizar documentación**

Actualizar `docs/ESTADO_DESARROLLO.md` con el nuevo estado.

- [ ] **Step 3: Crear guía de inicio rápido**

Crear `QUICKSTART.md` con:
- Cómo iniciar PostgreSQL
- Cómo ejecutar migraciones
- Cómo iniciar backend
- Cómo iniciar frontend
- Credenciales de prueba

---

## Notas Importantes

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Can't reach database" | PostgreSQL no corriendo | Iniciar servicio de PostgreSQL |
| "Authentication failed" | Credenciales incorrectas | Verificar .env |
| "CORS error" | Frontend no puede comunicar con backend | Verificar CORS en main.ts |
| "401 Unauthorized" | Token no válido o expirado | Login de nuevo |
| "Tenant not found" | No existe tenant | Ejecutar seed |

### Archivos Clave a Revisar

- `backend/src/main.ts` - Configuración del servidor
- `backend/src/app.module.ts` - Módulos registrados
- `src/api/client.ts` - Configuración del cliente HTTP
- `src/store/authStore.ts` - Estado de autenticación
- `src/config/api.config.ts` - URLs y configuración

---

## Checklist de Completado

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas
- [ ] Seed de datos ejecutado
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Login funcional con datos reales
- [ ] Módulos admin mostrando datos del API
- [ ] Panel de estudiante funcional
- [ ] Panel de docente funcional
- [ ] Datos persistentes (recargar no pierde datos)

---

## Próximos Pasos (Post-Conexión)

Una vez completada la conexión, el proyecto estará ~90% listo. Quedará:

1. Testing exhaustivo
2.部署 a producción
3. WebSockets para notificaciones en tiempo real (opcional)
4. Tests unitarios completos

---

**Plan creado:** 7 de Mayo 2026
**Archivo:** docs/superpowers/plans/2026-05-07-conectar-frontend-backend.md

¿Procedemos con la ejecución del plan?