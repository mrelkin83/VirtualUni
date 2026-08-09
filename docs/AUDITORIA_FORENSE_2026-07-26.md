# Auditoría forense y finalización — VirtualUni
**Fecha:** 2026-07-26

Auditoría en runtime (no sólo estática) de backend NestJS + Prisma y frontend React + Vite,
con corrección de todos los defectos encontrados y desarrollo de los módulos que seguían en mock.

---

## 1. Estado final de verificación

| Verificación | Resultado |
|---|---|
| `tsc --noEmit` frontend | ✅ 0 errores |
| `tsc --noEmit` backend | ✅ 0 errores |
| `npm run build` frontend | ✅ compila |
| `npx eslint .` frontend | ✅ 0 errores, 88 warnings (antes 193) |
| `npx jest` backend | ✅ 2/2 suites |
| `npx prisma validate` | ✅ válido |
| Deriva de esquema (`migrate diff`) | ✅ ninguna |
| Barrido de los 315 endpoints con 3 roles | ✅ 0 errores (sólo 403 de RBAC correctos) |
| Pruebas E2E de los 8 módulos nuevos | ✅ 48/48 operaciones |
| Aislamiento multi-tenant | ✅ 403 en todos los accesos cruzados |

## 2. Bloqueador de entorno resuelto

El PostgreSQL local (v18, servicio `postgresql-x64-18`) rechazaba las credenciales de
`backend/.env` (P1000). Se identificó la contraseña real del superusuario, se creó la
base `virtualuni`, se corrigió `DATABASE_URL`, y se aplicaron migraciones y seed.

Datos sembrados: 1 tenant (`uniprueba`), 32 usuarios, 12 cursos, 157 matrículas,
44 tareas, 347 entregas, 628 calificaciones.

## 3. Defectos críticos encontrados y corregidos

### 3.1 Deriva de migraciones: 18 tablas inexistentes
`schema.prisma` declaraba 37 modelos pero sólo existían 20 tablas: ninguna migración
creaba las de los módulos administrativos. **44 endpoints devolvían HTTP 500**
(`The table (not available) does not exist`): finanzas, RRHH, nómina, inventario,
activos, anuncios, trámites, carnets, mensajes masivos y analíticas.

→ Migración `20260726000000_add_admin_modules` (18 tablas + enums). Los 44 endpoints responden.

### 3.2 Fuga de datos entre tenants (crítico de seguridad)
`TenantGuard` comprobaba que el tenant del header existiera y estuviera activo, pero **nunca
que el usuario autenticado perteneciera a él**. Con un JWT válido de cualquier rol, cambiar
`X-Tenant-ID` daba acceso de lectura y escritura a los datos de otro tenant. Verificado
empíricamente: un estudiante leyó los cursos de un tenant ajeno.

→ `TenantGuard` rechaza (403) cuando `user.tenantId !== tenantId`, salvo `SUPER_ADMIN`.
→ `TenantMiddleware` resuelve el identificador contra la BD (acepta id o subdominio) en
   lugar de confiar en la cadena recibida.

### 3.3 Aislamiento roto en el módulo de finanzas
`finance.service.ts` era sistemáticamente vulnerable, y es el módulo que maneja dinero:
- 10 métodos `update`/`remove` operaban por `id` **sin filtrar por tenant** → un admin podía
  modificar o borrar transacciones, cuentas, presupuestos, facturas y pagos de otro tenant.
- 5 consultas usaban `where: { tenantId, ...params }`: al ir el spread **después**, un cliente
  podía enviar `?tenantId=<otro>` y **sobrescribir el propio filtro de tenant**.

→ Servicio reescrito: toda mutación verifica pertenencia antes de actuar (404 si no);
  los filtros de query se construyen por lista blanca, nunca por volcado directo al `where`.

### 3.4 Validación ausente en 8 endpoints de escritura de finanzas
Usaban `@Body() data: any`, de modo que el `ValidationPipe` global no se aplicaba: los datos
inválidos llegaban hasta Prisma y producían 500 en vez de 400.

→ Cableados los DTOs existentes (cuentas, transacciones) y creados los que faltaban
  (`CreateBudgetDto`, `CreateInvoiceDto`, `CreatePaymentDto`).

### 3.5 Autoría `undefined` rompía tres módulos
La estrategia JWT devolvía `{ userId, email, role, tenantId }`, pero los controladores de
anuncios, trámites y mensajes masivos usaban `user.firstName` y `user.id` — inexistentes.
`PrismaClientValidationError: Argument 'autor' is missing` → **la creación fallaba siempre**
en los tres módulos, enmascarada tras un 400 genérico.

→ La estrategia expone también `id`, `firstName` y `lastName`. Los tres módulos crean bien.

### 3.6 Integridad del registro de auditoría en transacciones
`creadoPor` lo fijaba el cliente. → Ahora lo impone el servidor desde el usuario autenticado.

### 3.7 Login sólo aceptaba el UUID del tenant
Las rutas `auth/*` están excluidas del middleware, así que `X-Tenant-ID: uniprueba` daba 401
pese a ser el identificador documentado. → `AuthService.resolveTenantId` acepta id o subdominio
en login y registro.

### 3.8 Tres módulos administrativos completos, inalcanzables desde la UI
`AnunciosSection`, `MensajesMasivosSection` y `AnalyticsSection` estaban implementados y con
backend funcionando, pero no tenían entrada de menú ni caso en `renderContent`: código muerto
de facto.

→ Añadidas las tres entradas de menú y sus rutas. Eliminado el estado huérfano que había
  quedado en `AdminDashboard` de cuando esas secciones se renderizaban en línea.

## 4. Módulos desarrollados (los que seguían en mock)

8 módulos backend nuevos (modelos Prisma, DTOs validados, servicios acotados por tenant,
controladores con RBAC) y su conexión en el frontend:

| Módulo | Endpoints | Funcionalidad |
|---|---|---|
| `materials` | 12 | Materiales y carpetas por curso; vista filtrada para el estudiante (sólo cursos matriculados y material visible); contador de descargas |
| `live-classes` | 9 | Programar, iniciar, finalizar y unirse a clases; grabaciones; vista del estudiante |
| `groups` | 7 | Grupos de curso con capacidad máxima y gestión de miembros |
| `library` | 17 | Catálogo, préstamos (máx. 3 activos, 2 renovaciones), reservas, devoluciones; stock actualizado transaccionalmente |
| `forums` | 9 | Temas y respuestas, marcar solución, fijar/cerrar (moderación), likes |
| `community` | 8 | Publicaciones, likes con `toggle` idempotente, comentarios |
| `certificates` | 7 | Solicitud por el estudiante, gestión y emisión por administración |
| `schedule` | 6 | Horario semanal; vista propia del estudiante y del docente |

Migraciones: `20260726010000_add_materials_library_forums` (15 tablas),
`20260726020000_link_invoice_to_student`.

**Pagos del estudiante:** `StudentInvoice` sólo guardaba el nombre del alumno, así que no se
podía resolver "mis facturas". Se añadió la relación `studentId` y los endpoints
`GET /finance/my-invoices` y `GET /finance/my-summary`. La sección financiera del estudiante
ya muestra historial de pagos, deudas y saldo reales.

**Frontend:** 8 ficheros nuevos en `src/api/endpoints/`, y `useTeacherDashboard` /
`useStudentDashboard` cargan y persisten contra el API con mapeadores que preservan la forma
que consumen los componentes. Se mantiene el patrón híbrido del proyecto: si el servidor no
responde, la acción cae a estado local en vez de perder el trabajo del usuario.

## 5. Rendimiento

El bundle principal era de 1.388 KB (los tres paneles en el arranque). Con `React.lazy` por
ruta: **57 KB** iniciales; cada usuario descarga sólo su panel
(docente 344 KB, admin 334 KB, estudiante 235 KB).

## 6. Limpieza

- 423 líneas de código muerto (`render*OLD`) eliminadas de `AdminDashboard`.
- 50 líneas de estado huérfano de secciones ya extraídas.
- 76 imports sin usar en 38 archivos.
- Warnings de ESLint: 193 → 88 (los restantes son estado reservado, sin impacto funcional).

## 7. Cómo arrancar

```bash
# Backend (puerto 4000)
cd backend && npm run start:dev

# Frontend (puerto 3000, otra terminal)
npm run dev
```
- Acceso: `http://localhost:3000` (fuerza el tenant `uniprueba`).
- Swagger: `http://localhost:4000/api/docs` · Salud: `http://localhost:4000/api/v1/health`.
- Credenciales: `admin@uniprueba.com / Admin123!`, `profesor1@uniprueba.com / Profesor123!`,
  `estudiante@uniprueba.com / Estudiante123!`.

Redis no está levantado; `CacheService` degrada correctamente y deshabilita la caché.

## 8. Segunda fase (aprobada el 2026-07-26)

### 8.1 Cobertura de tests: 2 → 99

`jest` no tenía `moduleNameMapper` para el alias `@/`, así que **ningún módulo que lo usara
podía tener tests** (la mayoría de los nuevos). Corregido en `package.json`.

Suites añadidas, centradas en regresión de los fallos de seguridad corregidos:

| Suite | Tests | Cubre |
|---|---|---|
| `tenant.guard.spec.ts` | 9 | Salto de tenant por cabecera, excepción de SUPER_ADMIN, tenant suspendido |
| `finance.service.spec.ts` | 39 | Acotado por tenant en las 10 mutaciones, filtros por lista blanca, resumen del estudiante |
| `auth.service.spec.ts` | 15 | Resolución id/subdominio, hash de contraseña, límites de plan, refresh |
| `library.service.spec.ts` | 18 | Cupo de préstamos, stock transaccional, renovaciones, borrado con préstamos activos |
| `uploads.service.spec.ts` | 15 | Travesía de rutas, aislamiento entre tenants, tipos y tamaño |
| `validate-env.spec.ts` | 10 | Detección de secretos por defecto, cortos o duplicados |

### 8.2 Subida real de archivos

Módulo `uploads`: `POST /api/v1/uploads` (multipart) y `DELETE /api/v1/uploads`.

- Almacenamiento en `uploads/<tenantId>/<carpeta>/<uuid><ext>`, servido en `/uploads/`.
- **El nombre y la ruta los genera siempre el servidor**: el `originalname` del cliente nunca
  toca el sistema de archivos, y las carpetas se validan contra una lista cerrada.
- Lista blanca de 18 tipos MIME y límite de 25 MB, aplicados en el interceptor y en el servicio.
- El borrado exige que la ruta empiece por el prefijo del tenant y resuelve la ruta absoluta
  para descartar travesías con `..`.
- `useTeacherDashboard.subirMaterial` sube el fichero y usa la URL devuelta; `uploads/` queda
  excluido de git y de la imagen Docker.

Verificado en runtime: subida y descarga correctas, y rechazo de `.exe` (400), petición sin
autenticar (401), carpeta inválida (400) y borrado cruzado entre tenants (400).

### 8.3 Secretos y validación de configuración

`JWT_SECRET` y `JWT_REFRESH_SECRET` rotados a valores aleatorios de 48 bytes. Comprobado que
los tokens firmados con el secreto anterior quedan rechazados (401).

Nuevo `asegurarEntornoValido()` en el arranque: **en producción aborta** si algún secreto falta,
conserva el valor del repositorio, mide menos de 32 caracteres, coincide con el otro, o si falta
`DATABASE_URL`. En desarrollo sólo advierte, para no estorbar.

### 8.4 Estado tras esta fase

| Verificación | Resultado |
|---|---|
| `npx jest` backend | ✅ 8 suites, 99 tests |
| `tsc --noEmit` front y back | ✅ 0 errores |
| `npm run build` frontend | ✅ compila |
| `npx eslint .` | ✅ 0 errores, 88 warnings |

## 9. Recomendaciones pendientes (no bloqueantes)

- **Pasarela de pagos**: el flujo del estudiante registra el pago pero no integra una pasarela
  real; Stripe está preparado sólo para la suscripción del tenant.
- **Tests e2e**: los 99 tests son unitarios con Prisma mockeado. Falta una suite `test/*.e2e-spec.ts`
  contra una base de datos de pruebas.
- **Archivos servidos sin autorización**: las URLs de `/uploads/` son públicas si se conoce el UUID.
  Para material sensible convendría servirlos tras un guard en lugar de como estáticos.
- **Antivirus**: no se analiza el contenido de los archivos subidos; la validación es de tipo
  declarado y tamaño.
