# Estructura académica — Programas, Asignaturas, Pensum y Periodos

> Fase 1 (modelo de datos) y Fase 2 (API) — noviembre de 2026.
> Rama `feature/estructura-academica`.

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

## Pendiente (fases siguientes)

- Fase 3: UI de administración (sección "Gestión académica").
- Fase 4: contenido maestro en la Subject (temario/materiales/preguntas).
- Fase 5: vistas docente/estudiante (Mi programa, avance de pensum).
