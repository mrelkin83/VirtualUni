# Estructura académica — Programas, Asignaturas, Pensum y Periodos

> Fases 1 (modelo de datos), 2 (API), 3 (UI admin) y 4 (contenido maestro) —
> noviembre de 2026. Rama `feature/estructura-academica`.

## Modelo

```
Program ──< StudyPlan (pensum versionado) ──< StudyPlanSubject >── Subject (catálogo del tenant)
AcademicPeriod ──< Course (= GRUPO: una Subject dictada en un Periodo por un Docente)
Student ──< ProgramEnrollment (programa + versión de pensum + nivel actual)
```

- **Subject** es transversal: pertenece al tenant, no a un programa. Aparece en
  N pensums vía `StudyPlanSubject` y los grupos que la dictan la comparten.
- **Course NO se renombró** (lo usan ~40 módulos); ahora significa **Grupo** y
  ganó `subjectId`, `academicPeriodId`, `groupCode`, `capacity`, `modality`
  (todos nullable). `code`/`name`/`credits`/`semester` son legado: con
  `subjectId` se derivan de la Subject y el Periodo.
- **Pensum versionado**: `StudyPlan.version` único por programa; estados
  `BORRADOR → VIGENTE → CERRADO`. Los estudiantes quedan anclados a su versión
  vía `ProgramEnrollment.studyPlanId`.
- `Student.program`/`Student.semester` son texto legado de solo lectura; la
  inscripción real es `ProgramEnrollment` (único por `[studentId, programId]`).

Catálogos (enums): `EducationLevel` (Ley 30, ETDH, formal, continua),
`PeriodStructure`, `AcademicUnit`, `Modality`, `SubjectType`, y los estados
`ProgramStatus`, `StudyPlanStatus`, `PeriodStatus`, `ProgramEnrollmentStatus`.

## Reglas de negocio

- Una `Subject` usada en un pensum o grupo **no se borra** (409; desactívela).
- Un `Program` con inscritos **no se borra** (409; páselo a `INACTIVO`).
- Un pensum `VIGENTE` **con estudiantes** no se edita en sitio: duplíquelo
  (`POST /study-plans/:id/duplicate`, copia filas y prerrequisitos) y active la
  copia. Un `BORRADOR` (o un `VIGENTE` sin inscritos) sí se edita. `CERRADO` es
  histórico.
- `POST /study-plans/:id/activate` pone `VIGENTE` y cierra la vigente anterior.
- Prerrequisitos: filas del **mismo** pensum, nivel del requisito **menor** que
  el de la fila, sin ciclos (DFS de defensa para datos legados).
- `level` entre 1 y `program.durationPeriods` cuando este exista.
- Periodos: `startDate < endDate`; los solapamientos **advierten** (campo
  `advertencias` en la respuesta) pero no bloquean.
- Crear un grupo con `subjectId`: `code = SUBJECT-GRUPO-PERIODO`,
  `name = "Asignatura – Grupo A – 2027-1"`, créditos de la Subject. Sin
  `subjectId`, el flujo legado exige `code` y `name`.

## Endpoints (prefijo `api/v1`)

| Método | Ruta | Roles escritura |
|---|---|---|
| GET/POST | `/programs` (filtros `educationLevel`, `status`, `search`) | ADMIN |
| GET/PATCH/DELETE | `/programs/:id` | ADMIN |
| GET/POST | `/programs/:id/study-plans` | ADMIN |
| PATCH | `/study-plans/:id` | ADMIN |
| POST | `/study-plans/:id/activate` · `/study-plans/:id/duplicate` | ADMIN |
| GET/POST | `/study-plans/:id/subjects` (GET agrupa por nivel con totales) | ADMIN |
| PATCH/DELETE | `/study-plan-subjects/:id` | ADMIN |
| PUT | `/study-plan-subjects/:id/prerequisites` | ADMIN |
| GET/POST | `/subjects` (filtros `search`, `area`) | ADMIN |
| GET | `/subjects/:id/usage` → programas/pensums/grupos que la usan | — |
| GET/PATCH/DELETE | `/subjects/:id` | ADMIN |
| GET/POST | `/academic-periods` · GET `/academic-periods/current` | ADMIN |
| PATCH | `/academic-periods/:id` | ADMIN |
| GET/POST | `/program-enrollments` (filtros `programId`, `studentId`, `status`) | ADMIN |
| PATCH | `/program-enrollments/:id` | ADMIN |
| GET | `/students/:id/programs` (STUDENT solo los propios) | — |

Lectura: `TEACHER` + administración en catálogos; `STUDENT` solo sus programas.
Todos los controllers aplican `JwtAuthGuard` + `TenantGuard` + `RolesGuard`, y
todo id de cliente se valida contra el tenant antes de usarse.

## Datos

- Migración `20261103162350_estructura_academica` (aditiva; nada se elimina).
- Backfill idempotente: `backend/prisma/scripts/backfill-estructura-academica.ts`
  (deriva Subjects de cursos, Periodos de `Course.semester`, Programas +
  inscripciones de `Student.program`). Córralo tras desplegar la migración.
- Seed demo: 3 programas de niveles distintos que comparten `MAT-BAS` y
  `COM-ORAL`, periodo en curso y 3 grupos ligados a asignatura+periodo.

## Contenido maestro (fase 4)

El temario (`CourseTopic`), las carpetas y materiales (`MaterialFolder`,
`Material`) y el banco de preguntas (`QuestionBank`) pueden pertenecer **o** a
un grupo (`courseId`: contenido propio) **o** a una asignatura (`subjectId`:
contenido maestro). La exclusividad se valida en los servicios y la
pertenencia no se reasigna por PATCH.

- **Herencia:** `GET /course-topics?courseId=X`, `GET /materials?courseId=X` y
  `GET /materials/folders?courseId=X` devuelven el contenido maestro de la
  asignatura del grupo (con `origen: 'asignatura'`) + el propio
  (`origen: 'grupo'`).
- **Permiso de edición:** el contenido maestro solo lo muta la administración
  o un docente habilitado como **editor de la asignatura**
  (`GET/PUT /subjects/:id/editors`, tabla `subject_editors`). Por defecto el
  profesorado lo ve de solo lectura desde sus grupos.
- **Acciones:** `POST /course-topics/:id/promover` y
  `POST /materials/:id/promover` suben contenido del grupo a la asignatura;
  `POST /course-topics/copiar-del-grupo` y `POST /materials/copiar-del-grupo`
  (`{ courseId, fromCourseId }`) copian el contenido propio de otro grupo de
  la misma asignatura (p. ej. el del periodo anterior).
- **Visibilidad del estudiante:** solo ve contenido maestro de asignaturas de
  grupos donde está matriculado (además de lo propio de sus grupos); la fuga
  de materiales entre cursos cerrada en `623c5c8` sigue cubierta por specs.
- **Backfill:** `prisma/scripts/backfill-contenido-maestro.ts` mueve el
  contenido existente a la Subject solo si esta tiene un único grupo; con
  varios grupos lo deja y lo reporta.
- Una asignatura con contenido maestro no se elimina (409).

## Pendiente (fases siguientes)

- Fase 5: vistas docente/estudiante (Mi programa, avance de pensum, UI de
  promover/copiar y candado visual del contenido maestro en el panel docente).
