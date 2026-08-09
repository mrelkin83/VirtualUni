# Plan de Conversión a SaaS Multi-Tenant - VirtualUni

## 📋 Análisis de la Estructura Actual

### Arquitectura Existente
```
VirtualUni (Monolítico - Single Tenant)
│
├── Frontend (React + TypeScript + Vite)
│   ├── 3 Dashboards separados (Student, Teacher, Admin)
│   ├── Autenticación básica (sin backend)
│   ├── Datos mock hardcodeados
│   └── Sin gestión de tenants
│
├── Componentes Modulares
│   ├── Layout (Sidebar, Header)
│   ├── Sections (por rol)
│   └── UI Components
│
└── Sin Backend
    ├── No hay API
    ├── No hay base de datos
    └── No hay gestión de usuarios real
```

---

## 🎯 Objetivos del SaaS Multi-Tenant

### Modelo de Negocio
- **Target**: Universidades, colegios e instituciones educativas
- **Multi-Tenant**: Cada institución = 1 tenant independiente
- **Planes**: Free, Basic, Professional, Enterprise
- **Facturación**: Por estudiante/mes o usuario/mes

### Características Multi-Tenant
1. **Aislamiento de Datos**: Cada tenant tiene sus datos separados
2. **Personalización**: Branding, colores, logo por tenant
3. **Subdominios**: `universidad1.virtualuni.com`, `colegio2.virtualuni.com`
4. **Planes y Límites**: Usuarios, cursos, almacenamiento por plan
5. **Gestión Centralizada**: Super-admin para gestionar todos los tenants

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌────────────┬──────────────┬──────────────────────────┐   │
│  │ Public App │ Tenant App   │ Super Admin Dashboard   │   │
│  │ (Landing)  │ (Dashboards) │ (Manage Tenants)        │   │
│  └────────────┴──────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BFF                         │
│  ┌─────────────┬──────────────┬──────────────────────────┐  │
│  │ Auth Service│ Tenant Resolver│ Rate Limiting          │  │
│  └─────────────┴──────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Python)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Microservicios / Modular Monolith                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • Auth Service (JWT + Multi-tenant)                  │   │
│  │ • Tenant Management Service                          │   │
│  │ • User Management Service                            │   │
│  │ • Course Management Service                          │   │
│  │ • Student/Teacher Services                           │   │
│  │ • Payment/Billing Service                            │   │
│  │ • Analytics Service                                  │   │
│  │ • Notification Service                               │   │
│  │ • File Storage Service                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                             │
│  ┌───────────────┬──────────────┬────────────────────────┐  │
│  │ PostgreSQL    │ Redis Cache  │ MongoDB (Opcional)     │  │
│  │ (Multi-tenant)│              │ (Logs, Analytics)      │  │
│  └───────────────┴──────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA                           │
│  ┌───────────────┬──────────────┬────────────────────────┐  │
│  │ AWS/Azure/GCP │ CDN          │ Object Storage (S3)    │  │
│  │ Docker/K8s    │ Email (SES)  │ Monitoring (Datadog)   │  │
│  └───────────────┴──────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Estrategia Multi-Tenant en Base de Datos

### Opción Recomendada: Shared Database + Schema per Tenant

```sql
-- Base de datos compartida con schemas separados
DATABASE: virtualuni

SCHEMAS:
├── public (tablas compartidas)
│   ├── tenants
│   ├── subscriptions
│   ├── billing
│   └── system_users
│
├── tenant_univ1 (datos de Universidad 1)
│   ├── users
│   ├── students
│   ├── teachers
│   ├── courses
│   ├── assignments
│   └── grades
│
└── tenant_colegio2 (datos de Colegio 2)
    ├── users
    ├── students
    └── ...
```

**Ventajas**:
- Aislamiento de datos seguro
- Backups por tenant
- Migración fácil si un tenant crece mucho
- Compliance y regulaciones (GDPR, FERPA)

---

## 🔧 Componentes a Modificar

### 1. Frontend (src/)

#### A. Crear Nuevo Sistema de Rutas
```typescript
// src/App.tsx - NUEVA ESTRUCTURA
<Router>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/signup" element={<TenantSignup />} />

    {/* Tenant Routes - Requiere tenant context */}
    <Route path="/:tenantSlug/*" element={<TenantApp />}>
      <Route path="login" element={<TenantLogin />} />
      <Route path="dashboard" element={<ProtectedRoute />}>
        <Route path="student" element={<StudentDashboard />} />
        <Route path="teacher" element={<TeacherDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Route>

    {/* Super Admin Routes */}
    <Route path="/superadmin/*" element={<SuperAdminApp />}>
      <Route path="tenants" element={<TenantManagement />} />
      <Route path="billing" element={<BillingManagement />} />
      <Route path="analytics" element={<SystemAnalytics />} />
    </Route>
  </Routes>
</Router>
```

#### B. Crear Contextos Globales
```typescript
// src/contexts/TenantContext.tsx - NUEVO
interface TenantContextType {
  tenant: Tenant | null;
  tenantConfig: TenantConfig;
  loading: boolean;
}

// src/contexts/AuthContext.tsx - NUEVO
interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  role: UserRole;
  login: (credentials) => Promise<void>;
  logout: () => void;
}
```

#### C. Modificar Componentes Existentes

**Login.tsx** → **TenantLogin.tsx**
```typescript
// ANTES (src/pages/Login.tsx)
- Login simple sin backend
- Redirección hardcodeada

// DESPUÉS (src/pages/TenantLogin.tsx)
+ Detectar tenant por subdomain/slug
+ Integrar con API de autenticación
+ JWT tokens (access + refresh)
+ Branding personalizado por tenant
+ SSO opcional (Google, Microsoft)
```

**Dashboards** (Student, Teacher, Admin)
```typescript
// MODIFICACIONES NECESARIAS:
+ Agregar tenant_id a todas las peticiones
+ Usar API endpoints en lugar de datos mock
+ Implementar paginación y filtros
+ Agregar manejo de errores robusto
+ Implementar loading states
+ Cachear datos con React Query
```

**Componentes de Layout**
```typescript
// Sidebar y Header
+ Mostrar logo personalizado del tenant
+ Aplicar tema/colores del tenant
+ Agregar nombre de la institución
+ Menú dinámico según permisos del usuario
```

#### D. Crear Sistema de Theming Dinámico
```typescript
// src/theme/TenantTheme.tsx - NUEVO
interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
  fonts: {
    heading: string;
    body: string;
  };
  customCSS?: string;
}
```

---

### 2. Tipos TypeScript (src/types/)

#### A. Crear Nuevos Tipos Multi-Tenant
```typescript
// src/types/tenant.types.ts - NUEVO
export interface Tenant {
  id: string;
  slug: string; // URL-friendly name
  name: string;
  domain?: string; // custom domain opcional
  subdomain: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  settings: TenantSettings;
  limits: TenantLimits;
  createdAt: string;
  trialEndsAt?: string;
}

export interface TenantSettings {
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  features: {
    enableMessaging: boolean;
    enableVideoConference: boolean;
    enablePayments: boolean;
    enableCertificates: boolean;
  };
  localization: {
    timezone: string;
    language: string;
    currency: string;
  };
}

export interface TenantLimits {
  maxStudents: number;
  maxTeachers: number;
  maxCourses: number;
  storageGB: number;
  currentStudents: number;
  currentTeachers: number;
  currentCourses: number;
  currentStorageGB: number;
}

// src/types/auth.types.ts - NUEVO
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  permissions: Permission[];
}

export type UserRole = 'super_admin' | 'tenant_admin' | 'teacher' | 'student';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// src/types/subscription.types.ts - NUEVO
export interface Subscription {
  id: string;
  tenantId: string;
  plan: Plan;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  billingInfo: BillingInfo;
}
```

#### B. Modificar Tipos Existentes
```typescript
// TODOS los tipos existentes necesitan agregar:
export interface Student {
  id: string;
  tenantId: string; // ← AGREGAR
  // ... resto de campos
}

export interface Course {
  id: string;
  tenantId: string; // ← AGREGAR
  // ... resto de campos
}

// Aplicar a TODOS: Teacher, Assignment, Grade, Message, etc.
```

---

### 3. Servicios API (src/services/) - NUEVO MÓDULO

```typescript
// src/services/api.ts - Base API Client
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar tenant y auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const tenantId = localStorage.getItem('tenant_id');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;

  return config;
});

// src/services/auth.service.ts - NUEVO
export const authService = {
  login: (tenantSlug: string, credentials: LoginCredentials) =>
    apiClient.post(`/tenants/${tenantSlug}/auth/login`, credentials),

  register: (tenantSlug: string, data: RegisterData) =>
    apiClient.post(`/tenants/${tenantSlug}/auth/register`, data),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: () => apiClient.post('/auth/logout'),
};

// src/services/tenant.service.ts - NUEVO
export const tenantService = {
  getTenantBySlug: (slug: string) =>
    apiClient.get(`/tenants/${slug}`),

  createTenant: (data: CreateTenantData) =>
    apiClient.post('/tenants', data),

  updateTenant: (tenantId: string, data: Partial<Tenant>) =>
    apiClient.patch(`/tenants/${tenantId}`, data),

  getTenantSettings: (tenantId: string) =>
    apiClient.get(`/tenants/${tenantId}/settings`),
};

// src/services/student.service.ts - NUEVO
export const studentService = {
  getStudents: (params: QueryParams) =>
    apiClient.get('/students', { params }),

  getStudent: (id: string) =>
    apiClient.get(`/students/${id}`),

  createStudent: (data: CreateStudentData) =>
    apiClient.post('/students', data),

  updateStudent: (id: string, data: Partial<Student>) =>
    apiClient.patch(`/students/${id}`, data),
};

// Crear servicios similares para:
// - teacher.service.ts
// - course.service.ts
// - assignment.service.ts
// - grade.service.ts
// - message.service.ts
// - payment.service.ts
```

---

### 4. Hooks Personalizados (src/hooks/)

```typescript
// src/hooks/useTenant.ts - NUEVO
export const useTenant = () => {
  const { tenant, loading } = useContext(TenantContext);

  return {
    tenant,
    loading,
    isActive: tenant?.status === 'active',
    canAccess: (feature: string) =>
      tenant?.settings.features[feature] || false,
  };
};

// src/hooks/useAuth.ts - NUEVO
export const useAuth = () => {
  const { user, login, logout } = useContext(AuthContext);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission: (resource: string, action: string) =>
      user?.permissions.some(p =>
        p.resource === resource && p.actions.includes(action)
      ),
  };
};

// src/hooks/useApi.ts - NUEVO (React Query wrapper)
export const useStudents = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.getStudents(params),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};
```

---

### 5. Modificar Hooks Existentes

```typescript
// src/hooks/useStudentDashboard.ts
// ANTES: Datos mock hardcodeados
const [cursos] = useState(studentCursos);

// DESPUÉS: Fetch desde API con React Query
const { data: cursos, isLoading } = useCourses();
const { data: tareas } = useAssignments();
const { data: calificaciones } = useGrades();
```

---

## 🆕 Nuevos Módulos a Crear

### 1. Landing Page y Marketing (src/pages/public/)
```
src/pages/public/
├── LandingPage.tsx
├── PricingPage.tsx
├── FeaturesPage.tsx
├── AboutPage.tsx
├── ContactPage.tsx
└── BlogPage.tsx
```

### 2. Tenant Signup Flow (src/pages/signup/)
```
src/pages/signup/
├── TenantSignupFlow.tsx
│   ├── Step1_BasicInfo.tsx (nombre, email, contraseña)
│   ├── Step2_InstitutionInfo.tsx (tipo, país, tamaño)
│   ├── Step3_Customization.tsx (logo, colores)
│   ├── Step4_Plan.tsx (seleccionar plan)
│   └── Step5_Confirmation.tsx
└── OnboardingWizard.tsx
```

### 3. Super Admin Dashboard (src/pages/superadmin/)
```
src/pages/superadmin/
├── SuperAdminDashboard.tsx
├── TenantManagement/
│   ├── TenantList.tsx
│   ├── TenantDetail.tsx
│   ├── TenantCreate.tsx
│   └── TenantSettings.tsx
├── BillingManagement/
│   ├── SubscriptionsList.tsx
│   ├── InvoicesPage.tsx
│   └── PaymentMethodsPage.tsx
├── Analytics/
│   ├── SystemMetrics.tsx
│   ├── TenantAnalytics.tsx
│   └── RevenueReports.tsx
└── SystemSettings/
    ├── PlansManagement.tsx
    ├── EmailTemplates.tsx
    └── SystemConfig.tsx
```

### 4. Tenant Admin Panel (src/pages/tenant-admin/)
```
src/pages/tenant-admin/
├── TenantSettings.tsx
│   ├── BrandingSettings.tsx
│   ├── IntegrationSettings.tsx
│   └── SecuritySettings.tsx
├── UserManagement.tsx
├── BillingSettings.tsx
└── AnalyticsPage.tsx
```

### 5. Componentes de Subscription (src/components/subscription/)
```
src/components/subscription/
├── PricingCard.tsx
├── PlanComparison.tsx
├── UsageMeter.tsx (indicador de límites)
├── UpgradePrompt.tsx
└── BillingPortal.tsx
```

### 6. Middleware y Guards (src/middleware/)
```
src/middleware/
├── TenantGuard.tsx (verificar tenant activo)
├── AuthGuard.tsx (verificar autenticación)
├── RoleGuard.tsx (verificar permisos)
└── FeatureGuard.tsx (verificar features del plan)
```

---

## 🔐 Sistema de Autenticación y Autorización

### JWT Tokens
```typescript
// Access Token (5-15 min)
{
  user_id: "uuid",
  tenant_id: "uuid",
  role: "teacher",
  permissions: ["courses:read", "courses:write"],
  exp: timestamp
}

// Refresh Token (7-30 días)
{
  user_id: "uuid",
  tenant_id: "uuid",
  exp: timestamp
}
```

### Roles y Permisos (RBAC)
```typescript
const ROLES = {
  super_admin: ['*'], // Todos los permisos

  tenant_admin: [
    'users:*',
    'courses:*',
    'settings:*',
    'billing:read',
  ],

  teacher: [
    'courses:read',
    'courses:write', // solo sus cursos
    'students:read',
    'grades:*',
    'assignments:*',
  ],

  student: [
    'courses:read',
    'assignments:read',
    'assignments:submit',
    'grades:read',
    'profile:write', // solo su perfil
  ],
};
```

---

## 💰 Sistema de Facturación y Planes

### Planes Propuestos
```typescript
export const PLANS = {
  free: {
    name: 'Free Trial',
    price: 0,
    limits: {
      students: 20,
      teachers: 2,
      courses: 5,
      storage: 1, // GB
    },
    features: {
      basicReports: true,
      messaging: false,
      videoConference: false,
      customBranding: false,
      apiAccess: false,
    },
  },

  basic: {
    name: 'Basic',
    price: 29, // USD/mes
    limits: {
      students: 100,
      teachers: 10,
      courses: 20,
      storage: 10,
    },
    features: {
      basicReports: true,
      messaging: true,
      videoConference: false,
      customBranding: false,
      apiAccess: false,
    },
  },

  professional: {
    name: 'Professional',
    price: 99,
    limits: {
      students: 500,
      teachers: 50,
      courses: 100,
      storage: 50,
    },
    features: {
      basicReports: true,
      messaging: true,
      videoConference: true,
      customBranding: true,
      apiAccess: true,
    },
  },

  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    limits: {
      students: -1, // unlimited
      teachers: -1,
      courses: -1,
      storage: 500,
    },
    features: {
      basicReports: true,
      messaging: true,
      videoConference: true,
      customBranding: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedSupport: true,
      sso: true,
    },
  },
};
```

### Integración de Pagos
```typescript
// Stripe Integration
// src/services/payment.service.ts
export const paymentService = {
  createCheckoutSession: (tenantId, plan) =>
    apiClient.post('/billing/checkout', { tenantId, plan }),

  createPortalSession: (tenantId) =>
    apiClient.post('/billing/portal', { tenantId }),

  getInvoices: (tenantId) =>
    apiClient.get(`/billing/invoices?tenantId=${tenantId}`),
};
```

---

## 🗄️ Modelo de Base de Datos

### Tablas Principales (Schema: public)

```sql
-- Tabla de Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  custom_domain VARCHAR(255) UNIQUE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'trial',
  settings JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  trial_ends_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Tabla de Suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Facturas
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  stripe_invoice_id VARCHAR(255),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tablas por Tenant (Schema: tenant_{slug})

```sql
-- Cada tenant tiene su propio schema con estas tablas:

CREATE SCHEMA tenant_universidad1;

-- Usuarios del tenant
CREATE TABLE tenant_universidad1.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Estudiantes
CREATE TABLE tenant_universidad1.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tenant_universidad1.users(id),
  student_code VARCHAR(50) UNIQUE,
  program VARCHAR(255),
  semester VARCHAR(50),
  enrollment_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'
);

-- Profesores
CREATE TABLE tenant_universidad1.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES tenant_universidad1.users(id),
  employee_code VARCHAR(50) UNIQUE,
  department VARCHAR(255),
  specialization VARCHAR(255),
  hire_date DATE
);

-- Cursos
CREATE TABLE tenant_universidad1.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES tenant_universidad1.teachers(id),
  credits INTEGER,
  semester VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Matriculas
CREATE TABLE tenant_universidad1.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES tenant_universidad1.students(id),
  course_id UUID REFERENCES tenant_universidad1.courses(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  UNIQUE(student_id, course_id)
);

-- Tareas
CREATE TABLE tenant_universidad1.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES tenant_universidad1.courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  total_points INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Entregas
CREATE TABLE tenant_universidad1.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES tenant_universidad1.assignments(id),
  student_id UUID REFERENCES tenant_universidad1.students(id),
  file_url TEXT,
  content TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  grade DECIMAL(5,2),
  feedback TEXT,
  graded_at TIMESTAMP
);

-- Calificaciones
CREATE TABLE tenant_universidad1.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES tenant_universidad1.students(id),
  course_id UUID REFERENCES tenant_universidad1.courses(id),
  assignment_id UUID REFERENCES tenant_universidad1.assignments(id),
  grade DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2),
  graded_by UUID REFERENCES tenant_universidad1.teachers(id),
  graded_at TIMESTAMP DEFAULT NOW()
);

-- Mensajes
CREATE TABLE tenant_universidad1.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES tenant_universidad1.users(id),
  recipient_id UUID REFERENCES tenant_universidad1.users(id),
  subject VARCHAR(255),
  body TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Estrategia de Migración (Roadmap)

### Fase 1: Backend Core (4-6 semanas)
**Prioridad: CRÍTICA**

#### Semana 1-2: Setup Inicial
- [ ] Crear repositorio backend (Node.js + Express o NestJS)
- [ ] Configurar TypeScript, ESLint, Prettier
- [ ] Setup PostgreSQL + Migrations (Prisma/TypeORM)
- [ ] Configurar Docker para desarrollo
- [ ] CI/CD básico (GitHub Actions)

#### Semana 3-4: Auth & Tenant Core
- [ ] Implementar JWT authentication
- [ ] Sistema de multi-tenancy (middleware tenant resolver)
- [ ] CRUD de tenants
- [ ] Sistema de roles y permisos
- [ ] Password reset, email verification

#### Semana 5-6: API Core Endpoints
- [ ] Users CRUD (con tenant isolation)
- [ ] Students CRUD
- [ ] Teachers CRUD
- [ ] Courses CRUD básico
- [ ] Tests unitarios e integración

---

### Fase 2: Frontend Multi-Tenant (3-4 semanas)
**Prioridad: ALTA**

#### Semana 7-8: Refactor Frontend
- [ ] Crear TenantContext y AuthContext
- [ ] Implementar tenant resolver (por subdomain/slug)
- [ ] Rehacer sistema de rutas
- [ ] Integrar React Query para API calls
- [ ] Reemplazar datos mock por API calls

#### Semana 9-10: Landing & Signup
- [ ] Landing page con Tailwind
- [ ] Pricing page
- [ ] Tenant signup flow (wizard de 5 pasos)
- [ ] Email de bienvenida
- [ ] Onboarding inicial

---

### Fase 3: Features Avanzados (4-5 semanas)
**Prioridad: MEDIA**

#### Semana 11-12: Gestión de Cursos
- [ ] Módulos y temas de cursos
- [ ] Materiales (upload a S3)
- [ ] Asignaciones y entregas
- [ ] Sistema de calificaciones

#### Semana 13-14: Super Admin Dashboard
- [ ] Panel de gestión de tenants
- [ ] Métricas y analytics del sistema
- [ ] Gestión de facturación
- [ ] Soporte técnico integrado

#### Semana 15: Testing & QA
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Security audit
- [ ] Performance testing
- [ ] Bug fixing

---

### Fase 4: Billing & Monetización (3 semanas)
**Prioridad: ALTA**

#### Semana 16-17: Stripe Integration
- [ ] Integrar Stripe Checkout
- [ ] Webhooks de Stripe
- [ ] Gestión de suscripciones
- [ ] Invoicing automático
- [ ] Customer Portal

#### Semana 18: Límites y Metering
- [ ] Sistema de límites por plan
- [ ] Metering de uso (estudiantes, storage, etc.)
- [ ] Alertas de límites
- [ ] Upgrade prompts

---

### Fase 5: Production & Scale (2-3 semanas)
**Prioridad: CRÍTICA**

#### Semana 19-20: DevOps & Deploy
- [ ] Setup producción (AWS/GCP/Azure)
- [ ] Docker + Kubernetes (o ECS)
- [ ] CDN (CloudFront/CloudFlare)
- [ ] SSL certificates
- [ ] Monitoring (Datadog/New Relic)
- [ ] Error tracking (Sentry)
- [ ] Backups automáticos

#### Semana 21: Launch Prep
- [ ] Load testing
- [ ] Security hardening
- [ ] Documentation
- [ ] Beta testing con 3-5 instituciones
- [ ] Marketing materials

---

## 📦 Stack Tecnológico Recomendado

### Backend
```yaml
Runtime: Node.js 20 LTS
Framework: NestJS (enterprise-grade) o Express (más ligero)
Language: TypeScript
Database: PostgreSQL 15+ (multi-tenant schemas)
Cache: Redis 7+
ORM: Prisma (mejor DX) o TypeORM (más maduro)
Auth: Passport + JWT
Email: SendGrid o AWS SES
File Storage: AWS S3 o CloudFlare R2
Queue: Bull (Redis-based) para jobs async
Testing: Jest + Supertest
```

### Frontend (Actual + Mejoras)
```yaml
Framework: React 18
Language: TypeScript
Build: Vite
Routing: React Router v6
State: React Query + Zustand (reemplazar useState)
Forms: React Hook Form + Zod
UI: Tailwind CSS + Headless UI
Icons: Lucide React
Charts: Recharts o Chart.js
Calendar: FullCalendar
Rich Text: TipTap o Slate
```

### DevOps & Infrastructure
```yaml
Container: Docker
Orchestration: Kubernetes o AWS ECS
CI/CD: GitHub Actions
CDN: CloudFlare
Monitoring: Datadog o Grafana + Prometheus
Logging: Winston + CloudWatch
Error Tracking: Sentry
Analytics: Mixpanel + Google Analytics
```

---

## 💡 Decisiones Técnicas Clave

### 1. Single Database vs Database per Tenant
**Decisión: Single Database con Schemas Separados**
- ✅ Más fácil de mantener
- ✅ Backups centralizados
- ✅ Costos optimizados
- ✅ Queries cross-tenant para analytics
- ⚠️ Requiere buena implementación de Row Level Security

### 2. Monolito vs Microservicios
**Decisión: Monolito Modular inicialmente**
- ✅ Más rápido de desarrollar
- ✅ Menos complejidad operacional
- ✅ Fácil de dividir después si crece
- ⚠️ Migrar a microservicios cuando llegue a 100+ tenants

### 3. REST vs GraphQL
**Decisión: REST con OpenAPI**
- ✅ Más simple, mejor caching
- ✅ Tooling maduro
- ✅ Mejor para SaaS B2B
- 🔄 Considerar GraphQL en Fase 4+ si hay demanda

### 4. Subdominios vs Path-based
**Decisión: Subdominios (universidad1.virtualuni.com)**
- ✅ Mejor aislamiento
- ✅ Cookies separadas
- ✅ Más profesional
- ✅ Permite custom domains después

---

## 🔒 Consideraciones de Seguridad

### Data Isolation
```typescript
// Middleware de tenant isolation
export const tenantIsolation = (req, res, next) => {
  const tenantId = req.user.tenantId;
  req.db = getTenantSchema(tenantId);
  next();
};

// NUNCA hacer:
db.query('SELECT * FROM students'); // ❌

// SIEMPRE hacer:
db.query('SELECT * FROM students WHERE tenant_id = ?', [tenantId]); // ✅
```

### Seguridad por Capas
1. **Rate Limiting**: 100 req/min por IP, 1000 req/min por tenant
2. **SQL Injection**: Usar prepared statements siempre
3. **XSS**: Sanitizar inputs, CSP headers
4. **CSRF**: Tokens en formularios
5. **Secrets**: Usar Vault o AWS Secrets Manager
6. **Backups**: Diarios automáticos + retención 30 días
7. **Audit Logs**: Registrar todas las acciones críticas

---

## 📈 Métricas de Éxito

### KPIs Técnicos
- [ ] Uptime: >99.9%
- [ ] Latencia API: <200ms p95
- [ ] Time to First Byte: <500ms
- [ ] Tenant signup: <2 minutos
- [ ] Zero data leaks entre tenants

### KPIs de Negocio
- [ ] 100 tenants en primera versión (6 meses)
- [ ] 70% conversión trial → paid
- [ ] MRR: $10,000 en 12 meses
- [ ] Churn: <5% mensual
- [ ] NPS: >50

---

## 📝 Checklist de Lanzamiento

### Pre-Launch
- [ ] Documentación API completa (Swagger/OpenAPI)
- [ ] Terms of Service + Privacy Policy
- [ ] GDPR/CCPA compliance
- [ ] Data export feature (GDPR requirement)
- [ ] Status page (status.virtualuni.com)
- [ ] Help center / Documentation site
- [ ] Onboarding videos
- [ ] Email templates diseñados
- [ ] Support channels (email, chat)

### Post-Launch
- [ ] Customer feedback loop
- [ ] Feature voting board
- [ ] Changelog público
- [ ] Blog con case studies
- [ ] Webinars onboarding
- [ ] Partner program

---

## 💰 Estimación de Costos (Primeros 12 meses)

### Desarrollo
- Backend Developer (6 meses): $60,000
- Frontend Developer (4 meses): $40,000
- DevOps/Infrastructure (2 meses): $20,000
- **Total Desarrollo: $120,000**

### Infraestructura (estimado mensual)
- AWS/GCP Compute: $500/mes
- Database (RDS): $300/mes
- Storage (S3): $100/mes
- CDN: $50/mes
- Monitoring: $100/mes
- Email (SendGrid): $50/mes
- **Total Infra: ~$1,100/mes = $13,200/año**

### Software & Tools
- GitHub: $0 (free tier)
- Stripe: 2.9% + $0.30 por transacción
- Domain + SSL: $100/año
- Misc tools: $500/año
- **Total Software: ~$600/año**

### Marketing (Year 1)
- Landing page design: $2,000
- Content marketing: $10,000
- Paid ads: $15,000
- **Total Marketing: $27,000**

### **TOTAL AÑO 1: ~$160,800**

---

## 🎯 Conclusión

Este plan transforma VirtualUni de una aplicación monolítica de demostración a un **SaaS multi-tenant enterprise-ready** en aproximadamente **21 semanas** con un equipo de 2-3 desarrolladores.

### Próximos Pasos Inmediatos

1. **Validación de Mercado** (2 semanas)
   - Entrevistar 20+ instituciones educativas
   - Validar pricing
   - Identificar features críticos

2. **Setup Técnico** (1 semana)
   - Crear repos backend/frontend
   - Setup ambiente desarrollo
   - Definir arquitectura final

3. **Sprint 1** (2 semanas)
   - Backend: Auth + Tenant management
   - Frontend: Landing page + Signup flow

4. **Iteración continua** siguiendo roadmap de fases

---

**Autor**: Plan generado por análisis de arquitectura
**Fecha**: 2025-11-28
**Versión**: 1.0
