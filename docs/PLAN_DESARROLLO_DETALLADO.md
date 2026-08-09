# 📋 PLAN DE DESARROLLO DETALLADO - VirtualUni SaaS
## Roadmap Completo por Semanas con Funcionalidades Específicas de Cada Panel

---

# 📊 ESTADO ACTUAL DEL PROYECTO

## ✅ Backend (100% Completo)
- Multi-tenancy con detección de subdomain
- Sistema de planes (FREE, BASIC, PROFESSIONAL, ENTERPRISE)
- Validación de límites por plan
- 83 endpoints REST funcionando
- Integración Stripe configurada
- Base de datos PostgreSQL con 15 tablas

## 🎨 Frontend (30% Completo)
- ✅ Estructura de componentes creada
- ✅ UI/UX con Tailwind CSS
- ✅ Paneles con sidebars navegables
- ❌ Sin conexión al backend (usando datos mock)
- ❌ Sin autenticación real
- ❌ Sin multi-tenancy en frontend

---

# 🎯 FUNCIONALIDADES DETALLADAS POR PANEL

## 👨‍🎓 PANEL DE ESTUDIANTE

### **1. Inicio / Dashboard**
- [ ] Resumen de cursos activos (con progreso)
- [ ] Tareas pendientes (próximas 7 días)
- [ ] Próximos exámenes
- [ ] Calificaciones recientes
- [ ] Mensajes no leídos
- [ ] Calendario académico personal
- [ ] Noticias y anuncios de la institución
- [ ] Accesos rápidos a funciones principales

### **2. Mis Cursos**
- [ ] Lista de cursos matriculados (cards con colores)
- [ ] Información de cada curso:
  - [ ] Nombre y código del curso
  - [ ] Docente asignado
  - [ ] Horario
  - [ ] Créditos
  - [ ] Progreso del curso (%)
  - [ ] Calificación actual
- [ ] Detalles del curso:
  - [ ] Sílabo/programa
  - [ ] Contenidos por temas
  - [ ] Materiales descargables
  - [ ] Próximas clases
  - [ ] Tareas del curso
- [ ] Búsqueda y filtros (semestre, estado)
- [ ] Vista de calendario de clases

### **3. Clases Virtuales**
- [ ] Lista de clases programadas
- [ ] Clases en vivo (integración Zoom/Meet)
- [ ] Grabaciones de clases pasadas
- [ ] Calendario de clases
- [ ] Recordatorios de clases próximas
- [ ] Chat en vivo durante la clase
- [ ] Compartir pantalla (si está habilitado)

### **4. Tareas**
- [ ] Lista de todas las tareas:
  - [ ] Pendientes (por fecha límite)
  - [ ] Entregadas
  - [ ] Calificadas
  - [ ] Atrasadas (destacadas en rojo)
- [ ] Detalles de cada tarea:
  - [ ] Título y descripción
  - [ ] Curso
  - [ ] Fecha de entrega
  - [ ] Puntos/calificación máxima
  - [ ] Archivos adjuntos del docente
  - [ ] Instrucciones
- [ ] Subir entrega:
  - [ ] Múltiples archivos
  - [ ] Editor de texto
  - [ ] Confirmación de envío
- [ ] Ver retroalimentación del docente
- [ ] Reenviar tarea (si está permitido)
- [ ] Filtros: por curso, por estado, por fecha

### **5. Exámenes**
- [ ] Lista de exámenes programados
- [ ] Exámenes pendientes
- [ ] Exámenes completados
- [ ] Detalles del examen:
  - [ ] Fecha y hora
  - [ ] Duración
  - [ ] Tipo (presencial/virtual)
  - [ ] Temas a evaluar
  - [ ] Material permitido
- [ ] Examen virtual:
  - [ ] Temporizador
  - [ ] Preguntas múltiple opción
  - [ ] Preguntas abiertas
  - [ ] Subir archivos
  - [ ] Guardar progreso
  - [ ] Enviar examen
- [ ] Ver resultados
- [ ] Historial de exámenes

### **6. Calificaciones**
- [ ] Vista general por curso
- [ ] Tabla de calificaciones:
  - [ ] Parciales
  - [ ] Talleres
  - [ ] Proyectos
  - [ ] Exámenes
  - [ ] Nota final
- [ ] Gráfica de rendimiento académico
- [ ] Comparación con promedio del curso
- [ ] Historial de calificaciones por semestre
- [ ] Exportar reporte de calificaciones (PDF)
- [ ] Cálculo automático de promedio ponderado
- [ ] Alertas de bajo rendimiento

### **7. Mensajes / Comunicación**
- [ ] Bandeja de entrada
- [ ] Mensajes enviados
- [ ] Mensajes archivados
- [ ] Redactar nuevo mensaje
- [ ] Destinatarios:
  - [ ] Docentes
  - [ ] Compañeros de clase
  - [ ] Administración
- [ ] Adjuntar archivos
- [ ] Marcar como leído/no leído
- [ ] Búsqueda de mensajes
- [ ] Notificaciones de nuevos mensajes
- [ ] Filtro por remitente/curso

### **8. Trámites Académicos**
- [ ] Solicitar certificados:
  - [ ] Certificado de estudios
  - [ ] Constancia de matrícula
  - [ ] Récord académico
- [ ] Estado de solicitudes
- [ ] Historial de trámites
- [ ] Descargar documentos aprobados
- [ ] Cancelar solicitud pendiente
- [ ] Seguimiento de trámite
- [ ] Notificaciones de estado

### **9. Estado de Cuenta / Financiero**
- [ ] Resumen financiero:
  - [ ] Saldo actual
  - [ ] Pagos realizados
  - [ ] Pagos pendientes
  - [ ] Próximos vencimientos
- [ ] Historial de pagos
- [ ] Descargar comprobantes
- [ ] Conceptos de pago:
  - [ ] Matrícula
  - [ ] Pensiones
  - [ ] Materiales
  - [ ] Certificados
- [ ] Métodos de pago disponibles
- [ ] Plan de pagos
- [ ] Alertas de vencimiento

### **10. Mi Perfil**
- [ ] Información personal:
  - [ ] Foto de perfil
  - [ ] Datos personales (nombre, documento, etc.)
  - [ ] Información de contacto
  - [ ] Dirección
  - [ ] Fecha de nacimiento
- [ ] Información académica:
  - [ ] Código de estudiante
  - [ ] Programa
  - [ ] Semestre
  - [ ] Fecha de ingreso
- [ ] Editar información
- [ ] Cambiar contraseña
- [ ] Configuración de notificaciones
- [ ] Preferencias de privacidad

---

## 👨‍🏫 PANEL DE DOCENTE

### **1. Inicio / Dashboard**
- [ ] Resumen de cursos asignados
- [ ] Próximas clases del día
- [ ] Tareas por calificar (contador)
- [ ] Exámenes pendientes de revisión
- [ ] Estudiantes totales
- [ ] Mensajes no leídos
- [ ] Calendario de actividades
- [ ] Accesos rápidos
- [ ] Estadísticas generales

### **2. Mis Cursos**
- [ ] Lista de cursos asignados
- [ ] Información del curso:
  - [ ] Código y nombre
  - [ ] Número de estudiantes
  - [ ] Horario
  - [ ] Aula asignada
- [ ] Gestión del curso:
  - [ ] Editar información
  - [ ] Subir sílabo
  - [ ] Contenidos y temas
  - [ ] Ver lista de estudiantes
  - [ ] Calificaciones del curso
- [ ] Crear nuevo tema/módulo
- [ ] Organizar contenidos
- [ ] Estadísticas del curso:
  - [ ] Promedio general
  - [ ] Tasa de aprobación
  - [ ] Asistencia promedio

### **3. Estudiantes**
- [ ] Lista completa de estudiantes
- [ ] Filtrar por curso
- [ ] Búsqueda por nombre/código
- [ ] Perfil de estudiante:
  - [ ] Información personal
  - [ ] Cursos matriculados
  - [ ] Historial académico
  - [ ] Calificaciones
  - [ ] Asistencia
  - [ ] Comportamiento
- [ ] Exportar lista de estudiantes
- [ ] Enviar mensaje a estudiante
- [ ] Ver progreso individual
- [ ] Alertas de bajo rendimiento

### **4. Tareas**
- [ ] Crear nueva tarea:
  - [ ] Título y descripción
  - [ ] Curso
  - [ ] Fecha de entrega
  - [ ] Puntos máximos
  - [ ] Adjuntar archivos de instrucciones
  - [ ] Configurar reenvío
- [ ] Lista de tareas creadas:
  - [ ] Por curso
  - [ ] Por estado (activas/cerradas)
  - [ ] Por fecha
- [ ] Ver entregas:
  - [ ] Pendientes de calificar
  - [ ] Calificadas
  - [ ] No entregadas
  - [ ] Atrasadas
- [ ] Calificar entregas:
  - [ ] Asignar puntos
  - [ ] Retroalimentación escrita
  - [ ] Adjuntar archivos de corrección
  - [ ] Permitir reenvío
- [ ] Estadísticas de tarea:
  - [ ] Entregadas vs no entregadas
  - [ ] Promedio de calificaciones
  - [ ] Tiempo promedio de entrega
- [ ] Exportar calificaciones

### **5. Exámenes**
- [ ] Crear examen:
  - [ ] Tipo (presencial/virtual)
  - [ ] Fecha y hora
  - [ ] Duración
  - [ ] Puntos totales
  - [ ] Temas a evaluar
- [ ] Examen virtual:
  - [ ] Banco de preguntas
  - [ ] Preguntas de opción múltiple
  - [ ] Preguntas abiertas
  - [ ] Configurar tiempo
  - [ ] Aleatorizar preguntas
  - [ ] Intentos permitidos
- [ ] Lista de exámenes programados
- [ ] Ver resultados:
  - [ ] Calificaciones individuales
  - [ ] Estadísticas generales
  - [ ] Análisis por pregunta
- [ ] Calificar preguntas abiertas
- [ ] Exportar resultados

### **6. Calificaciones**
- [ ] Libro de calificaciones:
  - [ ] Vista de tabla por estudiante
  - [ ] Columnas configurables
  - [ ] Parciales
  - [ ] Tareas
  - [ ] Exámenes
  - [ ] Nota final
- [ ] Ingresar calificaciones:
  - [ ] Individual
  - [ ] Masivo (importar CSV)
  - [ ] Por actividad
- [ ] Configurar pesos de evaluación
- [ ] Cálculo automático de promedios
- [ ] Gráficas de distribución
- [ ] Identificar estudiantes en riesgo
- [ ] Exportar libro de calificaciones
- [ ] Publicar calificaciones

### **7. Asistencia**
- [ ] Tomar asistencia:
  - [ ] Por curso
  - [ ] Por fecha
  - [ ] Lista de estudiantes
  - [ ] Marcar presente/ausente/tardanza
- [ ] Historial de asistencia
- [ ] Reporte de asistencia por estudiante
- [ ] Estadísticas de asistencia
- [ ] Alertas de inasistencias
- [ ] Exportar reporte
- [ ] Justificaciones de inasistencias

### **8. Mensajes**
- [ ] Bandeja de entrada
- [ ] Mensajes enviados
- [ ] Redactar mensaje:
  - [ ] Individual a estudiante
  - [ ] Grupal a curso completo
  - [ ] A todos los cursos
- [ ] Adjuntar archivos
- [ ] Plantillas de mensajes
- [ ] Programar envío
- [ ] Confirmación de lectura

### **9. Materiales / Recursos**
- [ ] Subir materiales:
  - [ ] PDFs, documentos
  - [ ] Presentaciones
  - [ ] Videos
  - [ ] Enlaces externos
- [ ] Organizar por curso/tema
- [ ] Establecer visibilidad
- [ ] Compartir con estudiantes
- [ ] Estadísticas de descarga
- [ ] Versionado de archivos
- [ ] Búsqueda de materiales

### **10. Calendario**
- [ ] Vista mensual/semanal
- [ ] Eventos de clases
- [ ] Fechas de exámenes
- [ ] Entregas de tareas
- [ ] Reuniones
- [ ] Crear nuevo evento
- [ ] Editar/eliminar eventos
- [ ] Notificaciones de eventos
- [ ] Sincronizar con Google Calendar

### **11. Analíticas / Reportes**
- [ ] Rendimiento por curso:
  - [ ] Promedio general
  - [ ] Distribución de calificaciones
  - [ ] Tasa de aprobación
- [ ] Comparación entre cursos
- [ ] Tendencias de rendimiento
- [ ] Asistencia general
- [ ] Participación de estudiantes
- [ ] Gráficas interactivas
- [ ] Exportar reportes (PDF/Excel)
- [ ] Dashboard personalizable

### **12. Configuración**
- [ ] Preferencias del docente
- [ ] Horarios de disponibilidad
- [ ] Notificaciones
- [ ] Plantillas personalizadas
- [ ] Firma de correos
- [ ] Privacidad

---

## 👨‍💼 PANEL DE ADMINISTRADOR DEL TENANT

### **1. Dashboard Principal**
- [ ] KPIs principales:
  - [ ] Total de estudiantes (vs límite del plan)
  - [ ] Total de docentes (vs límite)
  - [ ] Total de cursos (vs límite)
  - [ ] Almacenamiento usado (vs límite)
- [ ] Gráfica de tendencias
- [ ] Actividad reciente
- [ ] Alertas del sistema
- [ ] Estado de la suscripción
- [ ] Próximo pago
- [ ] Accesos rápidos

### **2. Gestión de Estudiantes**
- [ ] Lista completa de estudiantes
- [ ] Crear nuevo estudiante
- [ ] Importar estudiantes (CSV/Excel)
- [ ] Editar información
- [ ] Desactivar/eliminar estudiante
- [ ] Resetear contraseña
- [ ] Ver historial académico
- [ ] Exportar datos
- [ ] Búsqueda avanzada
- [ ] Filtros múltiples
- [ ] Acciones masivas
- [ ] **Validación de límite del plan**

### **3. Gestión de Docentes**
- [ ] Lista de docentes
- [ ] Crear nuevo docente
- [ ] Importar docentes
- [ ] Asignar cursos
- [ ] Editar información
- [ ] Desactivar docente
- [ ] Ver carga académica
- [ ] Estadísticas de docente
- [ ] Exportar datos
- [ ] **Validación de límite del plan**

### **4. Gestión de Cursos**
- [ ] Lista de todos los cursos
- [ ] Crear nuevo curso
- [ ] Importar cursos
- [ ] Asignar docente
- [ ] Configurar horarios
- [ ] Matricular estudiantes
- [ ] Ver estudiantes matriculados
- [ ] Editar información del curso
- [ ] Cerrar/abrir curso
- [ ] Copiar curso de semestre anterior
- [ ] Estadísticas del curso
- [ ] **Validación de límite del plan**

### **5. Matriculación**
- [ ] Proceso de matriculación:
  - [ ] Seleccionar estudiante
  - [ ] Seleccionar curso
  - [ ] Confirmar matrícula
- [ ] Matriculación masiva
- [ ] Desmatricular estudiante
- [ ] Cambio de curso
- [ ] Historial de matrículas
- [ ] Reportes de matriculación
- [ ] Períodos académicos

### **6. Configuración del Tenant**
- [ ] Información general:
  - [ ] Nombre de la institución
  - [ ] Logo
  - [ ] Colores corporativos
  - [ ] Subdomain
  - [ ] Custom domain
- [ ] Datos de contacto
- [ ] Configuración de email
- [ ] Plantillas de correos
- [ ] Términos y condiciones
- [ ] Políticas de privacidad

### **7. Gestión de Usuarios y Roles**
- [ ] Lista de usuarios del tenant
- [ ] Crear administrador adicional
- [ ] Asignar roles:
  - [ ] TENANT_ADMIN
  - [ ] TEACHER
  - [ ] STUDENT
- [ ] Permisos por rol
- [ ] Activar/desactivar usuarios
- [ ] Historial de accesos
- [ ] Sesiones activas

### **8. Facturación y Suscripción**
- [ ] Plan actual
- [ ] Características del plan
- [ ] Límites y uso actual:
  - [ ] Estudiantes: X/Y
  - [ ] Docentes: X/Y
  - [ ] Cursos: X/Y
  - [ ] Almacenamiento: X/Y GB
- [ ] Historial de pagos
- [ ] Descargar facturas
- [ ] Cambiar plan (Upgrade/Downgrade)
- [ ] Método de pago
- [ ] Próximo pago
- [ ] Cancelar suscripción
- [ ] Portal de Stripe embebido

### **9. Certificados**
- [ ] Plantillas de certificados
- [ ] Crear certificado
- [ ] Asignar certificado a estudiante
- [ ] Generar certificados masivos
- [ ] Historial de certificados emitidos
- [ ] Verificar autenticidad
- [ ] Descargar certificado
- [ ] **Feature bloqueada según plan**

### **10. Reportes y Analíticas**
- [ ] Dashboard de analíticas
- [ ] Reportes académicos:
  - [ ] Rendimiento general
  - [ ] Tasas de aprobación
  - [ ] Asistencia
- [ ] Reportes financieros
- [ ] Reportes de uso del sistema
- [ ] Exportar reportes
- [ ] Programar reportes automáticos
- [ ] Gráficas personalizadas

### **11. Comunicaciones**
- [ ] Anuncios generales
- [ ] Notificaciones masivas
- [ ] Email a grupos:
  - [ ] Todos los estudiantes
  - [ ] Todos los docentes
  - [ ] Por curso
  - [ ] Por semestre
- [ ] Plantillas de mensajes
- [ ] Historial de comunicaciones
- [ ] Estadísticas de apertura

### **12. Configuración Avanzada**
- [ ] Período académico actual
- [ ] Crear nuevo período
- [ ] Configurar semestres
- [ ] Días festivos
- [ ] Horarios de atención
- [ ] Integraciones (Zoom, Google, etc.)
- [ ] Webhooks
- [ ] API tokens
- [ ] Logs de actividad
- [ ] Backups

---

# 📅 PLAN SEMANAL DETALLADO

## 🔷 SEMANA 1: Setup y Autenticación Multi-Tenant

### **Objetivos:**
Configurar la base del frontend con autenticación real conectada al backend SaaS.

### **Tareas Frontend:**
1. **Configuración del Proyecto** (8 horas)
   - [ ] Instalar dependencias adicionales:
     ```bash
     npm install @tanstack/react-query axios zustand
     npm install @tanstack/react-query-devtools
     npm install react-hook-form zod @hookform/resolvers
     ```
   - [ ] Configurar estructura de carpetas:
     ```
     src/
     ├── api/           # Cliente API y endpoints
     ├── store/         # Estado global (Zustand)
     ├── hooks/         # Custom hooks
     ├── utils/         # Utilidades
     ├── types/         # TypeScript types
     └── config/        # Configuración
     ```

2. **Cliente API con Axios** (6 horas)
   - [ ] Crear `src/api/client.ts`:
     - Base URL desde variable de entorno
     - Interceptor para agregar token JWT
     - Interceptor para agregar `X-Tenant-ID` header
     - Manejo de errores global
     - Refresh token automático
   - [ ] Crear `src/api/endpoints/auth.ts`:
     - login(email, password, tenantId)
     - register(data, tenantId)
     - refreshToken()
     - logout()
   - [ ] Crear tipos TypeScript para requests/responses

3. **Estado Global con Zustand** (4 horas)
   - [ ] Crear `src/store/authStore.ts`:
     - user (datos del usuario autenticado)
     - token (JWT access token)
     - refreshToken
     - tenantId
     - isAuthenticated
     - login(), logout(), setUser()
   - [ ] Crear `src/store/tenantStore.ts`:
     - tenant (datos del tenant actual)
     - setTenant()
     - clearTenant()
   - [ ] Persistencia en localStorage

4. **Detección de Tenant** (8 horas)
   - [ ] Crear `src/utils/tenantDetection.ts`:
     - Extraer subdomain de la URL
     - Validar subdomain
     - Llamar API para obtener tenant por subdomain
     - Guardar tenant en store
   - [ ] Implementar en App.tsx:
     - useEffect para detectar tenant al cargar
     - Mostrar loader mientras detecta
     - Mostrar error si tenant no existe
     - Redireccionar al login del tenant

5. **Página de Login Funcional** (8 horas)
   - [ ] Refactorizar `src/pages/Login.tsx`:
     - Conectar con API real (no mock)
     - Validación con React Hook Form + Zod
     - Mostrar tenant detectado
     - Manejo de errores:
       - Credenciales incorrectas
       - Tenant no existe
       - Usuario inactivo
       - Error de red
     - Loading states
     - Redirección según rol:
       - STUDENT → /estudiante
       - TEACHER → /docente
       - TENANT_ADMIN → /admin
       - SUPER_ADMIN → /super-admin

6. **Protección de Rutas** (6 horas)
   - [ ] Crear `src/components/ProtectedRoute.tsx`:
     - Verificar si usuario está autenticado
     - Verificar rol del usuario
     - Redireccionar a login si no autenticado
     - Mostrar 403 si no tiene permisos
   - [ ] Aplicar a todas las rutas privadas en App.tsx

### **Tareas Backend:**
- [ ] Verificar que CORS acepta `http://localhost:3000` ✅ (ya hecho)
- [ ] Endpoint para obtener tenant por subdomain:
  - `GET /api/v1/tenants/by-subdomain/:subdomain`

### **Entregables Semana 1:**
✅ Login funcional conectado al backend
✅ Detección automática de tenant
✅ Tokens JWT guardados y enviados en requests
✅ Rutas protegidas por autenticación y rol
✅ Redirección automática según rol

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 2: Dashboard Multi-Tenant y Branding

### **Objetivos:**
Implementar branding dinámico por tenant y dashboards básicos para cada rol.

### **Tareas:**

1. **Branding Dinámico** (10 horas)
   - [ ] Crear hook `useTenantBranding.ts`:
     - Cargar colores del tenant desde API
     - Cargar logo
     - Aplicar colores CSS
   - [ ] Crear componente `TenantLogo.tsx`
   - [ ] Actualizar sidebars con colores del tenant
   - [ ] CSS variables para theming:
     ```css
     :root {
       --tenant-primary: #3B82F6;
       --tenant-secondary: #8B5CF6;
     }
     ```

2. **API Endpoints** (6 horas)
   - [ ] Crear `src/api/endpoints/students.ts`
   - [ ] Crear `src/api/endpoints/teachers.ts`
   - [ ] Crear `src/api/endpoints/courses.ts`
   - [ ] Crear `src/api/endpoints/tenants.ts`

3. **Dashboard de Estudiante** (12 horas)
   - [ ] Refactorizar `InicioSection.tsx`:
     - Conectar a API real
     - Cargar cursos del estudiante
     - Cargar tareas pendientes
     - Cargar próximos exámenes
     - Calificaciones recientes
     - Gráficas con Chart.js/Recharts
   - [ ] Loading states con skeletons
   - [ ] Error handling
   - [ ] Refresh data button

4. **Dashboard de Docente** (12 horas)
   - [ ] Refactorizar `InicioSection.tsx` (teacher):
     - Cargar cursos asignados
     - Tareas por calificar
     - Próximas clases
     - Estadísticas generales
     - Mensajes recientes
     - Gráficas de rendimiento

### **Entregables Semana 2:**
✅ Branding dinámico funcionando
✅ Dashboard estudiante con datos reales
✅ Dashboard docente con datos reales
✅ Loading y error states

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 3: Gestión de Estudiantes y Docentes (Admin)

### **Objetivos:**
CRUD completo de estudiantes y docentes desde el panel de administrador.

### **Tareas:**

1. **Panel de Administrador - Base** (8 horas)
   - [ ] Crear estructura del AdminDashboard
   - [ ] Sidebar de administrador
   - [ ] Header con info del tenant
   - [ ] Navegación entre secciones

2. **CRUD de Estudiantes** (16 horas)
   - [ ] Lista de estudiantes:
     - Tabla con paginación
     - Búsqueda
     - Filtros (programa, semestre, estado)
     - Acciones (editar, eliminar, ver)
   - [ ] Formulario crear estudiante:
     - Validación
     - Verificar límite del plan
     - Modal de confirmación
   - [ ] Formulario editar estudiante
   - [ ] Eliminar estudiante con confirmación
   - [ ] Importar CSV
   - [ ] Exportar Excel

3. **CRUD de Docentes** (16 horas)
   - [ ] Lista de docentes
   - [ ] Formulario crear docente
   - [ ] Verificar límite del plan
   - [ ] Formulario editar docente
   - [ ] Eliminar docente
   - [ ] Ver cursos asignados
   - [ ] Importar/Exportar

### **Componentes a Crear:**
- [ ] `StudentTable.tsx`
- [ ] `StudentForm.tsx`
- [ ] `StudentModal.tsx`
- [ ] `TeacherTable.tsx`
- [ ] `TeacherForm.tsx`
- [ ] `LimitWarning.tsx` (alerta cuando se acerca al límite)

### **Entregables Semana 3:**
✅ CRUD estudiantes completo
✅ CRUD docentes completo
✅ Validación de límites del plan
✅ Importación/Exportación CSV

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 4: Gestión de Cursos y Matriculación

### **Objetivos:**
CRUD de cursos y sistema de matriculación.

### **Tareas:**

1. **CRUD de Cursos (Admin)** (16 horas)
   - [ ] Lista de cursos
   - [ ] Crear curso:
     - Asignar docente (verificar disponibilidad)
     - Horarios
     - Validar límite del plan
   - [ ] Editar curso
   - [ ] Eliminar curso (validar que no tenga estudiantes)
   - [ ] Ver estudiantes matriculados

2. **Sistema de Matriculación** (12 horas)
   - [ ] Matricular estudiante a curso:
     - Modal de selección
     - Validar cupo
     - Validar conflictos de horario
     - Confirmación
   - [ ] Desmatricular estudiante
   - [ ] Matriculación masiva (CSV)
   - [ ] Ver historial de matrículas

3. **Vista de Cursos (Estudiante)** (12 horas)
   - [ ] Refactorizar `CursosSection.tsx`:
     - Cards de cursos matriculados
     - Información completa del curso
     - Progreso
     - Materiales
     - Temas/contenidos
     - Próximas clases

### **Entregables Semana 4:**
✅ CRUD cursos funcionando
✅ Sistema de matriculación
✅ Vista de cursos para estudiantes
✅ Validaciones completas

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 5: Sistema de Tareas y Entregas

### **Objetivos:**
Sistema completo de tareas: crear, entregar, calificar.

### **Tareas:**

1. **Crear Tareas (Docente)** (12 horas)
   - [ ] Formulario de nueva tarea:
     - Información básica
     - Fecha límite
     - Puntos
     - Adjuntar archivos
   - [ ] Lista de tareas creadas
   - [ ] Editar tarea
   - [ ] Eliminar tarea
   - [ ] Cerrar/abrir tarea

2. **Sistema de Entregas (Backend)** (8 horas)
   - [ ] Implementar file upload:
     - Multer en NestJS
     - Validación de tipos de archivo
     - Validación de tamaño
     - Guardar en filesystem o S3
     - Validar límite de almacenamiento del plan
   - [ ] Endpoints:
     - POST /api/v1/uploads
     - GET /api/v1/uploads/:id
     - DELETE /api/v1/uploads/:id

3. **Entregar Tareas (Estudiante)** (10 horas)
   - [ ] Ver tareas del curso
   - [ ] Modal de entrega:
     - Subir archivos
     - Editor de texto
     - Confirmación
   - [ ] Ver entregas realizadas
   - [ ] Reenviar tarea
   - [ ] Ver retroalimentación

4. **Calificar Tareas (Docente)** (10 horas)
   - [ ] Lista de entregas:
     - Por calificar
     - Calificadas
     - No entregadas
   - [ ] Formulario de calificación:
     - Asignar puntos
     - Retroalimentación
     - Adjuntar archivos de corrección
   - [ ] Exportar calificaciones

### **Entregables Semana 5:**
✅ Sistema de tareas completo
✅ File upload funcionando
✅ Entregas de estudiantes
✅ Calificación de docentes

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 6: Sistema de Calificaciones

### **Objetivos:**
Libro de calificaciones completo.

### **Tareas:**

1. **Libro de Calificaciones (Docente)** (20 horas)
   - [ ] Tabla de calificaciones:
     - Filas: estudiantes
     - Columnas: evaluaciones
     - Editable inline
   - [ ] Configurar ponderación
   - [ ] Cálculo automático de nota final
   - [ ] Importar calificaciones (CSV)
   - [ ] Exportar calificaciones
   - [ ] Gráficas de distribución
   - [ ] Publicar calificaciones

2. **Vista de Calificaciones (Estudiante)** (10 horas)
   - [ ] Tabla de calificaciones por curso
   - [ ] Gráfica de rendimiento
   - [ ] Comparación con promedio
   - [ ] Historial por semestre
   - [ ] Exportar reporte PDF

3. **API de Calificaciones** (10 horas)
   - [ ] Endpoints adicionales si faltan
   - [ ] Validaciones
   - [ ] Cálculos automáticos

### **Entregables Semana 6:**
✅ Libro de calificaciones funcional
✅ Vista de estudiante
✅ Gráficas y estadísticas
✅ Exportación de reportes

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 7: Mensajería y Notificaciones

### **Objetivos:**
Sistema de mensajería interno y notificaciones por email.

### **Tareas:**

1. **Mensajería Frontend** (16 horas)
   - [ ] Bandeja de entrada
   - [ ] Mensajes enviados
   - [ ] Redactar mensaje:
     - Autocompletar destinatarios
     - Adjuntar archivos
   - [ ] Ver conversaciones
   - [ ] Marcar como leído
   - [ ] Notificación en tiempo real (opcional WebSocket)

2. **Notificaciones por Email (Backend)** (12 horas)
   - [ ] Configurar SMTP (Nodemailer)
   - [ ] Templates de emails (Handlebars)
   - [ ] Queue de emails (Bull/Redis opcional)
   - [ ] Enviar emails en eventos:
     - Nueva tarea asignada
     - Calificación publicada
     - Nuevo mensaje
     - Próximo vencimiento
     - Cambio de plan

3. **Preferencias de Notificaciones** (12 horas)
   - [ ] Configuración por usuario:
     - Email activado/desactivado
     - Tipos de notificaciones
     - Frecuencia
   - [ ] Guardar preferencias
   - [ ] Respetar preferencias en envíos

### **Entregables Semana 7:**
✅ Mensajería funcional
✅ Notificaciones por email
✅ Preferencias configurables

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 8: Integración Stripe Completa

### **Objetivos:**
Portal de facturación y sistema de pagos.

### **Tareas:**

1. **Configurar Stripe en Producción** (4 horas)
   - [ ] Crear cuenta Stripe
   - [ ] Crear productos:
     - Basic Plan ($29/mes)
     - Professional Plan ($99/mes)
     - Enterprise Plan ($299/mes)
   - [ ] Copiar Price IDs al .env
   - [ ] Configurar webhooks

2. **Frontend - Planes y Precios** (8 horas)
   - [ ] Página pública de planes
   - [ ] Tabla comparativa
   - [ ] Botón "Suscribirse"
   - [ ] Redirección a Stripe Checkout

3. **Frontend - Portal de Facturación (Admin)** (16 horas)
   - [ ] Vista de plan actual
   - [ ] Uso vs límites (gráficas)
   - [ ] Cambiar plan (upgrade/downgrade)
   - [ ] Historial de pagos
   - [ ] Descargar facturas
   - [ ] Método de pago
   - [ ] Cancelar suscripción
   - [ ] Stripe Customer Portal embebido

4. **Backend - Webhooks** (8 horas)
   - [ ] Probar webhooks en desarrollo (Stripe CLI)
   - [ ] Manejar eventos:
     - checkout.session.completed
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.paid
     - invoice.payment_failed
   - [ ] Actualizar estado del tenant según eventos

5. **Testing de Pagos** (4 horas)
   - [ ] Tarjetas de prueba
   - [ ] Flujo completo de suscripción
   - [ ] Cambio de plan
   - [ ] Cancelación

### **Entregables Semana 8:**
✅ Stripe Checkout funcional
✅ Portal de facturación
✅ Webhooks procesando eventos
✅ Cambio de planes

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 9: Límites y Features por Plan

### **Objetivos:**
Sistema completo de validación de límites y features bloqueadas.

### **Tareas:**

1. **Validación de Límites en Frontend** (16 horas)
   - [ ] Hook `usePlanLimits.ts`:
     - Cargar límites del tenant
     - Validar antes de crear recurso
     - Mostrar alerta si alcanza límite
   - [ ] Componente `LimitReachedModal.tsx`:
     - Mostrar cuando se alcanza límite
     - Botón "Upgrade Plan"
     - Detalles del plan actual vs superior
   - [ ] Indicadores de uso:
     - Progress bars en dashboard admin
     - Colores (verde/amarillo/rojo)
     - Porcentajes

2. **Feature Flags** (12 horas)
   - [ ] Hook `useFeatureFlag.ts`:
     - Verificar si feature está habilitada
   - [ ] Componentes bloqueados:
     - Mostrar "lock" icon
     - Tooltip "Disponible en plan X"
     - Redireccionar a upgrade
   - [ ] Features a validar:
     - Mensajería (todos los planes) ✅
     - Videoconferencia (BASIC+)
     - Pagos (PROFESSIONAL+)
     - Certificados (BASIC+)

3. **Modal de Upgrade** (12 horas)
   - [ ] Componente `UpgradeModal.tsx`
   - [ ] Comparación de planes
   - [ ] Call-to-action claro
   - [ ] Redirección a Stripe Checkout

### **Entregables Semana 9:**
✅ Validación de límites completa
✅ Features bloqueadas según plan
✅ Sistema de upgrade UX

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 10: Testing Backend

### **Objetivos:**
Suite completa de tests backend.

### **Tareas:**

1. **Unit Tests** (20 horas)
   - [ ] Tests de servicios:
     - TenantsService
     - StudentsService
     - TeachersService
     - CoursesService
     - AuthService
   - [ ] Tests de guards:
     - TenantGuard
     - ResourceLimitGuard
     - FeatureGuard
   - [ ] Mocks de Prisma
   - [ ] Coverage >80%

2. **Integration Tests** (12 horas)
   - [ ] Tests de endpoints:
     - /api/v1/auth/*
     - /api/v1/students/*
     - /api/v1/courses/*
     - /api/v1/billing/*
   - [ ] Tests de multi-tenancy
   - [ ] Tests de validación de límites

3. **Security Tests** (8 horas)
   - [ ] SQL injection prevention
   - [ ] XSS prevention
   - [ ] CSRF tokens
   - [ ] Rate limiting
   - [ ] Input sanitization

### **Entregables Semana 10:**
✅ Suite de tests backend (>80% coverage)
✅ Integration tests pasando
✅ Security audit básico

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 11: Testing Frontend y E2E

### **Objetivos:**
Tests de frontend y end-to-end.

### **Tareas:**

1. **Component Tests** (16 horas)
   - [ ] Tests de componentes clave:
     - Login
     - StudentDashboard
     - TeacherDashboard
     - Forms (StudentForm, CourseForm, etc.)
   - [ ] Testing Library
   - [ ] Mocks de API

2. **E2E Tests con Playwright** (16 horas)
   - [ ] Configurar Playwright
   - [ ] Tests de flujos críticos:
     - Login y navegación
     - Crear estudiante
     - Crear curso
     - Matricular estudiante
     - Crear tarea
     - Entregar tarea
     - Calificar tarea
     - Checkout de Stripe
   - [ ] Tests multi-tenant

3. **Performance Testing** (8 horas)
   - [ ] Lighthouse scores
   - [ ] Load testing (100 usuarios)
   - [ ] Optimizaciones
   - [ ] Code splitting
   - [ ] Lazy loading

### **Entregables Semana 11:**
✅ Component tests
✅ E2E tests de flujos principales
✅ Performance optimizado

**Tiempo total:** 40 horas

---

## 🔷 SEMANA 12: DevOps y Deployment a Producción

### **Objetivos:**
Desplegar la aplicación en producción con CI/CD.

### **Tareas:**

1. **Dockerización** (8 horas)
   - [ ] Dockerfile para backend
   - [ ] Dockerfile para frontend
   - [ ] docker-compose.yml:
     - Backend
     - Frontend
     - PostgreSQL
     - Redis (opcional)
     - Nginx

2. **CI/CD con GitHub Actions** (8 horas)
   - [ ] Pipeline de testing:
     - Run tests en cada PR
     - Lint check
     - Build check
   - [ ] Pipeline de deployment:
     - Build Docker images
     - Push a registry
     - Deploy a servidor

3. **Configuración de Servidor** (12 horas)
   - [ ] Servidor (AWS/DigitalOcean)
   - [ ] Configurar PostgreSQL
   - [ ] SSL con Let's Encrypt
   - [ ] Nginx reverse proxy:
     - Backend en /api
     - Frontend en /
     - Configurar CORS
   - [ ] DNS y subdomains wildcard (*.tuapp.com)

4. **Monitoreo** (8 horas)
   - [ ] Configurar Sentry (error tracking)
   - [ ] Uptime monitoring
   - [ ] Logs centralizados
   - [ ] Alertas por email/Slack

5. **Backups** (4 horas)
   - [ ] Backups automáticos de PostgreSQL
   - [ ] Backup de archivos
   - [ ] Procedimiento de restauración
   - [ ] Testing de backups

### **Entregables Semana 12:**
✅ Aplicación en producción
✅ CI/CD funcionando
✅ Monitoreo activo
✅ Backups configurados
✅ **LANZAMIENTO** 🚀

**Tiempo total:** 40 horas

---

# 📊 RESUMEN EJECUTIVO

## Tiempo Total: **12 Semanas (480 horas)**

### Por Fase:
- **Frontend Core (Semanas 1-4):** 160 horas (33%)
- **Funcionalidades (Semanas 5-7):** 120 horas (25%)
- **Billing (Semanas 8-9):** 80 horas (17%)
- **Testing (Semanas 10-11):** 80 horas (17%)
- **DevOps (Semana 12):** 40 horas (8%)

### Recursos Necesarios:
- **1 Desarrollador Full-Stack:** 12 semanas full-time
- **2 Desarrolladores:** 6 semanas
- **3 Desarrolladores:** 4 semanas

### Costos Estimados:
- **Desarrollo:** $14,400 - $48,000 (según seniority)
- **Infraestructura:** $100-400/mes
- **Servicios:** Stripe (comisiones), Email, SSL, etc.

---

# ✅ CHECKLIST DE FUNCIONALIDADES

## Panel Estudiante (10 secciones)
- [ ] Dashboard / Inicio
- [ ] Mis Cursos
- [ ] Clases Virtuales
- [ ] Tareas
- [ ] Exámenes
- [ ] Calificaciones
- [ ] Mensajes
- [ ] Trámites
- [ ] Estado de Cuenta
- [ ] Mi Perfil

## Panel Docente (12 secciones)
- [ ] Dashboard / Inicio
- [ ] Mis Cursos
- [ ] Estudiantes
- [ ] Tareas
- [ ] Exámenes
- [ ] Calificaciones
- [ ] Asistencia
- [ ] Mensajes
- [ ] Materiales
- [ ] Calendario
- [ ] Analíticas
- [ ] Configuración

## Panel Admin (12 secciones)
- [ ] Dashboard Principal
- [ ] Gestión de Estudiantes
- [ ] Gestión de Docentes
- [ ] Gestión de Cursos
- [ ] Matriculación
- [ ] Configuración Tenant
- [ ] Usuarios y Roles
- [ ] Facturación
- [ ] Certificados
- [ ] Reportes
- [ ] Comunicaciones
- [ ] Configuración Avanzada

## Features Técnicas
- [ ] Multi-tenancy en frontend
- [ ] Branding dinámico
- [ ] Autenticación JWT
- [ ] Validación de límites
- [ ] Feature flags por plan
- [ ] File uploads
- [ ] Notificaciones email
- [ ] Integración Stripe
- [ ] Exportación CSV/Excel/PDF
- [ ] Gráficas y estadísticas
- [ ] Responsive design
- [ ] Testing (>70% coverage)
- [ ] CI/CD pipeline
- [ ] Monitoring y logs

---

# 🎯 PRÓXIMO PASO

Este plan está guardado en:
```
C:\VirtualUni-main\PLAN_DESARROLLO_DETALLADO.md
```

**¿Quieres empezar con la Semana 1 ahora?** 🚀

Podemos comenzar con:
1. Configurar el cliente API
2. Implementar el login real
3. Detección de tenant

¿Empezamos? 💪
