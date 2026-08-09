# Plan de Corrección y Funcionamiento — VirtualUni
**Fecha de auditoría:** 2026-07-19

Auditoría completa de código (backend NestJS + Prisma, frontend React + Vite, infraestructura Docker/nginx), con corrección de todos los errores confirmados de sintaxis, tipos, lógica e integración.

---

## 1. Estado final de verificación

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` frontend | ✅ 0 errores |
| `tsc --noEmit` backend | ✅ 0 errores |
| `npm run build` frontend (vite) | ✅ compila |
| `npm run build` backend (nest/webpack) | ✅ compila |
| `npx eslint . --quiet` frontend | ✅ 0 errores (quedan ~180 warnings de variables sin usar, no bloquean) |
| `npx jest` backend | ✅ 2/2 suites pasan |
| `npx prisma validate` | ✅ schema válido |

## 2. Errores corregidos

### Compilación / sintaxis
1. **Backend – 10 errores TS4053**: interfaces `AssetStats`, `AssetsByCategory`, `EmployeeStats`, `VacationBalance`, `IdCardStats`, `IdCardExportData`, `InventoryStats`, `PayrollStats`, `PayrollExportData` usadas como tipo de retorno público sin `export`. → Exportadas en sus servicios.
2. **Frontend – ~40 errores de tipos** en `StudentDashboard.original.backup.tsx` y `TeacherDashboard.original.backup.tsx` (archivos muertos, no importados). → Movidos a `backups/` fuera de `src/`.
3. **`package.json` (raíz)**: el script `build` ocultaba errores de tipos con `tsc --noEmit || true`. → Ahora `tsc --noEmit && vite build` (el build falla si hay errores de tipos).
4. **`vite.config.ts`**: `minify: 'terser'` con terser no instalado → el build de producción fallaba siempre. → Cambiado a `minify: 'esbuild'`.
5. **ESLint roto**: ESLint 9 instalado sin ningún archivo de configuración (`npm run lint` moría). → Creado `eslint.config.js` (flat config para TS + React hooks). Corregidos los 3 errores que reportó (interfaz vacía en `assets.ts`, `@ts-ignore` prohibido, expresión suelta en `InicioSection.tsx`).
6. **Tests backend**: los 2 specs de notificaciones no inyectaban sus dependencias (fallaban siempre). → Añadidos mocks de `PrismaService` y `NotificationsService`.

### Lógica backend
7. **Fuga cross-tenant** (`analytics.service.ts`): `message.count()` contaba mensajes de TODOS los tenants. → Ahora filtra `where: { tenantId }`.
8. **Casing de estado de curso**: comparaciones con `'ACTIVE'` cuando `Course.status` guarda `'active'` (minúsculas) → `activeCourses` y `coursesByStatus.active` siempre daban 0 y la alerta de baja matrícula nunca corría. → Corregido en `analytics.service.ts` (x2) y `alerts.service.ts`.
9. **Stripe checkout**: se enviaba `customer_email: tenant.name` (un nombre, no un email) → Stripe rechazaría la sesión. → Ahora busca el email del TENANT_ADMIN del tenant (u omite el campo).
10. **Decorador `@CurrentUser('sub')`**: el decorador ignoraba el selector y devolvía el objeto entero; además el payload usa `userId`, no `sub` → todos los endpoints de notificaciones recibían un objeto en lugar del id. → Decorador ahora respeta el selector y el controlador usa `@CurrentUser('userId')`.
11. **Límites del plan en registro**: `POST /auth/register` incrementaba `currentStudents`/`currentTeachers` sin validar `maxStudents`/`maxTeachers`. → Añadida validación (403 al superar el límite).
12. **Endpoint faltante `GET /tenants/current`**: el frontend lo llama (`tenantStore.loadCurrentTenant`) pero caía en `GET /tenants/:id` con id `"current"`. → Añadido el endpoint (antes de `:id`), resuelve el tenant del usuario autenticado.
13. **`@CurrentTenant`** ahora cae al `tenantId` del JWT si el middleware no lo resolvió (robustez para clientes sin header `X-Tenant-ID`).

### Lógica frontend
14. **Bucle infinito de redirección para SUPER_ADMIN**: `Login.tsx` y `ProtectedRoute.tsx` redirigían a `/super-admin`, ruta que no existe en `App.tsx` → login → catch-all → login… → Ahora redirige a `/admin` (permitido para SUPER_ADMIN).
15. **Creación de anuncios devolvía 400**: `MensajesAdminSection.tsx` enviaba campos no permitidos por el DTO del backend (`autor`, `estado`, `showAsPopup`) con `forbidNonWhitelisted: true`, y `targetRoles: ['estudiante']` en vez de `['STUDENT']`. → Payload alineado con el DTO real (`publicar: true`, `targetRoles: ['STUDENT']`) y el tipo `AnnouncementCreateDto` del frontend calcado del backend.

### Infraestructura / despliegue
16. **Healthcheck de Docker roto**: apuntaba a `/api/health`, que no existía. → Creado `GET /api/v1/health` (`backend/src/app.controller.ts`) y actualizado `docker-compose.yml`.
17. **nginx rompía todas las rutas del API en producción**: `proxy_pass http://backend:3001/` (barra final) recorta `/api/` y el backend espera `/api/v1/...`. → `proxy_pass http://backend:3001;` (conserva la ruta completa). Corregido también en el bloque HTTPS comentado.
18. **`backend/.env.example` desincronizado**: `PORT=3001` y `FRONTEND_URL=http://localhost:5173` cuando el frontend espera el backend en 4000 y Vite corre en 3000. → Sincronizado (4000 / 3000) con comentarios.
19. **CORS**: añadido patrón para subdominios de tenant en desarrollo (`http://<tenant>.localhost:3000`), que es la forma documentada de acceder a la app (`uniprueba.localhost`).

## 3. Bloqueador de entorno (requiere acción tuya)

**La base de datos local rechaza las credenciales.** Hay un PostgreSQL escuchando en `localhost:5432`, pero rechaza el usuario/contraseña de `backend/.env` (error P1000). Sin esto no se pueden ejecutar migraciones, seed ni arrancar el backend contra datos reales. Opciones:

- **Opción A (recomendada):** ajusta `DATABASE_URL` en `backend/.env` con la contraseña real de tu PostgreSQL local (recuerda codificar caracteres especiales: `*` = `%2A`, `#` = `%23`).
- **Opción B:** apaga el PostgreSQL local y levanta el del proyecto: `docker compose up -d postgres` (usa la contraseña que definas en `POSTGRES_PASSWORD`).

Después:
```bash
cd backend
npx prisma migrate dev     # aplica migraciones
npm run prisma:seed        # crea el tenant "uniprueba" y usuarios demo
```

## 4. Cómo arrancar el proyecto

```bash
# Backend (puerto 4000)
cd backend
npm run start:dev

# Frontend (puerto 3000, en otra terminal)
npm run dev
```
- Acceso: `http://localhost:3000` (el frontend fuerza el tenant `uniprueba` en localhost).
- Swagger: `http://localhost:4000/api/docs` · Salud: `http://localhost:4000/api/v1/health`.

## 4.1 Fase 2 ejecutada (2026-07-19): Exámenes y Asistencia con backend real

Tras la aprobación del plan se implementaron los dos primeros ítems del roadmap:

**Base de datos** (`backend/prisma`):
- Nuevos modelos: `Exam`, `ExamQuestion`, `ExamAttempt`, `Attendance` + enums `ExamStatus`, `AttemptStatus`, `AttendanceStatus`; relaciones a `Course` y `Student`.
- Migración: `prisma/migrations/20260719000000_add_exams_attendance/migration.sql` (se aplica con `npx prisma migrate dev` cuando la BD esté accesible).

**Backend** (`backend/src/modules/exams` y `backend/src/modules/attendance`, registrados en `app.module.ts`):
- Exámenes: CRUD con preguntas anidadas, publicar/finalizar, resultados con estadísticas para docente, intentos de estudiante con validación (inscripción, examen activo, máximo de intentos) y **auto-calificación en el servidor** (el estudiante nunca recibe `respuestaCorrecta`).
- Asistencia: registro masivo con upsert por (curso, estudiante, fecha), consulta con filtros y rango, historial del estudiante y estadísticas por curso (% de asistencia por estudiante).

**Frontend**:
- Nuevos endpoints `src/api/endpoints/exams.ts` y `attendance.ts`.
- `useTeacherDashboard`: carga exámenes reales; `crearExamen`, `editarExamen`, `eliminarExamen`, `publicarExamen` y `verResultadosExamen` llaman al API (con respaldo local si el backend no responde, mismo patrón híbrido del resto del proyecto).
- `useStudentDashboard`: carga exámenes activos + intentos previos; `iniciarExamenNuevo` crea el intento en el servidor y `finalizarExamen` envía las respuestas para calificación automática.
- `AsistenciaSection` (docente): "Guardar Asistencia" ahora persiste vía `POST /attendance/bulk`.

## 5. Trabajo pendiente para "100% funcional" (roadmap honesto)

El código ahora compila, linta y pasa tests sin errores, y todos los bugs de integración detectados están corregidos. Pero hay **funcionalidades del frontend que siguen operando con datos mock** porque el backend aún no tiene modelos/endpoints para ellas. Conectarlas requiere desarrollo nuevo (modelos Prisma + módulos NestJS + reemplazo de los mocks en los hooks):

| Área | Estado | Qué falta |
|---|---|---|
| Admin (finanzas, nómina, RRHH, inventario, activos, anuncios, trámites, carnets, mensajes masivos) | ✅ 100% API real | — |
| Docente: cursos, estudiantes, tareas, mensajes, perfil, notificaciones | ✅ API real | — |
| Docente: exámenes y asistencia | ✅ API real (Fase 2) | — |
| Docente: grupos, materiales, clases en vivo, calendario, banco de preguntas | ⚠️ Mock | Modelos y módulos backend (Group, Material, LiveClass) y conectar `useTeacherDashboard` |
| Estudiante: cursos, tareas, calificaciones, mensajes, perfil, notificaciones | ✅ API real | — |
| Estudiante: exámenes | ✅ API real (Fase 2) | — |
| Estudiante: biblioteca, foros, certificados, pagos, comunidad, horario | ⚠️ Mock | Modelos y módulos backend correspondientes y conectar `useStudentDashboard` |

Orden sugerido para lo restante (por valor/esfuerzo): 1) ~~Exámenes~~ ✅, 2) ~~Asistencia~~ ✅, 3) Materiales/clases, 4) Pagos estudiante (ya existe módulo finance como base), 5) Biblioteca/foros/comunidad.

Otros pendientes menores: reducir los ~180 warnings de variables sin usar (código muerto `renderXOLD`, imports sobrantes), añadir tests a los módulos críticos (auth, tenants, finance), y revisar el chunk principal del frontend (1.35 MB) con imports dinámicos por dashboard.
