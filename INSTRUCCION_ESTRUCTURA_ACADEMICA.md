# INSTRUCCIÓN PARA EL AGENTE DE CÓDIGO — Estructura académica: Programas, Asignaturas transversales, Pensum y Periodos

> Proyecto: **VirtualUni** (SaaS educativo multi-tenant; meta de producto: competir con Q10).
> Stack: React 18 + TS + Vite + Tailwind (raíz) · NestJS 10 + Prisma 5 + PostgreSQL 15 (`backend/`).
> Lee `CLAUDE.md` y `README.md` antes de empezar. Sus reglas tienen prioridad sobre cualquier cosa de este documento que las contradiga.

---

## 0. Objetivo en una frase

Que una institución pueda **crear Programas** (técnico, tecnólogo, profesional, diplomado, taller, bachillerato…), armar su **plan de estudios (pensum)** con **Asignaturas de un catálogo compartido** —de modo que una misma asignatura y **su material** se reutilicen en varios programas— y dictarlas por **Periodo académico** en **Grupos**.

## 1. El problema actual (medido en el código)

- `Course` (`backend/prisma/schema.prisma`) mezcla dos conceptos:
  1. la **asignatura de catálogo** (código, nombre, créditos, descripción, temario), y
  2. el **grupo que se dicta** (docente `teacherId`, `semester` como texto, matrículas, notas, asistencia, exámenes, clases en vivo).
  Resultado: si "Matemáticas I" se dicta en 3 programas o en 2 semestres, hay que crear 3–6 cursos y **duplicar** temario, materiales y preguntas.
- No existen modelos de **Programa**, **Pensum**, **Periodo académico** ni **inscripción del estudiante a un programa**.
- `Student.program` y `Student.semester` son `String?` libres (`students.service.ts`, `analytics.service.ts` agrupa por ese texto).
- `QuestionBank` pertenece al docente, no a la asignatura.

## 2. Modelo conceptual objetivo

```
Program (Programa) ──< StudyPlan (Pensum, versionado) ──< StudyPlanSubject >── Subject (Asignatura, catálogo del tenant)
                                                                                    │  contenido maestro: temario, materiales, banco de preguntas
AcademicPeriod (Periodo: 2027-1, 2027, Cohorte 3…)                                  │
          └──────────────< Course (= GRUPO: una Subject dictada en un Periodo por un Docente) >──┘
                                   └──< Enrollment (estudiante en el grupo) · Grade · Attendance · Exam · LiveClass …
Student ──< ProgramEnrollment (estudiante inscrito en un Programa + versión de pensum + nivel actual)
```

Reglas clave:
- **Subject es transversal**: pertenece al tenant, no a un programa. Aparece en el pensum de N programas vía `StudyPlanSubject`.
- **Course NO se renombra** en el código (lo usan ~40 módulos). Pasa a significar **Grupo** y en la UI se etiqueta "Grupo" o "Curso (grupo)". Gana `subjectId` y `academicPeriodId`.
- Un **grupo puede ser compartido** por estudiantes de distintos programas (ej. "Matemáticas I – Grupo A – 2027-1" con alumnos de Sistemas y de Industrial). Esa es la reutilización operativa; la reutilización de contenido es la de la Subject.
- **Pensum versionado** (`StudyPlan.version`): cuando la institución cambia el pensum, los estudiantes antiguos siguen en su versión.

## 3. Catálogos (enums) — valores para Colombia

`EducationLevel` (nivel de formación):
- Educación superior (Ley 30): `TECNICO_PROFESIONAL`, `TECNOLOGICO`, `PROFESIONAL_UNIVERSITARIO`, `ESPECIALIZACION`, `MAESTRIA`, `DOCTORADO`
- ETDH (Educación para el Trabajo y el Desarrollo Humano): `TECNICO_LABORAL`, `CONOCIMIENTOS_ACADEMICOS`
- Educación formal preescolar/básica/media: `PREESCOLAR`, `BASICA_PRIMARIA`, `BASICA_SECUNDARIA`, `MEDIA_BACHILLERATO`, `BACHILLERATO_POR_CICLOS` (adultos/CLEI)
- Educación continua / informal: `DIPLOMADO`, `CURSO_LIBRE`, `TALLER`, `SEMINARIO`
- `OTRO`

`PeriodStructure` (cómo avanza el programa): `SEMESTRAL`, `CUATRIMESTRAL`, `TRIMESTRAL`, `ANUAL`, `POR_CICLOS`, `MODULAR`, `UNICO` (diplomados/talleres de una sola etapa).

`AcademicUnit` (unidad de medida): `CREDITOS` (superior), `HORAS` (ETDH, continua), `INTENSIDAD_HORARIA_SEMANAL` (colegio).

`Modality`: `PRESENCIAL`, `VIRTUAL`, `HIBRIDA`, `DISTANCIA`.

`SubjectType` (en el pensum): `OBLIGATORIA`, `ELECTIVA`, `OPTATIVA`, `PRACTICA`, `TRABAJO_DE_GRADO`.

Estados: `ProgramStatus` (`BORRADOR`, `ACTIVO`, `INACTIVO`), `StudyPlanStatus` (`BORRADOR`, `VIGENTE`, `CERRADO`), `PeriodStatus` (`PLANEADO`, `EN_CURSO`, `CERRADO`), `ProgramEnrollmentStatus` (`ACTIVO`, `APLAZADO`, `RETIRADO`, `GRADUADO`, `CANCELADO`).

> Las etiquetas visibles en la UI salen de un mapa `enum → texto` en el frontend (ej. `TECNOLOGICO → "Tecnólogo"`), no se escriben a mano en cada pantalla.

## 4. Modelos Prisma (propuesta — ajústala si encuentras algo mejor, pero justifica el cambio)

Convenciones del repo: `id` uuid, `tenantId` en **todas** las tablas, `@map` snake_case, `@@map` plural, `createdAt/updatedAt`, índices en toda FK.

```prisma
model Program {
  id               String          @id @default(uuid())
  tenantId         String          @map("tenant_id")
  code             String
  name             String
  description      String?         @db.Text
  educationLevel   EducationLevel  @map("education_level")
  modality         Modality
  periodStructure  PeriodStructure @map("period_structure")
  academicUnit     AcademicUnit    @map("academic_unit")
  durationPeriods  Int?            @map("duration_periods")   // nº de semestres/grados/ciclos/módulos
  totalCredits     Int?            @map("total_credits")
  totalHours       Int?            @map("total_hours")
  degreeTitle      String?         @map("degree_title")       // "Tecnólogo en Gestión Empresarial"
  officialCode     String?         @map("official_code")      // SNIES o código de registro ETDH (opcional)
  approvalAct      String?         @map("approval_act")       // resolución/registro calificado (texto libre)
  status           ProgramStatus   @default(BORRADOR)
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")

  studyPlans         StudyPlan[]
  programEnrollments ProgramEnrollment[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("programs")
}

model StudyPlan {               // Pensum versionado
  id         String          @id @default(uuid())
  tenantId   String          @map("tenant_id")
  programId  String          @map("program_id")
  version    String                                  // "2027-1", "v2"
  status     StudyPlanStatus @default(BORRADOR)
  validFrom  DateTime?       @map("valid_from")
  notes      String?         @db.Text
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")

  program    Program            @relation(fields: [programId], references: [id], onDelete: Cascade)
  subjects   StudyPlanSubject[]
  programEnrollments ProgramEnrollment[]

  @@unique([programId, version])
  @@index([tenantId])
  @@map("study_plans")
}

model Subject {                 // Asignatura/Materia/Módulo — catálogo transversal del tenant
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  code          String
  name          String
  description   String?  @db.Text
  area          String?                       // área de conocimiento (útil para bachillerato: "Matemáticas", "Ciencias Naturales")
  credits       Int?
  hours         Int?                          // horas totales
  weeklyHours   Int?     @map("weekly_hours")
  status        String   @default("active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  planEntries   StudyPlanSubject[]
  courses       Course[]                      // grupos que la dictan
  // contenido maestro (ver Fase 4): topics, materials, materialFolders, questions

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("subjects")
}

model StudyPlanSubject {        // fila del pensum
  id           String      @id @default(uuid())
  tenantId     String      @map("tenant_id")
  studyPlanId  String      @map("study_plan_id")
  subjectId    String      @map("subject_id")
  level        Int                               // semestre / grado / ciclo / módulo (1..n); 1 para UNICO
  subjectType  SubjectType @default(OBLIGATORIA) @map("subject_type")
  credits      Int?                              // override opcional del valor de la Subject
  hours        Int?
  orderIndex   Int         @default(0) @map("order_index")

  studyPlan     StudyPlan @relation(fields: [studyPlanId], references: [id], onDelete: Cascade)
  subject       Subject   @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  prerequisites StudyPlanPrerequisite[] @relation("entry")
  requiredBy    StudyPlanPrerequisite[] @relation("required")

  @@unique([studyPlanId, subjectId])
  @@index([tenantId])
  @@index([subjectId])
  @@map("study_plan_subjects")
}

model StudyPlanPrerequisite {
  id          String @id @default(uuid())
  tenantId    String @map("tenant_id")
  entryId     String @map("entry_id")       // la asignatura que tiene el requisito
  requiredId  String @map("required_id")    // la que hay que aprobar antes (misma StudyPlan)

  entry    StudyPlanSubject @relation("entry",    fields: [entryId],    references: [id], onDelete: Cascade)
  required StudyPlanSubject @relation("required", fields: [requiredId], references: [id], onDelete: Cascade)

  @@unique([entryId, requiredId])
  @@index([requiredId])
  @@map("study_plan_prerequisites")
}

model AcademicPeriod {
  id         String       @id @default(uuid())
  tenantId   String       @map("tenant_id")
  code       String                          // "2027-1", "2027", "COHORTE-03"
  name       String
  startDate  DateTime     @map("start_date") @db.Date
  endDate    DateTime     @map("end_date")   @db.Date
  status     PeriodStatus @default(PLANEADO)
  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  courses    Course[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("academic_periods")
}

model ProgramEnrollment {       // inscripción del estudiante a un programa
  id           String                  @id @default(uuid())
  tenantId     String                  @map("tenant_id")
  studentId    String                  @map("student_id")
  programId    String                  @map("program_id")
  studyPlanId  String                  @map("study_plan_id")
  currentLevel Int                     @default(1) @map("current_level")
  status       ProgramEnrollmentStatus @default(ACTIVO)
  startDate    DateTime                @default(now()) @map("start_date")
  endDate      DateTime?               @map("end_date")
  createdAt    DateTime                @default(now()) @map("created_at")
  updatedAt    DateTime                @updatedAt @map("updated_at")

  student   Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  program   Program   @relation(fields: [programId], references: [id], onDelete: Restrict)
  studyPlan StudyPlan @relation(fields: [studyPlanId], references: [id], onDelete: Restrict)

  @@unique([studentId, programId])           // un estudiante puede estar en varios programas, no dos veces en el mismo
  @@index([tenantId])
  @@index([programId])
  @@map("program_enrollments")
}
```

Cambios a modelos existentes:
- `Course`: agregar `subjectId String?` y `academicPeriodId String?` (nullable en esta entrega para no romper datos ni flujos actuales), `groupCode String?` (ej. "A", "01"), `capacity Int?`, `modality Modality?`. Relaciones con `Subject` (`onDelete: Restrict`) y `AcademicPeriod` (`onDelete: Restrict`). Índices en ambas FK. **No** quitar `code`, `name`, `credits`, `semester` todavía: márcalos como legado en un comentario.
- `Student`: agregar `programEnrollments ProgramEnrollment[]`. **No** borrar `program`/`semester` aún; quedan como legado de solo lectura.

## 5. Plan por fases — ejecuta UNA fase, verifica, reporta y DETENTE a esperar aprobación

### Fase 0 — Preparación (obligatoria)
1. `git status`. El repo tiene cambios sin commit del usuario (≈22 archivos: billing, uploads, tenants, Dockerfiles, AdminDashboard, hooks…). **No los mezcles con esta tarea ni los descartes.** Pregunta al usuario si los commiteas primero en su propia rama/commit.
2. Crea la rama `feature/estructura-academica` desde `main`.
3. Línea base: `npx tsc --noEmit` (raíz y `backend/`), `npm test` en `backend/`, `npx vitest run` en raíz, `npx prisma validate`. Anota los resultados para comparar al final de cada fase.

### Fase 1 — Modelo de datos y migración
1. Agrega enums y modelos de §3–§4 a `schema.prisma`.
2. Genera la migración **con** `npx prisma migrate dev --name estructura_academica` (nunca escribas ni edites a mano archivos en `prisma/migrations/`; hay un hook que lo bloquea).
3. **Backfill de datos existentes**, como script idempotente `backend/prisma/scripts/backfill-estructura-academica.ts` (no dentro de la migración):
   - Por cada tenant y cada `Course` existente: crear (o reutilizar si ya existe por `[tenantId, code]`) una `Subject` con el mismo `code`, `name`, `description`, `credits`; poner `course.subjectId`.
   - Por cada valor distinto de `Course.semester` no vacío: crear un `AcademicPeriod` (code = ese valor; fechas = rango razonable o las del primer/último registro; estado `CERRADO` si es pasado) y enlazar.
   - Por cada valor distinto de `Student.program`: crear un `Program` en estado `BORRADOR` con `educationLevel: OTRO`, un `StudyPlan` v1 en `BORRADOR`, y un `ProgramEnrollment` por estudiante. **No inventes** nivel ni modalidad: déjalo para que el admin lo complete.
   - Imprime un resumen (creados / reutilizados / omitidos) y córrelo dos veces para probar idempotencia.
4. Actualiza `prisma/seed.ts` para que el tenant demo `uniprueba` tenga: 3 programas de niveles distintos (ej. Tecnólogo en Sistemas, Técnico laboral en Contabilidad, Bachillerato por ciclos), al menos **2 asignaturas transversales** compartidas entre programas (ej. "Matemáticas básicas", "Comunicación oral y escrita"), un periodo `EN_CURSO`, y grupos ligados a subject+periodo.
5. Verifica: `prisma validate`, `prisma generate`, seed limpio en BD vacía, backfill sobre una copia de BD con datos.

### Fase 2 — Backend (NestJS)
Módulos nuevos en `backend/src/modules/`: `programs` (incluye study-plans y su detalle), `subjects`, `academic-periods`, `program-enrollments`. Cada uno con controller, service, `dto/`, `*.spec.ts`.

Endpoints mínimos (prefijo `api/v1`, rutas estáticas **antes** de `:id`):
- `GET/POST /programs`, `GET/PATCH/DELETE /programs/:id` (filtros: `educationLevel`, `status`, `search`; paginado como el resto del repo).
- `GET/POST /programs/:id/study-plans`, `PATCH /study-plans/:id`, `POST /study-plans/:id/activate` (pasa a `VIGENTE`; la vigente anterior queda `CERRADO`), `POST /study-plans/:id/duplicate` (crea nueva versión copiando filas y prerrequisitos).
- `GET /study-plans/:id/subjects` (agrupado por `level`), `POST /study-plans/:id/subjects`, `PATCH/DELETE /study-plan-subjects/:id`, `PUT /study-plan-subjects/:id/prerequisites`.
- `GET/POST /subjects`, `GET/PATCH/DELETE /subjects/:id`, `GET /subjects/:id/usage` → en qué programas/pensum y en cuántos grupos se usa (para mostrar "Transversal: usada en N programas").
- `GET/POST /academic-periods`, `PATCH /academic-periods/:id`, `GET /academic-periods/current`.
- `GET/POST /program-enrollments`, `PATCH /program-enrollments/:id`, `GET /students/:id/programs`.
- `courses`: `CreateCourseDto`/`UpdateCourseDto` aceptan `subjectId`, `academicPeriodId`, `groupCode`, `capacity`, `modality`. Si llega `subjectId`, `code`/`name`/`credits` se toman de la Subject (el cliente no los manda). Mantén compatibilidad: crear curso sin `subjectId` sigue funcionando por ahora.

Reglas de negocio:
- No se puede borrar una `Subject` usada en un pensum o en un grupo → 409 con mensaje claro. Lo mismo para un `Program` con estudiantes inscritos (ofrece `INACTIVO`).
- Un pensum `VIGENTE` con estudiantes no se edita en sitio: se duplica a nueva versión. Un pensum `BORRADOR` sí.
- Prerrequisitos: misma `StudyPlan`, nivel del requisito < nivel de la asignatura, **sin ciclos** (valida con DFS).
- `level` entre 1 y `program.durationPeriods` cuando este exista.
- Fechas de periodo: `startDate < endDate`; advertir (no bloquear) solapamientos.

**Seguridad multi-tenant (el bug más repetido del repo — lee la sección en `CLAUDE.md`):**
- Guards `JwtAuthGuard`, `TenantGuard`, `RolesGuard` en todos los controllers. Escritura: `TENANT_ADMIN`/`SUPER_ADMIN`. Lectura de catálogo: también `TEACHER`. `STUDENT` solo ve sus propios programas.
- Todo `update/delete` por id: `findFirst({ where: { id, tenantId } })` antes de mutar.
- **Todo** campo `*Id` de un DTO (`programId`, `studyPlanId`, `subjectId`, `academicPeriodId`, `studentId`, `requiredId`) se valida contra el tenant del llamador antes de usarse. Referencias: `assertOwnership()` en `finance.service.ts`.
- Al terminar, ejecuta el subagente `tenant-isolation-reviewer` sobre los módulos nuevos y sobre `courses` y corrige lo que reporte.

Pruebas: specs por servicio que cubran al menos: aislamiento entre tenants (un id de otro tenant → 404), ciclo de prerrequisitos rechazado, borrado bloqueado por uso, duplicar pensum copia filas y prerrequisitos, activar pensum cierra el anterior.

`analytics.service.ts`: `studentsByProgram` debe agrupar por `ProgramEnrollment` → `Program.name`, con fallback al texto legado si no hay inscripción.

### Fase 3 — Frontend administrador
`AdminDashboard.tsx` ya pasa de 3.000 líneas: **no** agregues lógica ahí. Crea componentes en `src/components/admin/sections/academico/` y solo registra la sección en el menú.

- Menú: nueva sección **"Gestión académica"** con pestañas: **Programas · Asignaturas · Periodos · Grupos**. La actual "Cursos" se convierte en la pestaña "Grupos".
- **Programas**: lista con filtros por nivel/estado y chips de nivel con color. Crear/editar en un formulario por pasos: (1) datos generales, (2) estructura (nivel, modalidad, periodicidad, unidad, duración), (3) datos oficiales opcionales. Al elegir el nivel, precarga valores sensatos (ej. `MEDIA_BACHILLERATO` → `ANUAL` + `INTENSIDAD_HORARIA_SEMANAL`; `DIPLOMADO` → `UNICO` + `HORAS`; `TECNOLOGICO` → `SEMESTRAL` + `CREDITOS`) y la etiqueta de nivel cambia ("Semestre", "Grado", "Ciclo", "Módulo").
- **Editor de pensum** (pantalla clave): columnas por nivel (Semestre 1, 2, 3…), tarjetas de asignatura con créditos/horas y tipo; botón "Agregar asignatura" con buscador del catálogo y opción "crear nueva" en el mismo modal; insignia **"Transversal · N programas"** cuando la Subject está en más de un programa; totales por nivel y del programa vs `totalCredits/totalHours`; selector de versión, "Duplicar como nueva versión", "Activar". Prerrequisitos editables desde la tarjeta.
- **Asignaturas**: catálogo con búsqueda, área, créditos/horas y columna "Usada en" (programas y grupos).
- **Periodos**: CRUD simple con estado y marcador del periodo en curso.
- **Grupos**: crear grupo = elegir Periodo + Asignatura + Docente + código de grupo + cupo. El nombre se muestra como `Asignatura – Grupo A – 2027-1`.
- Inscripción de estudiantes (sección existente "Inscripción" y modal de estudiante): seleccionar Programa (+ versión de pensum vigente por defecto) y nivel actual. Reemplaza los inputs de texto libre de programa/semestre.
- Tipos en `src/api/endpoints/*.ts` **calcados de los DTOs** (el `ValidationPipe` usa `forbidNonWhitelisted`: un campo de más = 400). Usa react-query, react-hook-form + Zod y el patrón de modales accesibles existente (`useModalA11y`).

### Fase 4 — Reutilización de contenido (el corazón de la petición)
Objetivo: el temario, los materiales y el banco de preguntas viven en la **Subject**; todos los grupos de esa Subject (en cualquier programa o periodo) los heredan.
- Agregar `subjectId String?` a `CourseTopic`, `MaterialFolder`, `Material` y `QuestionBank`. Regla: un registro pertenece **o** a una Subject (contenido maestro compartido) **o** a un Course (contenido propio del grupo). Valida esa exclusividad en el servicio.
- El grupo muestra: contenido maestro de su Subject (solo lectura para el docente salvo que el admin le dé permiso de editor de la asignatura) + contenido propio del grupo.
- Acciones: "Promover a contenido de la asignatura" (grupo → Subject) y "Copiar del grupo anterior de esta asignatura".
- Backfill: el temario/materiales existentes se mueven a la Subject creada en Fase 1 **solo** si esa Subject tiene un único grupo; si tiene varios, quedan en el grupo y se reporta.
- Verifica que la descarga autenticada de materiales y la fuga de materiales entre cursos (ya corregida en el commit `623c5c8`) sigan cerradas: un estudiante solo ve material de Subjects de grupos donde está matriculado.

### Fase 5 — Docente y estudiante
- Docente: sus grupos muestran asignatura, periodo, código de grupo y los programas de origen de sus alumnos.
- Estudiante: tarjeta "Mi programa" (programa, nivel actual, versión de pensum) y vista del pensum con avance por nivel (aprobadas / en curso / pendientes) a partir de `Grade` y `Enrollment`.

## 6. Fuera de alcance (no lo hagas ahora; anótalo como siguiente paso)
Escalas de calificación configurables por programa (1–5, 0–100, desempeños Bajo/Básico/Alto/Superior del Decreto 1290 para colegio), boletines y certificados de notas oficiales, homologaciones, admisiones/CRM de aspirantes, cobro por programa y facturación electrónica DIAN, cambios a los límites del plan (`maxCourses` sigue contando grupos; no toques billing ni límites).

## 7. Definición de terminado (por fase)
- `npx tsc --noEmit` limpio en raíz y `backend/`; `npm run build` en ambos.
- Tests backend y frontend en verde y sin bajar de la línea base; lint sin superar los máximos de warnings configurados.
- `tenant-isolation-reviewer` sin hallazgos abiertos.
- Seed + backfill corridos y verificados.
- UI probada en el navegador con el tenant demo: crear un Tecnólogo y un Diplomado, compartir una asignatura entre ambos, crear un grupo en el periodo en curso, inscribir un estudiante.
- Un commit por fase, mensajes en español con el estilo del repo (verbo en presente, minúsculas: "agrega programas académicos y pensum versionado").
- Actualiza `docs/` con un `ESTRUCTURA_ACADEMICA.md` breve (modelo, reglas, endpoints) y añade a `docs/DECISIONES_PENDIENTES.md` lo que quede abierto.

## 8. Cómo reportar al terminar cada fase
Resumen corto: qué se hizo, archivos clave, resultados de verificación vs línea base, decisiones que tomaste por tu cuenta (y por qué) y preguntas abiertas. Luego **detente** y espera aprobación antes de la siguiente fase.

## 9. Decisiones con valor por defecto (aplica el default salvo que el usuario diga otra cosa)
1. Nombre en UI de `Course`: **"Grupo"**.
2. Un estudiante puede cursar **varios programas** a la vez (doble programa, o técnico + diplomado).
3. Un grupo **puede mezclar** estudiantes de distintos programas.
4. Docentes **no** editan el contenido maestro de una asignatura por defecto; el admin puede habilitarlos.
5. Los campos legados (`Course.semester`, `Student.program/semester`) se conservan hasta que el usuario apruebe eliminarlos en una migración posterior.
