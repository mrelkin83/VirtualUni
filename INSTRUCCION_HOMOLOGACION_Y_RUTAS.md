# INSTRUCCIÓN COMPLEMENTARIA PARA EL AGENTE DE CÓDIGO — Historial académico, homologación, doble titulación y bloques certificables

> Proyecto: **VirtualUni**. Esta instrucción **amplía** `INSTRUCCION_ESTRUCTURA_ACADEMICA.md`, que ya implementaste (Programas, Asignaturas transversales, Pensum versionado, Periodos, Grupos). **No rehagas nada de esa entrega**; construye encima.
> Las reglas de `CLAUDE.md` siguen mandando: aislamiento por tenant en cada `*Id`, nunca editar migraciones a mano, DTOs calcados en el frontend, rutas estáticas antes de `:id`, y `tenant-isolation-reviewer` al terminar.

---

## 0. Caso real que motiva esta entrega

La institución diseñó el programa **Técnico Laboral en Auxiliar Contable y Financiero** (modular, 12 créditos, 1 crédito por módulo):

| # | Módulo | Bloque de competencia |
|---|---|---|
| 1 | Administración 1 | Administrativo |
| 2 | Administración 2 | Administrativo |
| 3 | Contabilidad 1 | Contable-Financiero |
| 4 | Contabilidad 2 | Contable-Financiero |
| 5 | Economía | Administrativo |
| 6 | Matemáticas Financieras | Contable-Financiero |
| 7 | Análisis Financiero | Contable-Financiero |
| 8 | Costos y Presupuestos | Contable-Financiero |
| 9 | Legislación Laboral | Legal/Proyectos |
| 10 | Inglés 1 | Legal/Proyectos |
| 11 | Legislación Comercial | Legal/Proyectos |
| 12 | Gestión de Proyectos | Legal/Proyectos |

> La asignación de módulos a bloques es una **propuesta**: el documento nombra los tres bloques pero no dice qué módulo va en cada uno. El admin debe poder cambiarla.

La institución promete que el egresado **homologa** módulos aprobados en otros técnicos laborales:

| Programa destino | Módulos que se reconocen |
|---|---|
| T.L. Administración de Empresas | Adm 1, Adm 2, Economía, Costos y Presupuestos, Leg. Laboral, Leg. Comercial, Inglés 1, Gestión de Proyectos (8) |
| T.L. Asistente Administrativo | los 8 anteriores **+ Contabilidad 1** (9) |
| T.L. Mercadeo y Comercio Internacional | Adm 1, Economía, Costos y Presupuestos, Leg. Comercial, Inglés 1, Gestión de Proyectos (6) |
| T.L. Gestión del Talento Humano | Adm 1, Leg. Laboral, Leg. Comercial, Inglés 1, Gestión de Proyectos (5) |

También promete **certificación intermedia por bloques** (Administrativo, Contable-Financiero, Legal/Proyectos) y **ruta de doble titulación** (cursar solo lo que falte).

**Lo que el sistema NO tiene hoy y esta entrega agrega:**
1. Un **historial académico** por estudiante y asignatura: nota definitiva y aprobado/reprobado. Hoy `Grade` guarda notas parciales por grupo y no hay cierre de notas.
2. **Reconocimiento automático** de asignaturas aprobadas cuando el estudiante entra a otro programa que tiene la misma `Subject` en su pensum.
3. **Homologación manual o equivalencias** cuando la asignatura no es la misma `Subject`, o viene de otra institución, con aprobación y soporte.
4. **Bloques de competencia** dentro del pensum, con certificado intermedio.
5. **Simulador y matriz de articulación**: ruta de doble titulación calculada por el sistema, no escrita a mano.
6. **Horas teóricas/prácticas y validaciones ETDH**.

## 1. Principios de diseño (obligatorios)

- **"Transversal" se calcula, no se guarda.** Una asignatura es transversal porque aparece en el pensum de 2 o más programas. Evidencia: en el documento de la institución, *Contabilidad 1* está marcada "Específico" pero se homologa en Asistente Administrativo. **No** agregues un booleano `isTransversal`. Si ya existe uno de la entrega anterior, conviértelo en dato calculado.
- **La homologación entre programas de la institución es consecuencia de compartir la misma `Subject`.** No dupliques asignaturas ("Costos y Presupuesto" vs "Costos y Presupuestos" debe ser **una sola** `Subject`).
- **El porcentaje de avance se calcula sobre el programa DESTINO**, no sobre el de origen: `créditos (u horas) reconocidos ÷ total del pensum destino`. El documento de la institución divide por 12 (el origen); solo coincide si el destino también tiene 12 créditos.
- **El historial es del estudiante, no del programa.** Una asignatura aprobada sirve para cualquier programa en el que esté o se inscriba después.

## 2. Paso 1 — Reconciliación (antes de escribir código)

1. Revisa lo que realmente quedó implementado de `INSTRUCCION_ESTRUCTURA_ACADEMICA.md`: nombres de modelos y campos, enums, módulos NestJS, pantallas y qué fases se completaron.
2. Reporta en una tabla las diferencias entre lo pedido y lo construido.
3. **Usa los nombres reales del código** en todo lo que sigue. Los nombres de esta instrucción son orientativos.
4. Línea base: `tsc --noEmit` (raíz y `backend/`), tests backend y frontend, `prisma validate`. Rama nueva: `feature/homologacion-y-rutas`.
5. **Detente y espera aprobación** si encuentras algo que obligue a cambiar el diseño de esta instrucción.

## 3. Modelo de datos (propuesta; ajústala a lo existente y justifica los cambios)

```prisma
// Política académica por programa (puede ir como campos en Program)
//   passingGrade       Float  @default(3.0)  // nota mínima aprobatoria
//   gradeScaleMax      Float  @default(5.0)
//   hoursPerCredit     Int    @default(48)
//   maxRecognitionPct  Int    @default(50)   // % máximo del pensum que se puede reconocer por homologación EXTERNA
//   minRecognitionGrade Float @default(3.0)

model StudentSubjectRecord {      // historial académico: una fila por intento definitivo
  id               String         @id @default(uuid())
  tenantId         String         @map("tenant_id")
  studentId        String         @map("student_id")
  subjectId        String         @map("subject_id")
  courseId         String?        @map("course_id")          // grupo donde la cursó (null si es homologación)
  academicPeriodId String?        @map("academic_period_id")
  origin           RecordOrigin                               // CURSADA | RECONOCIMIENTO_INTERNO | HOMOLOGACION_EQUIVALENCIA | RECONOCIMIENTO_EXTERNO | VALIDACION_SUFICIENCIA
  finalGrade       Float?         @map("final_grade")         // null para reconocimientos sin nota
  passed           Boolean
  creditsSnapshot  Int?           @map("credits_snapshot")
  hoursSnapshot    Int?           @map("hours_snapshot")
  status           RecordStatus   @default(VIGENTE)           // VIGENTE | ANULADO
  approvedById     String?        @map("approved_by_id")      // userId del admin que cerró o aprobó
  approvedAt       DateTime?      @map("approved_at")
  sourceRequestId  String?        @map("source_request_id")   // HomologationRequest que lo originó
  notes            String?        @db.Text
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([studentId, subjectId])
  @@index([courseId])
  @@map("student_subject_records")
}

model SubjectEquivalence {        // "aprobar X equivale a aprobar Y" cuando NO son la misma Subject
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  sourceSubjectId String   @map("source_subject_id")
  targetSubjectId String   @map("target_subject_id")
  bidirectional   Boolean  @default(false)
  notes           String?
  @@unique([sourceSubjectId, targetSubjectId])
  @@index([tenantId])
  @@map("subject_equivalences")
}

model HomologationRequest {       // solicitud con soporte y aprobación (externa o casos especiales)
  id                  String              @id @default(uuid())
  tenantId            String              @map("tenant_id")
  studentId           String              @map("student_id")
  programEnrollmentId String              @map("program_enrollment_id")  // programa destino
  type                HomologationType    // EQUIVALENCIA_INTERNA | EXTERNA | VALIDACION_SUFICIENCIA
  status              HomologationStatus  @default(SOLICITADA) // SOLICITADA | EN_REVISION | APROBADA | APROBADA_PARCIAL | RECHAZADA
  originInstitution   String?             @map("origin_institution")
  supportFiles        String[]            @map("support_files")
  reviewedById        String?             @map("reviewed_by_id")
  reviewedAt          DateTime?           @map("reviewed_at")
  decisionNotes       String?             @db.Text @map("decision_notes")
  items               HomologationItem[]
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")
  @@index([tenantId])
  @@index([studentId])
  @@map("homologation_requests")
}

model HomologationItem {
  id               String   @id @default(uuid())
  tenantId         String   @map("tenant_id")
  requestId        String   @map("request_id")
  targetSubjectId  String   @map("target_subject_id")   // asignatura del pensum destino
  originName       String?  @map("origin_name")         // nombre en la institución de origen
  originHours      Int?     @map("origin_hours")
  originGrade      Float?   @map("origin_grade")
  decision         String?                               // APROBADO | RECHAZADO
  request          HomologationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  @@index([tenantId])
  @@index([requestId])
  @@map("homologation_items")
}

model StudyPlanBlock {            // bloque de competencia certificable dentro de un pensum
  id                     String   @id @default(uuid())
  tenantId               String   @map("tenant_id")
  studyPlanId            String   @map("study_plan_id")
  name                   String                                  // "Módulo Contable-Financiero"
  description            String?  @db.Text
  orderIndex             Int      @default(0) @map("order_index")
  certifiable            Boolean  @default(true)
  certificateTemplateId  String?  @map("certificate_template_id") // reutiliza CertificateTemplate existente
  competencyStandardCode String?  @map("competency_standard_code") // código de norma de competencia laboral (opcional)
  @@index([tenantId])
  @@index([studyPlanId])
  @@map("study_plan_blocks")
}
// StudyPlanSubject: agregar  blockId String? @map("block_id")
// Subject y/o StudyPlanSubject: agregar theoreticalHours Int?, practicalHours Int?
```

Migración **solo** con `npx prisma migrate dev --name homologacion_y_rutas`.

## 4. Fases — ejecuta una, verifica, reporta y DETENTE

### Fase A — Cierre de notas e historial académico
- Acción **"Cerrar notas del grupo"** (docente del grupo o admin). Calcula la nota definitiva de cada matriculado a partir de `Grade` y sus `weight`. Muestra la previsualización. Al confirmar, crea `StudentSubjectRecord` (`origin: CURSADA`, `passed = finalGrade >= program.passingGrade`) y bloquea la edición de notas del grupo. Reabrir: solo admin, deja auditoría y anula (`ANULADO`) los registros previos.
  - Si un grupo mezcla estudiantes de programas con distinta `passingGrade`, usa la del programa de cada estudiante. Si un estudiante está en varios programas, usa la más exigente y repórtalo.
  - Revisa la escala real de `Grade` en el código (los exámenes usan 0–100) y normaliza a la escala del programa. No asumas.
- Endpoint `GET /students/:id/academic-record`: historial completo (asignatura, periodo, nota, origen, créditos/horas).
- Backfill opcional e idempotente: para grupos de periodos `CERRADO` con notas completas, genera registros. Reporta cuáles no se pudieron calcular.

### Fase B — Progreso por programa y reconocimiento automático
- Servicio puro `computeProgramProgress(studentId, programEnrollmentId)`. Para cada fila del pensum, estado: `APROBADA` (hay un record vigente con `passed` de esa `Subject` o de una equivalente), `EN_CURSO`, `PENDIENTE` o `BLOQUEADA_POR_PRERREQUISITO`. Devuelve créditos y horas aprobados, % sobre el total del destino y origen de cada aprobación.
- Al **inscribir** a un estudiante en un programa nuevo, muestra antes de confirmar: *"Se reconocerán automáticamente N asignaturas (X créditos, Y%)"*. Al confirmar, crea registros `RECONOCIMIENTO_INTERNO` que apuntan al registro original. Copian nota y `passed`; no se recalcula nada.
- `maxRecognitionPct` **no** limita el reconocimiento interno por misma `Subject`; solo limita la homologación externa. Déjalo configurable y documentado.
- Pruebas: el caso de §0 debe dar exactamente 8/9/6/5 asignaturas reconocidas para los cuatro destinos.

### Fase C — Simulador de doble titulación y matriz de articulación
- `GET /programs/:id/articulation-matrix`: para el programa origen, lista los demás programas `ACTIVO` con créditos/horas reconocibles, % sobre el destino y asignaturas faltantes. Esto **reemplaza** la tabla escrita a mano del documento de la institución.
- `GET /students/:id/double-degree-options`: lo mismo, desde el historial real del estudiante.
- UI admin: pestaña "Articulación" en la ficha del programa, con tabla y diagrama sencillo origen → destinos. Botón para exportar a PDF (reutiliza `pdfExport.ts`); sirve como pieza comercial.
- UI estudiante: tarjeta "Tu ruta a un segundo título" con los programas ordenados por % de avance y lo que le falta.

### Fase D — Homologación con solicitud y aprobación
- Admin: CRUD de `SubjectEquivalence`.
- Flujo `HomologationRequest`: el estudiante o el admin crea la solicitud y adjunta soportes. Usa el módulo de uploads existente y la descarga autenticada. Luego pasa a `EN_REVISION`, y la decisión se toma ítem por ítem.
- Validaciones de homologación externa: nota de origen ≥ `minRecognitionGrade`, horas de origen ≥ horas de la asignatura destino y total reconocido ≤ `maxRecognitionPct` del pensum destino. Bloquea con mensaje claro; el admin puede forzar con justificación obligatoria, que queda auditada.
- Al aprobar se crean los `StudentSubjectRecord` con el origen correspondiente y `sourceRequestId`.
- Notifica al estudiante con el módulo de notificaciones existente.
- Evalúa si encaja reutilizar el módulo de **trámites** (`procedures`) como bandeja de solicitudes. Si encaja, intégralo; si no, explica por qué.

### Fase E — Bloques de competencia y certificación intermedia
- En el editor de pensum: crear y ordenar bloques, asignar asignaturas por arrastre o selector, ver totales por bloque.
- Cuando un estudiante aprueba todas las asignaturas de un bloque `certifiable`, queda **elegible**. El admin emite el certificado con la `CertificateTemplate` del bloque, usando `certificateGenerator.ts` y `CertificateRequest`. No emitas automáticamente sin acción humana.
- Vista estudiante: bloques con progreso y "certificado disponible".

### Fase F — Horas, práctica y validaciones ETDH
- Muestra créditos y horas a la vez (`horas = créditos × hoursPerCredit` cuando falten las horas).
- Horas teóricas/prácticas por asignatura; totales en el pensum.
- **Advertencias (no bloqueos)** en el editor de pensum y al activar una versión:
  - `TECNICO_LABORAL`: total < 600 h, o práctica < 50 % del total.
  - `CONOCIMIENTOS_ACADEMICOS`: total < 160 h.
  - Textos de las advertencias en un solo archivo de configuración, para ajustarlos sin tocar lógica.

## 5. Datos demo (seed)

En el tenant `uniprueba`, carga el **Técnico Laboral en Auxiliar Contable y Financiero** de §0 con sus 12 módulos y 3 bloques. Carga también los 4 programas destino con las asignaturas compartidas exactas de §0. Las asignaturas propias de los destinos no existen en el documento: créalas con nombres marcados `(ejemplo)` para completar cada pensum. Agrega un estudiante egresado del programa contable para que el simulador muestre 8/9/6/5 de entrada.

## 6. Inconsistencias del documento de la institución (no las "corrijas" en datos; repórtalas al usuario)

1. *Contabilidad 1* figura como "Específico", pero se homologa en Asistente Administrativo. Por eso "transversal" se calcula.
2. Los porcentajes se calculan sobre 12 (el origen). Lo correcto es calcularlos sobre el total del destino.
3. El texto dice que el egresado lleva "entre el 40 % y el 70 %" de otros programas, pero la tabla llega a 75 % (Asistente Administrativo).
4. Aparece "Costos y Presupuesto" y también "Costos y Presupuestos": debe ser una sola asignatura.
5. El diagrama muestra 3 destinos y la tabla 4 (falta Asistente Administrativo en el diagrama).
6. 12 créditos × 48 h = **576 h**, por debajo del mínimo de **600 h** para programas de formación laboral. Hay que confirmar con la institución las horas reales de cada módulo.

## 7. Fuera de alcance

Cobro diferenciado o descuentos por créditos homologados (billing), escalas de desempeño de colegio, admisiones/CRM y facturación electrónica DIAN. Anótalos en `docs/DECISIONES_PENDIENTES.md`.

## 8. Definición de terminado (por fase)

- `tsc --noEmit` y `build` limpios en raíz y `backend/`; tests en verde sin bajar de la línea base; lint dentro de los máximos.
- Specs nuevas que cubran al menos:
  - aislamiento entre tenants en todos los `*Id`
  - cierre y reapertura de notas
  - reconocimiento 8/9/6/5 del caso real
  - % calculado sobre el destino
  - límite `maxRecognitionPct` en externa
  - elegibilidad de bloque
  - advertencia de 600 h
- `tenant-isolation-reviewer` sin hallazgos abiertos.
- Prueba en navegador con el tenant demo del flujo: egresado contable → simulador → inscripción en Administración con reconocimiento → certificado de bloque.
- Un commit por fase, en español y con el estilo del repo. Actualiza `docs/ESTRUCTURA_ACADEMICA.md` con historial, homologación, bloques y matriz.
- Al cerrar cada fase: resumen, decisiones propias y preguntas. **Luego detente.**
