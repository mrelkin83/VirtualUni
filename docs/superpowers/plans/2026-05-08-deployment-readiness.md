# VirtualUni - Plan de Despliegue al 100%

> **Para agentes ejecutores:** Usar `superpowers:subagent-driven-development` o `superpowers:executing-plans`. Los pasos usan checkbox (`- [ ]`) para seguimiento.

**Meta:** Llevar el proyecto de ~65% a 100% funcional en producción, priorizando lo que el usuario ve y toca.

**Arquitectura:** Unificar el frontend para que todas las secciones usen los endpoints reales del backend NestJS. El backend ya está ~90% listo; el gap está casi todo en el frontend.

**Stack:** NestJS + Prisma + PostgreSQL (backend) | React + Vite + Tailwind (frontend) | Docker + Nginx (infra)

---

## Contexto Crítico (NO MODIFICAR)

- Backend: `http://localhost:4000` (NestJS, global prefix `/api/v1`)
- Frontend dev: `http://localhost:3000` (Vite)
- Frontend env: `VITE_API_URL=http://localhost:4000`
- Build: `npm run build` (emite `dist/`)
- Backend build: `cd backend && npm run build`
- Docker Compose: `docker-compose up -d --build`
- Backend ya tiene 17 módulos REALES con Prisma. Ninguno es esqueleto.
- AdminDashboard importa endpoints reales pero **NUNCA los llama**; usa solo mock data.
- `notifications.service.ts` usa axios directo, no `apiClient`. Rompe refresh token.
- No hay manejo de errores HTTP (403, 404, 500) ni retry logic.
- No hay empty states ni loading states consistentes.

---

## Chunk 1: Unificación Crítica (Admin + Notificaciones + Errores)

**Meta:** Que el panel Admin use datos reales del backend y que las notificaciones usen el cliente autenticado correcto.

### Task 1.1: Arreglar `notifications.service.ts`

**Archivos:**
- Modificar: `src/services/notifications.service.ts`

- [ ] **Paso 1: Reemplazar axios directo por `apiClient`**

```typescript
import { apiClient } from '../api/client';

// REEMPLAZAR toda la instancia de axios por apiClient
// Todas las llamadas deben usar apiClient.get/post/patch/delete
// en lugar de axios.create({ baseURL: ... })
```

- [ ] **Paso 2: Verificar que los interceptores de token funcionan**

Ejecutar: `npx tsc --noEmit`
Esperado: Sin errores en `notifications.service.ts`

- [ ] **Paso 3: Commit**

```bash
git add src/services/notifications.service.ts
git commit -m "fix(notifications): use apiClient instead of raw axios"
```

---

### Task 1.2: Conectar AdminDashboard a endpoints reales

**Archivos:**
- Modificar: `src/pages/AdminDashboard.tsx`
- Crear: `src/hooks/useAdminDashboard.ts`

- [ ] **Paso 1: Crear hook `useAdminDashboard.ts`**

Patrón: Copiar estructura de `useStudentDashboard.ts` (useState, useEffect con Promise.allSettled, loading/error states).

Cargar datos reales al montar:
- `financeApi.getAllTransactions()`
- `payrollApi.employees.getAll()`
- `hrApi.employees.getAll()`
- `inventoryApi.items.getAll()`
- `assetsApi.getAll()`
- `announcementsApi.getAll()`
- `massMessagesApi.getAll()`
- `proceduresApi.getAll()`
- `idCardsApi.getAll()`

Cada llamada debe tener try/catch individual para que una falla no rompa las demás.

- [ ] **Paso 2: Reemplazar mock data en AdminDashboard por el hook**

Quitar importaciones de mock data.
Usar `useAdminDashboard()` y pasar los datos reales a cada sección.

- [ ] **Paso 3: Agregar empty states y loading states**

Cada sección debe mostrar:
- Spinner cuando `loading === true`
- "No hay registros" cuando el array está vacío
- Mensaje de error amigable cuando `error !== null`

- [ ] **Paso 4: Verificar build limpio**

Ejecutar: `npm run build`
Esperado: Build exitoso, `dist/` generado

- [ ] **Paso 5: Commit**

```bash
git add src/hooks/useAdminDashboard.ts src/pages/AdminDashboard.tsx
git commit -m "feat(admin): connect dashboard to real backend APIs"
```

---

### Task 1.3: Manejo de errores HTTP en hooks principales

**Archivos:**
- Modificar: `src/hooks/useStudentDashboard.ts`
- Modificar: `src/hooks/useTeacherDashboard.ts`
- Modificar: `src/hooks/useAdminDashboard.ts` (el nuevo)
- Crear: `src/utils/errorHandler.ts`

- [ ] **Paso 1: Crear utilidad `errorHandler.ts`**

```typescript
export const handleApiError = (error: any): { message: string; code: number } => {
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 401: return { message: 'Sesión expirada. Por favor inicia sesión de nuevo.', code: 401 };
      case 403: return { message: 'No tienes permiso para realizar esta acción.', code: 403 };
      case 404: return { message: 'El recurso solicitado no fue encontrado.', code: 404 };
      case 500: return { message: 'Error del servidor. Intenta de nuevo más tarde.', code: 500 };
      default: return { message: error.response.data?.message || 'Error desconocido', code: status };
    }
  }
  if (error.request) {
    return { message: 'No se pudo conectar con el servidor. Verifica tu conexión.', code: 0 };
  }
  return { message: error.message || 'Error inesperado', code: -1 };
};
```

- [ ] **Paso 2: Integrar en los tres hooks**

Reemplazar todos los `catch (err: any) { console.error(...); }` por llamadas a `handleApiError` que actualicen el estado `error` del hook.

- [ ] **Paso 3: Commit**

```bash
git add src/utils/errorHandler.ts src/hooks/useStudentDashboard.ts src/hooks/useTeacherDashboard.ts
git commit -m "feat(error-handling): add HTTP error handler and integrate in all hooks"
```

---

## Chunk 2: Student/Teacher Integración Completa

**Meta:** Que todo lo que un estudiante o docente haga persista en el backend.

### Task 2.1: Calificaciones reales desde backend

**Archivos:**
- Modificar: `src/hooks/useStudentDashboard.ts`
- Modificar: `src/components/student/sections/CalificacionesSection.tsx`

- [ ] **Paso 1: Cargar calificaciones desde `gradesApi`**

En `useStudentDashboard.ts`, agregar al `useEffect` de carga inicial:
```typescript
const gradesData = await gradesApi.getByStudent(userId);
```

- [ ] **Paso 2: Mostrar calificaciones reales**

Reemplazar `calificacionesData` (mock) por el estado que viene del API.

- [ ] **Paso 3: Commit**

```bash
git commit -m "feat(student): connect grades to real backend"
```

---

### Task 2.2: Perfil de usuario desde backend

**Archivos:**
- Modificar: `src/hooks/useStudentDashboard.ts`
- Modificar: `src/components/student/sections/PerfilSection.tsx`
- Modificar: `src/hooks/useTeacherDashboard.ts`
- Modificar: `src/components/teacher/sections/PerfilSection.tsx`

- [ ] **Paso 1: Crear endpoint de perfil en backend (si no existe)**

Verificar si existe `GET /api/v1/auth/me` o similar.
Si no existe, agregar en `auth.controller.ts`:
```typescript
@Get('me')
async getMe(@CurrentUser() user: User) {
  return user;
}
```

- [ ] **Paso 2: Cargar perfil en ambos hooks**

Agregar llamada a `authApi.getCurrentUser()` (o crearla).

- [ ] **Paso 3: Commit**

```bash
git commit -m "feat(profile): load real user profile from backend"
```

---

### Task 2.3: Trámites desde backend (Student + Admin)

**Archivos:**
- Modificar: `src/hooks/useStudentDashboard.ts`
- Modificar: `src/components/student/sections/TramitesSection.tsx`
- Modificar: `src/components/admin/sections/TramitesSection.tsx`

- [ ] **Paso 1: Conectar creación de trámites**

`proceduresApi.create()` ya existe. Usarlo en ambos lados.

- [ ] **Paso 2: Conectar listado de trámites**

Cargar con `proceduresApi.getAll({ solicitanteId: userId })` para estudiantes.
Admin ya lo carga en Chunk 1.

- [ ] **Paso 3: Commit**

```bash
git commit -m "feat(procedures): connect student and admin procedures to backend"
```

---

### Task 2.4: Pagos/Financiero (Student)

**Archivos:**
- Modificar: `src/hooks/useStudentDashboard.ts`
- Modificar: `src/components/student/sections/FinancieroSection.tsx`

- [ ] **Paso 1: Evaluar si backend tiene pagos para estudiantes**

Revisar si existe `GET /api/v1/finance/student/:id` o similar.
Si NO existe, usar `financeApi.getAllTransactions({ estudiante: userName })` como filtro.

- [ ] **Paso 2: Cargar historial de pagos**

Reemplazar `historialPagos` mock por datos del API.

- [ ] **Paso 3: Commit**

```bash
git commit -m "feat(finance): connect student payments to backend"
```

---

## Chunk 3: Testing + Notificaciones en Tiempo Real + DevOps

### Task 3.1: Tests unitarios mínimos

**Archivos:**
- Crear: `src/hooks/__tests__/useAuth.test.ts`
- Crear: `src/api/__tests__/client.test.ts`

- [ ] **Paso 1: Configurar vitest (si no está)**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Paso 2: Test de login**

Probar que `authApi.login` guarda tokens en localStorage.

- [ ] **Paso 3: Test de apiClient**

Probar que 401 dispara refresh token.

- [ ] **Paso 4: Commit**

```bash
git commit -m "test(auth): add login and apiClient tests"
```

---

### Task 3.2: Notificaciones en tiempo real (WebSockets)

**Archivos:**
- Modificar: `backend/src/notifications/notifications.gateway.ts` (si existe)
- Modificar: `src/services/notifications.service.ts`

- [ ] **Paso 1: Verificar si backend tiene WebSocket gateway**

Buscar `@WebSocketGateway` en `backend/src/`.

- [ ] **Paso 2: Si existe, conectar frontend**

Usar `socket.io-client` para escuchar eventos de notificación.

- [ ] **Paso 3: Si NO existe, usar polling**

Agregar `setInterval` cada 30s que llame `notificationsService.getUnreadCount()`.

- [ ] **Paso 4: Commit**

```bash
git commit -m "feat(notifications): add real-time updates via websocket/polling"
```

---

### Task 3.3: HTTPS + SSL configurado

**Archivos:**
- Modificar: `docker-compose.yml`
- Modificar: `nginx.conf`
- Crear: `scripts/setup-ssl.sh`

- [ ] **Paso 1: Activar secciones comentadas de HTTPS en nginx.conf**

Descomentar el bloque `server { listen 443 ssl http2; ... }`.

- [ ] **Paso 2: Activar certbot en docker-compose.yml**

Descomentar el servicio `certbot`.

- [ ] **Paso 3: Crear script de setup SSL**

```bash
#!/bin/bash
# scripts/setup-ssl.sh
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d $1
```

- [ ] **Paso 4: Commit**

```bash
git commit -m "ops(ssl): enable HTTPS with Let's Encrypt"
```

---

### Task 3.4: Health checks y monitoreo

**Archivos:**
- Modificar: `backend/src/app.module.ts`
- Crear: `backend/src/health/health.controller.ts`

- [ ] **Paso 1: Instalar @nestjs/terminus**

```bash
cd backend && npm install @nestjs/terminus
```

- [ ] **Paso 2: Crear health controller**

```typescript
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
```

- [ ] **Paso 3: Commit**

```bash
git commit -m "ops(health): add NestJS health checks"
```

---

## Chunk 4: Pagos + Polish Final

### Task 4.1: Integración de pagos (Stripe/MercadoPago)

**Archivos:**
- Modificar: `backend/src/finance/finance.service.ts`
- Modificar: `src/components/student/sections/FinancieroSection.tsx`

- [ ] **Paso 1: Evaluar si se necesita pagos reales**

Si el MVP no requiere pagos, agregar botón "Próximamente" y saltar este chunk.

- [ ] **Paso 2: Si sí se necesita, integrar Stripe**

Backend: crear `POST /api/v1/finance/payments` con Stripe SDK.
Frontend: usar `@stripe/stripe-js` para Checkout.

- [ ] **Paso 3: Commit**

```bash
git commit -m "feat(payments): add Stripe integration"
```

---

### Task 4.2: Revisión final de tipos TypeScript

**Archivos:**
- Todo `src/`

- [ ] **Paso 1: Ejecutar tsc estricto**

```bash
npx tsc --noEmit --strict
```

- [ ] **Paso 2: Corregir errores restantes (excluyendo backups)**

- [ ] **Paso 3: Commit**

```bash
git commit -m "refactor(types): fix all TypeScript strict errors"
```

---

### Task 4.3: Build final y despliegue

- [ ] **Paso 1: Frontend build**

```bash
npm run build
```
Verificar que `dist/` tenga `index.html` y `assets/`.

- [ ] **Paso 2: Backend build**

```bash
cd backend && npm run build
```

- [ ] **Paso 3: Docker Compose up**

```bash
docker-compose up -d --build
```

- [ ] **Paso 4: Verificar servicios**

```bash
curl http://localhost/api/health
curl http://localhost/api/v1/auth/health
```

Esperado: `200 OK`

- [ ] **Paso 5: Tag de release**

```bash
git tag -a v1.0.0 -m "Production release v1.0.0"
```

---

## Priorización por Impacto

| Chunk | Impacto Usuario | Esfuerzo | Prioridad |
|---|---|---|---|
| 1.1 (Notifications fix) | Alto | 30 min | P0 - Bloqueante |
| 1.2 (Admin real data) | Alto | 3-4h | P0 - Demo crítica |
| 1.3 (Error handling) | Medio | 1h | P1 |
| 2.1 (Calificaciones) | Alto | 1h | P0 |
| 2.2 (Perfil) | Medio | 1h | P1 |
| 2.3 (Trámites) | Medio | 1h | P1 |
| 2.4 (Pagos student) | Medio | 1h | P2 |
| 3.1 (Tests) | Medio | 2h | P2 |
| 3.2 (Notificaciones RT) | Bajo-Medio | 2h | P2 |
| 3.3 (HTTPS) | Alto | 30 min | P0 - Producción |
| 3.4 (Health checks) | Bajo | 30 min | P2 |
| 4.1 (Stripe) | Alto | 4h | P2 - Solo si se necesita |
| 4.2 (Types) | Medio | 1h | P1 |
| 4.3 (Despliegue) | Alto | 30 min | P0 |

**Tiempo estimado total:** 2-3 días de trabajo concentrado (P0 + P1) + 1 día extra para P2.

---

## Archivos que NO deben tocarse

- `*.backup.tsx` (códigos de respaldo)
- `*.original.*` (versiones originales)
- `backend/prisma/schema.prisma` (ya está completo)
- `backend/src/` módulos que ya están auditados como REALES (solo tocar si se agregan endpoints nuevos como `/auth/me`)

---

## Comandos de verificación rápida (para cada chunk)

```bash
# Después de cada chunk:
npm run build                    # Frontend build limpio
cd backend && npm run build      # Backend build limpio
npx tsc --noEmit                 # Sin errores TS
```
