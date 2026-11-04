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

## Historial académico y cierre de notas

- **`StudentSubjectRecord` es la fuente de verdad** de lo aprobado: una fila
  por intento definitivo de un estudiante en una asignatura. `Grade` sigue
  siendo solo las notas parciales de un grupo. El historial es del
  **estudiante, no del programa**: una asignatura aprobada sirve para
  cualquier programa en el que esté o se inscriba después.
- **Cierre de notas** (`POST /academic-records/courses/:id/close-grades`, con
  previsualización en `GET .../grade-closure-preview`): lo hace el docente del
  grupo o la administración. La definitiva es el promedio ponderado de `Grade`
  (las notas con `weight` usan su peso; las que no lo traen se reparten en
  partes iguales lo que falte para 1) **normalizado** de la escala de captura
  0–100 a la escala del programa (`gradeScaleMax`, 5.0 por defecto), y se
  compara con `program.passingGrade`.
  - Si el grupo mezcla estudiantes de programas con exigencia distinta, se usa
    la **más exigente** comparando `passingGrade ÷ gradeScaleMax`, y la
    previsualización lo reporta como aviso.
  - Al cerrar, `Course.gradesClosedAt` bloquea crear/editar/borrar notas del
    grupo (409). **Reabrir** (`.../reopen-grades`, solo administración) exige
    motivo, lo deja escrito y pasa los registros previos a `ANULADO`: no se
    borran, son la auditoría del cierre anterior.
- `GET /students/:id/academic-record` devuelve el historial completo
  (asignatura, periodo, nota, origen, créditos/horas) con `?incluirAnulados`.

## Avance, reconocimiento y articulación

- `GET /academic-records/progress/:programEnrollmentId`: estado de cada fila
  del pensum (`APROBADA`, `EN_CURSO`, `PENDIENTE`,
  `BLOQUEADA_POR_PRERREQUISITO`), créditos y horas aprobados y porcentaje.
  **El denominador es siempre el pensum DESTINO**, no el programa de origen.
- **"Transversal" se calcula**, no se guarda: una asignatura es transversal
  porque aparece en el pensum de 2+ programas (`subject._count.planEntries`).
  No existe ningún booleano `isTransversal`.
- La homologación entre programas de la institución es **consecuencia de
  compartir la misma `Subject`**: el reconocimiento es automático.
  `GET /academic-records/recognition-preview?studentId&programId` muestra qué
  se reconocería antes de inscribir, y
  `POST /academic-records/enrollments/:id/apply-recognition` crea los
  registros `RECONOCIMIENTO_INTERNO` (copian nota y `passed` del original,
  apuntan a él con `sourceRecordId`, idempotente).
- `maxRecognitionPct` **no** limita el reconocimiento interno por misma
  `Subject`; solo la homologación **externa**.
- `GET /programs/:id/articulation-matrix` (admin) y
  `GET /students/:id/double-degree-options` (desde el historial real)
  reemplazan la tabla de articulación escrita a mano.

## Homologación con solicitud y aprobación

- **Equivalencias** (`/subject-equivalences`, admin): "aprobar X equivale a
  aprobar Y" cuando **no** son la misma `Subject`. Opcionalmente
  bidireccionales.
- **Solicitudes** (`/homologations`): las crea el estudiante para sí mismo o la
  administración para cualquiera, con soportes del módulo de uploads. Pasan a
  `EN_REVISION` y la decisión se toma **ítem por ítem**
  (`POST /homologations/:id/resolve`).
- Validaciones de la homologación **externa**: nota de origen ≥
  `minRecognitionGrade`, horas de origen ≥ horas de la asignatura destino y
  total reconocido ≤ `maxRecognitionPct` del pensum destino. Bloquean con
  mensaje claro; el admin puede **forzar con justificación obligatoria**, que
  queda escrita en el ítem y en el registro del historial.
- Al aprobar se crea el `StudentSubjectRecord` con el origen correspondiente
  (`HOMOLOGACION_EQUIVALENCIA`, `RECONOCIMIENTO_EXTERNO` o
  `VALIDACION_SUFICIENCIA`) y `sourceRequestId`, y se notifica al estudiante.
- **No se reutilizó el módulo de trámites (`procedures`)**: un `Procedure` es
  una solicitud genérica de texto libre con un solo `estado` y una
  `respuesta`, mientras que una homologación necesita ítems tipados por
  asignatura con decisión y auditoría independientes por ítem, y escribe en el
  historial académico. Forzarlo habría requerido una tabla de ítems aparte de
  todos modos. Las dos bandejas conviven.

## Bloques de competencia y certificación intermedia

- `StudyPlanBlock` agrupa filas del pensum (`StudyPlanSubject.blockId`).
  CRUD en `GET/POST /study-plans/:id/blocks` y
  `PATCH/DELETE /study-plan-blocks/:id`, con
  `PUT /study-plan-blocks/:id/subjects` para reasignar.
- Un bloque queda **elegible** cuando el estudiante aprobó todas sus
  asignaturas, sin importar el origen (cursada, reconocida u homologada):
  `GET /study-plan-blocks/enrollment/:programEnrollmentId`.
- El certificado **no se emite solo**:
  `POST /study-plan-blocks/:id/certificate` lo emite la administración y crea
  un `CertificateRequest` (`tipo: 'BLOQUE'`) con la plantilla del bloque.
- Duplicar un pensum copia los bloques y remapea `blockId` en las filas.

## Horas y advertencias ETDH

- Créditos y horas se muestran a la vez: cuando la asignatura no trae horas,
  se derivan como `créditos × program.hoursPerCredit` (48 por defecto).
- `Subject` y `StudyPlanSubject` tienen `theoreticalHours`/`practicalHours`.
- **Advertencias, no bloqueos**, en el editor de pensum y al activar una
  versión: `TECNICO_LABORAL` con menos de 600 h o práctica bajo el 50 %;
  `CONOCIMIENTOS_ACADEMICOS` con menos de 160 h; asignaturas sin desglose de
  horas. Los textos y umbrales viven en
  `backend/src/common/config/politica-academica.ts`.

## Datos demo del caso real

`prisma/scripts/seed-demo-homologacion.ts` (idempotente) carga en `uniprueba`
el Técnico Laboral en Auxiliar Contable y Financiero (12 módulos, 3 bloques),
los 4 programas destino con las asignaturas compartidas exactas y un egresado
con las 12 aprobadas. El simulador debe mostrar **8/9/6/5** asignaturas
reconocidas, y el pensum origen debe avisar de las 576 h.

## Inconsistencias del documento de la institución

Se reportan, **no se "corrigen" en los datos**:

1. *Contabilidad 1* figura como "Específico" pero se homologa en Asistente
   Administrativo. Por eso "transversal" se calcula y no se guarda.
2. Los porcentajes del documento se calculan sobre 12 (el programa de origen).
   El sistema los calcula sobre el total del **destino**, que es lo que al
   estudiante le falta por cursar allí.
3. El texto dice "entre el 40 % y el 70 %" de otros programas, pero la tabla
   llega al 75 % (Asistente Administrativo: 9 de 12).
4. Aparecen "Costos y Presupuesto" y "Costos y Presupuestos": es **una sola**
   asignatura (`COSTOS` en el seed).
5. El diagrama muestra 3 destinos y la tabla 4: falta Asistente Administrativo
   en el diagrama.
6. 12 créditos × 48 h = **576 h**, por debajo del mínimo de 600 h para
   formación laboral. Hay que confirmar con la institución las horas reales de
   cada módulo (el sistema avisa, no bloquea).

## Vistas de docente y estudiante (fase 5)

- **Docente** — `MisGruposPanel`, al inicio de "Mis Cursos": por cada grupo
  muestra la asignatura del catálogo, el periodo con su estado, el código de
  grupo, el cupo, la modalidad y los **programas de origen de sus alumnos**
  (un grupo puede mezclar estudiantes de varios programas). Sale de
  `GET /courses/mis-grupos`, que resuelve la ficha del docente desde el token
  y **no devuelve notas** (el acta y su cierre son de `academic-records`).
- **Estudiante** — sección "Mi Programa" (`MiProgramaSection`): tarjeta con
  programa, nivel actual sobre la duración, versión de pensum y estado de la
  inscripción, más el plan de estudios por niveles con el estado de cada
  asignatura y el nivel actual marcado. Si cursa varios programas, un selector
  los alterna.
  - El avance **no se calcula en el frontend**: viene de
    `GET /academic-records/progress/:programEnrollmentId` (fuente de verdad:
    `StudentSubjectRecord`, incluye homologaciones). La UI muestra
    `porcentajeAvance` tal cual llega y no recalcula nada.
  - La lista de programas sale de `GET /program-enrollments/mis-programas`
    (también resuelve la ficha desde el token), que es lo único que aporta
    modalidad, periodicidad, unidad, título y duración.
- Ambos componentes son **autónomos**: traen sus datos con react-query y no
  pasan por los hooks gigantes de cada panel.
- **Vocabulario:** en el panel docente la sección de `CourseGroup` se renombró
  a "Equipos de trabajo". "Grupo" queda reservado para `Course` (la asignatura
  dictada en un periodo), que es lo que significa en la estructura académica.

## Pendiente (fases siguientes)

- UI de promover/copiar contenido y candado visual del contenido maestro en el
  panel docente (el backend ya lo soporta; ver "Contenido maestro").
- Montar en el panel del estudiante la tarjeta de ruta a segundo título sobre
  `GET /students/:id/double-degree-options`.
