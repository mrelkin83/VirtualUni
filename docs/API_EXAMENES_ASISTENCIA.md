# API de Exámenes y Asistencia

**Módulos:** `backend/src/modules/exams` · `backend/src/modules/attendance`
**Prefijo global:** `api/v1` · **Autenticación:** Bearer JWT + header `X-Tenant-ID`
**Clientes frontend:** `src/api/endpoints/exams.ts` · `src/api/endpoints/attendance.ts`

Todas las consultas están aisladas por tenant. El `ValidationPipe` global usa `whitelist` + `forbidNonWhitelisted`: cualquier campo no declarado en el DTO produce **400 Bad Request**.

---

## 1. Exámenes (`/api/v1/exams`)

### Modelo de datos

```
Exam        ── titulo, instrucciones?, fecha, duracion (min), estado (PROGRAMADO|ACTIVO|FINALIZADO),
               puntajeTotal, notaMinima (def. 6), intentosPermitidos (def. 1),
               mostrarResultados, mezclarPreguntas → pertenece a Course
ExamQuestion ── pregunta, opciones[], respuestaCorrecta (índice), puntaje (def. 1), orderIndex
ExamAttempt  ── estado (EN_CURSO|ENVIADO|CALIFICADO), respuestas (JSON {preguntaId: índice}),
               calificacion?, correctas?, iniciadoAt, enviadoAt? → pertenece a Exam y Student
```

### Endpoints de docente/admin (roles `TEACHER`, `TENANT_ADMIN`)

#### `POST /exams` — Crear examen
```json
{
  "courseId": "uuid-del-curso",
  "titulo": "Parcial 1 - Bases de Datos",
  "instrucciones": "Lee cada pregunta con atención.",
  "fecha": "2026-08-01T14:00:00.000Z",
  "duracion": 60,
  "notaMinima": 6,
  "intentosPermitidos": 1,
  "mostrarResultados": true,
  "mezclarPreguntas": false,
  "preguntas": [
    {
      "pregunta": "¿Qué es una clave primaria?",
      "opciones": ["Un índice", "Un identificador único", "Una relación", "Un tipo de dato"],
      "respuestaCorrecta": 1,
      "puntaje": 2,
      "orderIndex": 0
    }
  ]
}
```
- Valida que el curso exista **en el tenant** (404 si no).
- `puntajeTotal` se calcula como la suma de `puntaje` de las preguntas.
- Estado inicial: `PROGRAMADO` (invisible para estudiantes).

#### `PATCH /exams/:id` — Actualizar
Mismos campos que crear, todos opcionales, **sin** `courseId`. Si se envían `preguntas`, se reemplazan todas las existentes y se recalcula `puntajeTotal`.

#### `DELETE /exams/:id` — Eliminar (borra en cascada preguntas e intentos)

#### `POST /exams/:id/publish` → estado `ACTIVO` (los estudiantes ya pueden verlo y presentarlo)
#### `POST /exams/:id/finalize` → estado `FINALIZADO` (ya no se pueden crear intentos)

#### `GET /exams/:id/results` — Resultados
```json
{
  "examen": { "id": "…", "titulo": "…", "puntajeTotal": 10, "notaMinima": 6 },
  "intentos": [
    { "id": "…", "estudiante": "María González", "studentCode": "STU-001",
      "estado": "CALIFICADO", "calificacion": 8.5, "correctas": 17, "enviadoAt": "…" }
  ],
  "stats": { "presentados": 12, "promedio": 7.3, "aprobados": 9, "reprobados": 3 }
}
```
Aprobado = `calificacion >= notaMinima`.

### Endpoints compartidos

#### `GET /exams?courseId=&estado=` — Listar
- **Docente/Admin:** todos los del tenant; incluye `course { name, code }` y `_count { preguntas, intentos }`.
- **Estudiante:** solo exámenes `ACTIVO`/`FINALIZADO` de cursos donde tiene matrícula (`Enrollment`), y las preguntas llegan **sin `respuestaCorrecta`**.

#### `GET /exams/:id` — Detalle con preguntas (ordenadas por `orderIndex`; sin `respuestaCorrecta` para estudiantes).

### Endpoints de estudiante (rol `STUDENT`)

#### `POST /exams/:id/attempts` — Iniciar intento
Validaciones (en orden): examen existe en el tenant (404) → estado `ACTIVO` (400) → estudiante matriculado en el curso (403) → intentos previos `ENVIADO|CALIFICADO` < `intentosPermitidos` (400).

Respuesta: el intento `EN_CURSO` con el examen embebido:
```json
{
  "id": "attempt-uuid", "estado": "EN_CURSO", "respuestas": {},
  "exam": { "id": "…", "titulo": "…", "duracion": 60,
            "preguntas": [ { "id": "q-uuid", "pregunta": "…", "opciones": ["…"], "puntaje": 2 } ] }
}
```
⚠️ Las preguntas nunca incluyen `respuestaCorrecta` — la calificación ocurre solo en el servidor.

#### `POST /exams/attempts/:attemptId/submit` — Enviar y calificar
```json
{ "respuestas": { "q-uuid-1": 1, "q-uuid-2": 3 } }
```
- Verifica que el intento pertenezca al estudiante y esté `EN_CURSO`.
- Auto-calificación: `calificacion = round((puntosObtenidos / puntajeTotal) * 10, 1)`.
- Respuesta: intento con `estado: "CALIFICADO"`, `calificacion`, `correctas`, `totalPreguntas`.

#### `GET /exams/attempts/my` — Mis intentos (con `exam { titulo, courseId }`).

---

## 2. Asistencia (`/api/v1/attendance`)

### Modelo de datos

```
Attendance ── fecha (DATE), estado (PRESENTE|AUSENTE|TARDE|JUSTIFICADO), observacion?,
              registradoPor (userId docente) → pertenece a Course y Student
              UNIQUE (courseId, studentId, fecha)  ← re-registrar el mismo día actualiza, no duplica
```

### `POST /attendance/bulk` — Registrar asistencia (roles `TEACHER`, `TENANT_ADMIN`)
```json
{
  "courseId": "uuid-del-curso",
  "fecha": "2026-07-20",
  "registros": [
    { "studentId": "uuid-est-1", "estado": "PRESENTE" },
    { "studentId": "uuid-est-2", "estado": "TARDE", "observacion": "Llegó 15 min tarde" },
    { "studentId": "uuid-est-3", "estado": "AUSENTE" }
  ]
}
```
- Valida curso del tenant (404). Upsert transaccional por la unique `(courseId, studentId, fecha)`.
- Respuesta: `{ "total": 3, "registrados": 3 }`.

### `GET /attendance?courseId=&fecha=&from=&to=` (roles `TEACHER`, `TENANT_ADMIN`)
Filtros: `fecha` exacta **o** rango `from`/`to`. Incluye `student { studentCode, user { firstName, lastName } }`. Orden: fecha descendente.

### `GET /attendance/my?courseId=` (rol `STUDENT`)
Historial del estudiante autenticado (resuelto por su `userId`; 403 si el usuario no tiene perfil de estudiante).

### `GET /attendance/course/:courseId/stats` (roles `TEACHER`, `TENANT_ADMIN`)
```json
{
  "courseId": "…",
  "totalSesiones": 14,
  "porEstado": { "PRESENTE": 150, "AUSENTE": 12, "TARDE": 8, "JUSTIFICADO": 4 },
  "porEstudiante": [
    { "studentId": "…", "nombre": "María González", "studentCode": "STU-001",
      "presentes": 12, "ausentes": 1, "tardes": 1, "justificados": 0,
      "porcentajeAsistencia": 92.9 }
  ]
}
```
`porcentajeAsistencia = (presentes + tardes + justificados) / totalSesiones` (redondeado a 1 decimal; `0` sin sesiones).

---

## 3. Integración en el frontend

| Pantalla | Hook / componente | Comportamiento |
|---|---|---|
| Docente → Exámenes | `useTeacherDashboard` (`crearExamen`, `editarExamen`, `eliminarExamen`, `publicarExamen`, `verResultadosExamen`) | Llama al API cuando el curso tiene id real (uuid); si el backend no responde, respaldo local (patrón híbrido). |
| Docente → Asistencia | `AsistenciaSection` (`handleGuardarAsistencia`) | Persiste con `POST /attendance/bulk` cuando curso y estudiantes tienen ids reales; exige seleccionar un curso específico. |
| Estudiante → Exámenes | `useStudentDashboard` (`iniciarExamenNuevo`, `finalizarExamen`) | Carga exámenes `ACTIVO` + intentos previos al montar; iniciar crea el intento en el servidor; finalizar envía respuestas y muestra la calificación del servidor. |

**Mapeo de estados backend → UI:**

| Backend | UI docente | UI estudiante |
|---|---|---|
| `PROGRAMADO` | `programado` | (no visible) |
| `ACTIVO` | `activo` | `pendiente` |
| `FINALIZADO` | `finalizado` | `finalizado` |
| Intento `CALIFICADO` | — | `calificado` (+ nota) |

## 4. Errores comunes

| Código | Causa |
|---|---|
| 400 | Campo extra no permitido por el DTO; examen no `ACTIVO` al iniciar intento; máximo de intentos alcanzado; intento ya enviado |
| 401 | Token ausente/expirado (el frontend intenta refresh automático) |
| 403 | Rol sin permiso; estudiante no matriculado en el curso; intento de otro estudiante |
| 404 | Examen/curso/intento inexistente **en el tenant actual** |
