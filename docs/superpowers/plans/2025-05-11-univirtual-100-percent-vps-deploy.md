# Univirtual - Plan Maestro de Implementación al 100% y Despliegue VPS

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Llevar el proyecto Univirtual desde ~40% de funcionalidad hasta un sistema 100% operativo, integrado frontend-backend, con tests, calidad de producción y desplegado en un VPS.

**Architecture:** Stack SaaS Multi-Tenant (React 18 + Vite + NestJS + Prisma + PostgreSQL). Se prioriza estabilizar build/tests, conectar mocks a APIs reales, refactorizar el monolito admin y preparar Docker + Nginx para VPS.

**Tech Stack:** React 18, Vite 6, TypeScript 5, Tailwind CSS, Zustand, React Hook Form, NestJS 10, Prisma 5, PostgreSQL, Docker, Nginx, Stripe, Redis.

**Timeline estimado:** 8-10 semanas (1 desarrollador full-time) o 4-5 semanas con ejecución paralela por subagentes.

**Definición de "100%":**
- Backend: API REST completa, tests pasando, Swagger documentado.
- Frontend: Build de producción exitoso, sin mocks en módulos core, integrado 100% con backend.
- Admin: Refactorizado en componentes modulares con persistencia real.
- QA: Tests unitarios backend al 70%+ coverage, linting limpio, TypeScript sin errores.
- DevOps: Docker Compose funcionando, Nginx configurado, SSL, desplegado en VPS con CI/CD básico.

---

## Chunk 0: Fase de Emergencia — Build y Tests (Semana 1)

Objetivo: El proyecto debe compilar, testearse y correr en local sin errores críticos.

### Task 0.1: Corregir Build del Frontend

**Files:**
- Modify: `package.json` (script build)
- Modify: `vite.config.ts` (minify)
- Create: `.env.production` (si no existe configurado)

- [ ] **Step 1: Instalar dependencia faltante `terser`**

Run:
```bash
cd C:\VirtualUni-main
npm install -D terser
```
Expected: `terser` aparece en `devDependencies`.

- [ ] **Step 2: Corregir script de build cross-platform**

Modify `package.json` line 9:
```json
"build": "tsc --noEmit && vite build"
```
(Quitar `|| true` que rompe en Windows y deja pasar errores de TS silenciosamente.)

- [ ] **Step 3: Desactivar minify problemático temporalmente si persiste**

Modify `vite.config.ts` line 11:
```ts
minify: true, // o 'esbuild' en vez de 'terser' si hay conflictos
```
Si `terser` funciona, dejar `minify: 'terser'`.

- [ ] **Step 4: Ejecutar build limpio**

Run:
```bash
npm run build
```
Expected: Build exitoso, carpeta `dist/` generada sin errores.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts package-lock.json
git commit -m "fix(build): instalar terser y corregir script build cross-platform"
```

---

### Task 0.2: Eliminar Archivos Basura que Rompen TypeScript

**Files:**
- Delete: `src/pages/StudentDashboard.original.backup.tsx`
- Delete: `src/pages/TeacherDashboard.original.backup.tsx`
- Modify: `tsconfig.json` (si hay include que los tome)

- [ ] **Step 1: Eliminar archivos backup**

Run:
```bash
Remove-Item -Path "src\pages\StudentDashboard.original.backup.tsx"
Remove-Item -Path "src\pages\TeacherDashboard.original.backup.tsx"
```

- [ ] **Step 2: Verificar que `tsconfig.json` solo incluya `src`**

Read `tsconfig.json`. Confirmar `"include": ["src"]`.

- [ ] **Step 3: Re-ejecutar build**

Run:
```bash
npm run build
```
Expected: Build exitoso, 0 errores de TypeScript.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: eliminar archivos backup que rompian compilacion TS"
```

---

### Task 0.3: Corregir Tests del Backend

**Files:**
- Modify: `backend/src/modules/notifications/notifications.service.spec.ts`
- Modify: `backend/src/modules/notifications/notifications.controller.spec.ts`
- Search y modificar todos los `*.spec.ts` que falten `PrismaService` import.

- [ ] **Step 1: Revisar todos los archivos de test que fallan**

Run:
```bash
cd backend
npm test 2>&1 | grep "FAIL"
```
Expected: Lista de tests fallidos por falta de providers.

- [ ] **Step 2: Crear/Patch los test modules para importar dependencias**

Para cada test que falle, modificar el `beforeEach` para incluir providers. Ejemplo para notifications:

Modify `backend/src/modules/notifications/notifications.service.spec.ts`:
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../common/prisma/prisma.service'; // ajustar path

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

Repetir para `notifications.controller.spec.ts` y cualquier otro spec que falle.

- [ ] **Step 3: Ejecutar tests**

Run:
```bash
cd backend
npm test
```
Expected: Todos los tests pasan o al menos no fallan por "can't resolve dependencies".

- [ ] **Step 4: Commit**

```bash
git add backend/src/**/*.spec.ts
git commit -m "fix(tests): mock PrismaService en tests unitarios para resolver dependencias"
```

---

### Task 0.4: Validar Entorno de Desarrollo Completo

- [ ] **Step 1: Levantar backend en dev**

Run:
```bash
cd backend
npm run start:dev
```
En otra terminal, verificar:
```bash
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/health" -Method GET
```
(o el endpoint de health que exista; si no existe, crear uno simple en `AppModule` o verificar Swagger en `/api/docs`)

- [ ] **Step 2: Levantar frontend en dev**

Run:
```bash
cd C:\VirtualUni-main
npm run dev
```
Verificar que cargue `http://localhost:3000/login` sin errores de compilación en consola.

- [ ] **Step 3: Checkpoint de Fase 0**

Crear tag:
```bash
git tag -a v0.1-stable-build -m "Fase 0 completada: build y tests estables"
```

---

## Chunk 1: Backend Core al 100% (Semanas 1-2)

Objetivo: Todas las APIs core deben estar implementadas, documentadas en Swagger y testeadas.

### Task 1.1: Audit APIs Implementadas vs Schema

**Files:**
- Review: `backend/src/modules/*`
- Create: `docs/api-status.md`

- [ ] **Step 1: Listar todos los módulos del backend**

Run:
```bash
Get-ChildItem -Path "backend\src\modules" -Directory | Select-Object Name
```

- [ ] **Step 2: Mapear cada módulo contra los modelos de Prisma**

Revisar `backend/prisma/schema.prisma` y verificar que cada modelo tenga:
- Controller REST (CRUD completo o al menos endpoints esenciales)
- Service con lógica de negocio
- DTOs con class-validator

- [ ] **Step 3: Documentar gaps en `docs/api-status.md`**

Formato:
```markdown
## API Status
| Módulo | Modelo | Controller | Service | DTOs | Tests | Status |
|--------|--------|------------|---------|------|-------|--------|
| auth | User | ✅ | ✅ | ✅ | ❌ | Needs tests |
| courses | Course | ✅ | ? | ? | ❌ | Needs DTOs |
| ... | ... | ... | ... | ... | ... | ... |
```

---

### Task 1.2: Completar CRUDs Faltantes de Módulos Core

Módulos core: `auth`, `users`, `students`, `teachers`, `courses`, `assignments`, `grades`, `enrollments`, `messages`, `notifications`.

**Files:** Varios en `backend/src/modules/`

- [ ] **Step 1: Verificar que cada módulo core tenga Controller completo**

Cada controller debe tener:
- `@Get()` — listar (con paginación/query params)
- `@Get(':id')` — obtener uno
- `@Post()` — crear
- `@Put(':id')` / `@Patch(':id')` — actualizar
- `@Delete(':id')` — eliminar (soft delete si aplica)

- [ ] **Step 2: Verificar Services con manejo de errores HTTP**

Cada service debe usar `NotFoundException`, `BadRequestException`, etc. de `@nestjs/common`.

- [ ] **Step 3: Verificar DTOs con class-validator**

Ejemplo para CreateCourseDto:
```ts
import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  credits?: number;

  @IsUUID()
  teacherId: string;
}
```

- [ ] **Step 4: Ejecutar tests y build del backend**

Run:
```bash
cd backend
npm run build
npm test
```
Expected: Build OK. Tests pasan.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/ backend/prisma/ docs/api-status.md
git commit -m "feat(backend): completar CRUDs core con DTOs y validaciones"
```

---

### Task 1.3: Implementar Multi-Tenancy en APIs

El schema tiene `tenantId` en casi todos los modelos. Verificar que los controllers/services filtren por `X-Tenant-ID`.

**Files:**
- Modify: `backend/src/common/interceptors/` o guards existentes
- Modify: `backend/src/modules/*/service.ts`

- [ ] **Step 1: Verificar que `PrismaService` o un interceptor inyecte `tenantId`**

Buscar uso de `X-Tenant-ID` en el backend:
```bash
cd backend; Select-String -Path "src/**/*.ts" -Pattern "X-Tenant-ID"
```

- [ ] **Step 2: Si no existe interceptor de tenant, crearlo**

Create `backend/src/common/interceptors/tenant.interceptor.ts`:
```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];
    if (tenantId) {
      request.tenantId = tenantId;
    }
    return next.handle();
  }
}
```

Registrar en `AppModule`.

- [ ] **Step 3: Actualizar services core para filtrar por tenantId**

Ejemplo en CoursesService:
```ts
async findAll(tenantId: string) {
  return this.prisma.course.findMany({ where: { tenantId } });
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/common/interceptors/ backend/src/modules/**/\*.service.ts
git commit -m "feat(backend): implementar filtrado por tenantId en APIs core"
```

---

### Task 1.4: Documentación Swagger y Health Check

**Files:**
- Modify: `backend/src/main.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Verificar configuración Swagger existente**

Read `backend/src/main.ts`. Confirmar que existe:
```ts
const config = new DocumentBuilder()
  .setTitle('Univirtual API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

- [ ] **Step 2: Crear endpoint de health check**

Create `backend/src/modules/health/health.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```
Importar en `AppModule`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/modules/health/ backend/src/main.ts
git commit -m "feat(backend): agregar health check y verificar swagger"
```

---

## Chunk 2: Frontend Core — Integración Real con Backend (Semanas 2-4)

Objetivo: Reemplazar TODOS los datos mock de los módulos core por llamadas reales a la API.

### Task 2.1: Crear Capa de Servicios API Completa

**Files:**
- Review: `src/api/endpoints/`
- Create/Modify: `src/api/endpoints/student.ts`, `src/api/endpoints/teacher.ts`, `src/api/endpoints/admin.ts`
- Modify: `src/api/client.ts` (ya existe y está bien)

- [ ] **Step 1: Auditar endpoints existentes**

Leer todos los archivos en `src/api/endpoints/` y `src/services/`.

- [ ] **Step 2: Crear servicios para cada módulo core**

Ejemplo para `src/api/endpoints/courses.ts`:
```ts
import { apiClient } from '../client';

export const coursesApi = {
  getAll: () => apiClient.get('/api/v1/courses'),
  getById: (id: string) => apiClient.get(`/api/v1/courses/${id}`),
  create: (data: any) => apiClient.post('/api/v1/courses', data),
  update: (id: string, data: any) => apiClient.put(`/api/v1/courses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/courses/${id}`),
};
```
Replicar para: assignments, grades, messages, notifications, enrollments.

- [ ] **Step 3: Commit**

```bash
git add src/api/endpoints/
git commit -m "feat(api): crear capa de servicios REST para modulos core"
```

---

### Task 2.2: Conectar Student Dashboard a APIs Reales

**Files:**
- Modify: `src/hooks/useStudentDashboard.ts`
- Modify: `src/components/student/sections/*`

- [ ] **Step 1: Reemplazar mocks de cursos por API**

En `useStudentDashboard.ts`, reemplazar:
```ts
// Antes:
const [cursos, setCursos] = useState(studentCursos);

// Después:
const [cursos, setCursos] = useState<StudentCourse[]>([]);
const [loadingCursos, setLoadingCursos] = useState(false);

useEffect(() => {
  setLoadingCursos(true);
  coursesApi.getAll()
    .then(res => setCursos(res.data))
    .catch(console.error)
    .finally(() => setLoadingCursos(false));
}, []);
```

- [ ] **Step 2: Reemplazar mocks de tareas, calificaciones, mensajes**

Replicar patrón para `assignmentsApi`, `gradesApi`, `messagesApi`.
Mantener `studentMockData` como fallback solo si `process.env.NODE_ENV === 'development'` y la API falla (opcional, pero idealmente eliminarlos por completo).

- [ ] **Step 3: Agregar estados de loading y error en UI**

Asegurar que cada sección maneje:
- `loading: boolean`
- `error: string | null`

- [ ] **Step 4: Verificar en navegador**

Levantar frontend y backend. Navegar por todas las secciones del estudiante. Verificar en Network tab que las llamadas a `/api` funcionen.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStudentDashboard.ts src/components/student/
git commit -m "feat(student): integrar dashboard estudiante con APIs reales"
```

---

### Task 2.3: Conectar Teacher Dashboard a APIs Reales

**Files:**
- Modify: `src/hooks/useTeacherDashboard.ts`
- Modify: `src/components/teacher/sections/*`

- [ ] **Step 1: Replicar el patrón de Task 2.2**

Reemplazar mocks por llamadas a:
- `coursesApi` (cursos del docente)
- `studentsApi` (estudiantes de sus cursos)
- `assignmentsApi` (tareas)
- `gradesApi` (calificaciones)
- `messagesApi` (mensajes)

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTeacherDashboard.ts src/components/teacher/
git commit -m "feat(teacher): integrar dashboard docente con APIs reales"
```

---

### Task 2.4: Conectar Auth (Login) al Backend Real

**Files:**
- Modify: `src/store/authStore.ts`
- Modify: `src/pages/Login.tsx`
- Modify: `src/api/endpoints/auth.ts`

- [ ] **Step 1: Crear servicio de autenticación**

Create/Modify `src/api/endpoints/auth.ts`:
```ts
import { apiClient } from '../client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    apiClient.post('/api/v1/auth/refresh', { refreshToken }),
  me: () => apiClient.get('/api/v1/auth/me'),
};
```

- [ ] **Step 2: Actualizar `authStore.ts` para usar API real**

Reemplazar lógica de login mock por:
```ts
import { authApi } from '../api/endpoints/auth';

login: async (email, password) => {
  set({ isLoading: true, error: null });
  try {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('tenantId', data.tenantId);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
  }
},
```

- [ ] **Step 3: Probar login con credenciales de seed**

Verificar que `backend/prisma/seed.ts` crea usuarios de prueba. Si no existe, crearlo:
```ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: { slug: 'demo', name: 'Universidad Demo', subdomain: 'demo', plan: 'FREE', status: 'ACTIVE' }
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'student@demo.com',
      passwordHash: hashedPassword,
      firstName: 'Estudiante',
      lastName: 'Demo',
      role: 'STUDENT',
    }
  });

  // Crear docente y admin...
}

main();
```

- [ ] **Step 4: Commit**

```bash
git add src/store/authStore.ts src/api/endpoints/auth.ts src/pages/Login.tsx backend/prisma/seed.ts
git commit -m "feat(auth): integrar login con backend real y seed de usuarios"
```

---

## Chunk 3: Refactorización Admin Dashboard y Módulos Avanzados (Semanas 4-6)

Objetivo: Convertir el monolito `AdminDashboard.tsx` en componentes modulares conectados al backend.

### Task 3.1: Extraer Secciones del Admin en Componentes Independientes

**Files:**
- Create: `src/components/admin/sections/DashboardOverview.tsx`
- Create: `src/components/admin/sections/UserManagement.tsx`
- Create: `src/components/admin/sections/CourseManagement.tsx`
- Create: `src/components/admin/sections/FinanceOverview.tsx`
- Create: `src/components/admin/sections/CertificateTemplates.tsx`
- Create: `src/components/admin/sections/Settings.tsx`
- Modify: `src/pages/AdminDashboard.tsx`

- [ ] **Step 1: Crear componente `DashboardOverview`**

Extraer todo el JSX de `renderInicio()` del `AdminDashboard.tsx` a `src/components/admin/sections/DashboardOverview.tsx`.

Props:
```ts
interface Props {
  darkMode: boolean;
  platformConfig: any;
  metricas: any;
}
```

- [ ] **Step 2: Crear componente `UserManagement`**

Extraer `renderUsuarios()` y todo su estado local de usuarios.
Este componente debe consumir `usersApi` en lugar de datos locales.

- [ ] **Step 3: Crear componentes para Cursos, Finanzas, Plantillas, Configuración**

Repetir el patrón. Cada componente debe:
- Manejar su propio estado
- Llamar a la API correspondiente
- Tener props `darkMode`, `card`, `text`, `border`

- [ ] **Step 4: Refactorizar `AdminDashboard.tsx`**

Simplificar a:
```tsx
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('inicio');
  // ... estados globales mínimos (darkMode, sidebar, user)

  const renderSection = () => {
    switch(activeSection) {
      case 'inicio': return <DashboardOverview ... />;
      case 'usuarios': return <UserManagement ... />;
      // ...
    }
  };

  return (
    <div className={`flex h-screen ${bg}`}>
      <AdminSidebar ... />
      <div className="flex-1 overflow-y-auto">
        <AdminHeader ... />
        <div className="p-6">{renderSection()}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/sections/ src/pages/AdminDashboard.tsx
git commit -m "refactor(admin): extraer secciones monoliticas en componentes modulares"
```

---

### Task 3.2: Conectar Módulos Admin a APIs Reales

**Files:**
- Modify: `src/components/admin/sections/UserManagement.tsx`
- Modify: `src/components/admin/sections/CourseManagement.tsx`
- Create: `src/api/endpoints/admin.ts`

- [ ] **Step 1: Crear `adminApi` para operaciones administrativas**

Create `src/api/endpoints/admin.ts`:
```ts
import { apiClient } from '../client';

export const adminApi = {
  getMetrics: () => apiClient.get('/api/v1/analytics/metrics'),
  getUsers: (params?: any) => apiClient.get('/api/v1/users', { params }),
  createUser: (data: any) => apiClient.post('/api/v1/users', data),
  updateUser: (id: string, data: any) => apiClient.patch(`/api/v1/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/api/v1/users/${id}`),
  // ... cursos, finanzas, etc.
};
```

- [ ] **Step 2: Conectar `UserManagement` a `usersApi`**

Reemplazar `setUsuarios([...usuarios, usuario])` por:
```ts
const response = await adminApi.createUser(nuevoUsuario);
setUsuarios([...usuarios, response.data]);
```

- [ ] **Step 3: Conectar Finance, Assets, Inventory, etc.**

Priorizar: Finanzas > Usuarios > Cursos > Activos/Inventario > Nómina/RRHH.
Los módulos menos críticos pueden quedar con mocks como fase 2 si el timeline aprieta, pero el objetivo es 100%.

- [ ] **Step 4: Commit**

```bash
git add src/api/endpoints/admin.ts src/components/admin/
git commit -m "feat(admin): conectar gestion de usuarios y cursos a APIs reales"
```

---

### Task 3.3: Completar APIs de Módulos Avanzados en Backend

Si faltan controllers para `assets`, `inventory`, `payroll`, `hr`, `idcards`, `announcements`, `procedures`, `mass-messages`, `finance`:

- [ ] **Step 1: Generar controllers/services CRUD para cada módulo faltante**

Usar NestJS CLI:
```bash
cd backend
nest g resource modules/assets --no-spec
nest g resource modules/inventory --no-spec
# ... etc
```

- [ ] **Step 2: Adaptar a Prisma schema existente**

Asegurar que los nuevos resources usen los modelos de Prisma ya definidos (ej: `Asset`, `InventoryItem`, `PayrollRecord`, etc.).

- [ ] **Step 3: Commit**

```bash
git add backend/src/modules/
git commit -m "feat(backend): generar recursos REST para modulos administrativos avanzados"
```

---

## Chunk 4: Calidad, Testing y Optimización (Semanas 6-7)

### Task 4.1: TypeScript Strict Mode y Linting

**Files:**
- Modify: `tsconfig.json`
- Modify: `backend/tsconfig.json`

- [ ] **Step 1: Activar strict mode en frontend (progresivamente)**

Modify `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 2: Corregir todos los errores de TypeScript resultantes**

Run:
```bash
npx tsc --noEmit
```
Corregir errores uno por uno. Puede ser mucho trabajo; si es excesivo, aplicar strict solo al backend primero.

- [ ] **Step 3: Corregir strict mode en backend**

El backend ya compila, pero verificar:
```bash
cd backend
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(ts): activar strict mode y corregir errores de tipado"
```

---

### Task 4.2: Tests Unitarios Backend (Coverage 70%+)

**Files:**
- Create/Modify: `backend/src/**/*.spec.ts`

- [ ] **Step 1: Escribir tests para AuthService**

Mock bcrypt, jwt, prisma.

- [ ] **Step 2: Escribir tests para CoursesService y UsersService**

- [ ] **Step 3: Ejecutar coverage**

Run:
```bash
cd backend
npm run test:cov
```
Expected: Coverage report muestra ≥70% en statements/branches/functions/lines.

- [ ] **Step 4: Commit**

```bash
git add backend/src/**/*.spec.ts
git commit -m "test(backend): alcanzar 70% coverage en modulos core"
```

---

### Task 4.3: Tests E2E Básicos

**Files:**
- Create: `backend/test/app.e2e-spec.ts` (ya existe, revisar)
- Create: `backend/test/auth.e2e-spec.ts`

- [ ] **Step 1: Configurar test database (SQLite en memoria o schema de test)**

Usar `dotenv` para `.env.test`.

- [ ] **Step 2: Escribir test E2E de login y CRUD de curso**

- [ ] **Step 3: Run E2E**

Run:
```bash
cd backend
npm run test:e2e
```

- [ ] **Step 4: Commit**

```bash
git commit -m "test(e2e): agregar tests end-to-end de auth y cursos"
```

---

### Task 4.4: Optimización Frontend

- [ ] **Step 1: Code splitting por rol**

En `App.tsx`, usar `React.lazy()` para cada dashboard:
```tsx
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
```

- [ ] **Step 2: Revisar bundle con `vite-bundle-visualizer`**

Install:
```bash
npm install -D vite-bundle-visualizer
```
Run:
```bash
npx vite-bundle-visualizer
```

- [ ] **Step 3: Commit**

```bash
git commit -m "perf(frontend): code splitting lazy y analisis de bundle"
```

---

## Chunk 5: Docker, Nginx y Preparación VPS (Semanas 7-8)

### Task 5.1: Dockerizar Backend y Frontend

**Files:**
- Modify: `Dockerfile` (frontend)
- Modify: `backend/Dockerfile`
- Modify: `docker-compose.yml`
- Create: `.dockerignore` robusto

- [ ] **Step 1: Revisar Dockerfiles existentes**

Read `Dockerfile` y `backend/Dockerfile`.

- [ ] **Step 2: Crear Dockerfile de producción para frontend**

Modify `Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Crear Dockerfile de producción para backend**

Modify `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main"]
```

- [ ] **Step 4: Crear `docker-compose.yml` completo**

Create/Modify `docker-compose.yml`:
```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: univirtual
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: univirtual
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://univirtual:changeme@db:5432/univirtual?schema=public
      JWT_SECRET: supersecret
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      - db
      - redis

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

- [ ] **Step 5: Probar localmente**

Run:
```bash
docker-compose up --build
```
Verificar que `http://localhost` sirva el frontend y `http://localhost:4000/api/docs` sirva Swagger.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile backend/Dockerfile docker-compose.yml nginx.conf .dockerignore
git commit -m "feat(docker): dockerizar frontend, backend, postgres y redis"
```

---

### Task 5.2: Configurar Nginx Proxy Reverso

**Files:**
- Modify: `nginx.conf`

- [ ] **Step 1: Crear configuración Nginx para producción**

Create/Modify `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

- [ ] **Step 2: Commit**

```bash
git add nginx.conf
git commit -m "feat(nginx): configurar proxy reverso y gzip"
```

---

### Task 5.3: Configurar SSL (Let's Encrypt) y Variables de Entorno

**Files:**
- Create: `scripts/init-ssl.sh`
- Create: `.env.production.example`
- Modify: `docker-compose.yml` (añadir certbot o traefik)

- [ ] **Step 1: Crear script de inicialización SSL**

Create `scripts/init-ssl.sh`:
```bash
#!/bin/bash
domain="tudominio.com"
email="admin@tudominio.com"

certbot certonly --standalone -d $domain --email $email --agree-tos --non-interactive
```

- [ ] **Step 2: Documentar variables de entorno requeridas**

Create `.env.production.example`:
```bash
# Database
DATABASE_URL=postgresql://user:pass@db:5432/univirtual?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d

# Stripe (si aplica)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
VITE_API_URL=http://localhost:4000
```

- [ ] **Step 3: Commit**

```bash
git add scripts/ .env.production.example
git commit -m "feat(deploy): agregar script SSL y variables de entorno de produccion"
```

---

## Chunk 6: Despliegue VPS y CI/CD (Semanas 8-9)

### Task 6.1: Preparar VPS

- [ ] **Step 1: Requisitos del VPS**

Mínimo recomendado:
- 2 vCPU
- 4 GB RAM
- 40 GB SSD
- Ubuntu 22.04 LTS

- [ ] **Step 2: Instalar Docker y Docker Compose**

Comandos en VPS:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin
```

---

### Task 6.2: Script de Deploy Automatizado

**Files:**
- Create: `scripts/deploy.sh`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Crear script de deploy por SSH**

Create `scripts/deploy.sh`:
```bash
#!/bin/bash
set -e

echo "Building and deploying Univirtual..."

git pull origin main
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up --build -d

docker system prune -f

echo "Deployment complete!"
```

- [ ] **Step 2: Crear GitHub Actions para CI/CD básico**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && npm ci
      - run: cd backend && npm test
      - run: cd backend && npm run build

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

Create `.github/workflows/deploy.yml` (manual o en push a main):
```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/univirtual
            ./scripts/deploy.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/deploy.sh .github/workflows/
git commit -m "feat(ci/cd): agregar github actions y script de deploy al VPS"
```

---

### Task 6.3: Deploy Inicial en VPS

- [ ] **Step 1: Subir código al VPS**

```bash
rsync -avz --exclude node_modules --exclude .git ./ user@vps-ip:/opt/univirtual/
```

- [ ] **Step 2: Ejecutar primer deploy**

En VPS:
```bash
cd /opt/univirtual
sudo docker compose up --build -d
```

- [ ] **Step 3: Ejecutar migraciones y seed**

```bash
cd /opt/univirtual/backend
sudo docker compose exec backend npx prisma migrate deploy
sudo docker compose exec backend npx prisma db seed
```

- [ ] **Step 4: Verificar endpoints**

- `https://tudominio.com` → Frontend
- `https://tudominio.com/api/docs` → Swagger
- `https://tudominio.com/api/health` → Health check

- [ ] **Step 5: Tag de release**

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Produccion estable"
git push origin v1.0.0
```

---

## Chunk 7: Documentación Final y Entrega (Semana 9-10)

### Task 7.1: Crear READMEs Completos

**Files:**
- Create: `README.md`
- Create: `backend/README.md`
- Create: `docs/DEPLOY.md`

- [ ] **Step 1: README principal del proyecto**

Contenido mínimo:
- Descripción de Univirtual
- Stack tecnológico
- Requisitos (Node 20+, Docker, PostgreSQL)
- Instalación local paso a paso
- Estructura de carpetas
- Scripts disponibles
- Capturas de pantalla (si aplica)

- [ ] **Step 2: Guía de deploy**

Create `docs/DEPLOY.md`:
- Requisitos del VPS
- Configuración DNS
- SSL con Let's Encrypt
- Variables de entorno
- Comandos de deploy
- Troubleshooting

- [ ] **Step 3: Commit**

```bash
git add README.md docs/
git commit -m "docs: agregar README y guia de despliegue completa"
```

---

### Task 7.2: Checklist Final de Entrega

- [ ] **Backend:**
  - [ ] Build exitoso
  - [ ] Tests pasando (unit + e2e)
  - [ ] Swagger accesible y documentado
  - [ ] Health check funcionando
  - [ ] Multi-tenancy activo
  - [ ] Seed de datos de prueba funcional

- [ ] **Frontend:**
  - [ ] Build de producción exitoso
  - [ ] 0 errores de TypeScript
  - [ ] Login real funcionando
  - [ ] Student dashboard conectado a API
  - [ ] Teacher dashboard conectado a API
  - [ ] Admin dashboard refactorizado y conectado
  - [ ] Dark mode funcionando
  - [ ] Responsive design verificado

- [ ] **Infraestructura:**
  - [ ] Docker Compose funcional
  - [ ] Nginx configurado
  - [ ] SSL activo
  - [ ] CI/CD en GitHub Actions
  - [ ] Deploy en VPS exitoso

---

## Resumen de Timeline

| Semana | Foco | Entregable |
|--------|------|------------|
| 1 | Emergencia | Build estable, tests pasando, dev environment listo |
| 1-2 | Backend Core | APIs completas, Swagger, CRUDs, multi-tenancy |
| 2-4 | Frontend Core | Auth real, Student/Teacher dashboards con APIs |
| 4-6 | Admin + Avanzado | Refactor admin, módulos avanzados backend |
| 6-7 | QA | Strict TS, coverage 70%, E2E, optimización |
| 7-8 | Docker + Nginx | Docker compose, SSL, proxy reverso |
| 8-9 | VPS + CI/CD | Deploy automatizado, GitHub Actions |
| 9-10 | Docs + Polishing | READMEs, guías, checklist final |

---

## Notas para el Ejecutor

1. **Prioridad:** Si el timeline aprieta, la regla de oro es: **Backend estable > Auth real > Student/Teacher core > Admin > Avanzados**.
2. **Mocks:** Eliminar `studentMockData`, `teacherMockData`, `adminMockData` completamente una vez la API esté conectada.
3. **Base de datos:** El schema Prisma es sólido. Aprovecharlo al máximo.
4. **Seguridad:** Cambiar todas las contraseñas default, JWT secrets, y claves Stripe antes de producción.
5. **Rollback:** Antes de cada fase grande, crear un tag de Git para poder revertir fácilmente.

---

## Infraestructura del Cliente — VPS Contabo

**Proveedor:** Contabo
**Plan:** VPS S (o equivalente con las siguientes specs)

| Recurso | Especificación |
|---------|----------------|
| CPU | 4 vCPU Cores |
| RAM | 8 GB |
| Almacenamiento | 75 GB NVMe (o 150 GB SSD) |
| Snapshot | 1 Snapshot incluido |
| Puerto/Red | 200 Mbit/s Port |
| Sistema Operativo | Ubuntu 22.04 LTS (recomendado) |

### Evaluación de Capacidad
- **Muy adecuado** para el stack NestJS + PostgreSQL + React.
- 8 GB RAM permite correr cómodamente: PostgreSQL (1-2GB), NestJS backend (1-2GB), Nginx + React frontend (<1GB), Redis (<512MB), con margen para picos.
- 75 GB NVMe es suficiente para la aplicación + base de datos inicial + logs.
- 4 vCores permiten builds de Docker sin estrangulamiento.

### Configuración Recomendada del VPS
- **Swap:** 4 GB (recomendado para builds de Docker)
- **Docker + Docker Compose:** Instalación estándar
- **SSL:** Let's Encrypt vía Certbot
- **Firewall:** UFW (puertos 22, 80, 443 abiertos)
- **Dominio:** Configurar DNS A record apuntando al IP del VPS antes del deploy

### Datos para el Deploy (completar mañana)
- **IP del VPS:** `___PENDIENTE___`
- **Dominio:** `___PENDIENTE___`
- **Usuario SSH:** `___PENDIENTE___`
- **Puerto SSH:** `22` (o custom)
- **Email Let's Encrypt:** `___PENDIENTE___`

---

## Checklist de Inicio — Día 1 (Mañana)

- [ ] Configurar acceso SSH al VPS (compartir IP/usuario o clave SSH)
- [ ] Confirmar dominio asignado para SSL
- [ ] Iniciar Chunk 0: Fase de Emergencia (Build + Tests)
- [ ] Crear tag `v0.0-emergency-start` en Git
- [ ] Ejecutar Task 0.1, 0.2, 0.3, 0.4 en secuencia
- [ ] Checkpoint: Validar que `npm run build` pasa en frontend y `npm run build` + `npm test` pasan en backend
