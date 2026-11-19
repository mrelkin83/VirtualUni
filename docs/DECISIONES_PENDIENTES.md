# Decisiones pendientes

Cosas que **no son defectos** sino elecciones de negocio o de infraestructura. Se
dejan aquí, con recomendación, en lugar de resolverlas por cuenta propia porque
cambian comportamiento visible, cuestan dinero o alteran la topología de
despliegue. Todo lo que sí era un defecto medible ya está corregido y desplegado.

---

## 1. Pasarela de pago — RESUELTO (2026-08-25)

**Estado:** se reemplazó Stripe por **Wompi** (pasarela colombiana; único
método viable para cobrar en COP a instituciones en Colombia). El módulo
`billing` genera la URL de checkout con firma de integridad, verifica el
checksum del webhook, y activa/extiende la suscripción del tenant cuando la
transacción llega `APPROVED`. Falta configurar las llaves reales
(`WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET`,
`WOMPI_INTEGRITY_SECRET`) en el panel de Wompi y en el entorno de producción.

**Limitación conocida, por diseño:** Wompi no tiene suscripciones recurrentes
nativas como Stripe. Cada checkout paga un periodo de un mes; la renovación
**no es automática** — el tenant debe volver a pagar. Automatizar el cobro
periódico (con una fuente de pago tokenizada y reintentos) es un proyecto
aparte, no incluido aquí. `realizarPago` (deuda de estudiante, no suscripción
de tenant) sigue sin pasarela — sigue siendo una decisión de negocio aparte.

**Nota sobre el precio:** los montos en `PLAN_PRICES_COP`
(`backend/src/modules/billing/billing.service.ts`) son un placeholder — no
había una cifra de negocio definida al hacer este cambio.

**No toca el checkout del frontend:** confirmado que ningún componente llama
hoy a `POST /billing/checkout` — no existe pantalla de "comprar plan" que
actualizar. Es una tarea aparte si se quiere construirla.

---

## 2. Anuncios / mensajes masivos de docentes

**Estado:** el backend impide que un docente publique anuncios o mensajes
masivos. No es un guard demasiado estricto: los modelos `Announcement` y
`MassMessage` **no tienen campo de curso**, así que un anuncio de un docente
llegaría a toda la institución, no a sus alumnos. La restricción es coherente con
el modelo de datos actual.

**Decisión:** decidir si los docentes deben poder comunicar a sus cursos.

**Recomendación:** si se quiere, la solución es añadir `courseId` (opcional) a
`Announcement`/`MassMessage` y filtrar por matrícula, **no** relajar el guard
sobre el modelo actual (eso convertiría cada anuncio de un profesor en un
comunicado a toda la universidad).

---

## 3. Topología de despliegue — RESUELTO (2026-08-25): opción A

**Estado anterior (medido):** `.github/workflows/deploy.yml` construía y
publicaba en Docker Hub las imágenes `virtualuni-frontend` y
`virtualuni-backend`, pero `docker-compose.yml` no consumía ninguna de las
dos (`backend` con `build:`, `nginx` con `nginx:alpine` + volumen `./dist`
que el script de despliegue nunca generaba).

**Arreglado:** `docker-compose.yml` ahora usa
`image: ${DOCKER_USERNAME}/virtualuni-backend:latest` y
`image: ${DOCKER_USERNAME}/virtualuni-frontend:latest` (esa imagen ya trae
`dist` y `nginx.conf` horneados — no hace falta el volumen). `scripts/deploy.sh`
pasa de `docker-compose up -d --build` a `docker-compose pull && up -d`,
coherente con lo que `deploy.yml` ya hacía por SSH.

**Pendiente para que funcione en el servidor real:** un archivo `.env` junto a
`docker-compose.yml` en el servidor con `DOCKER_USERNAME=<usuario-de-docker-hub>`
(la imagen falla al resolver sin esto — a propósito, con un mensaje claro en
vez de silenciosamente construir algo distinto) y confirmar que los secretos
`DOCKER_USERNAME`/`DOCKER_PASSWORD`/`DEPLOY_HOST`/`DEPLOY_USER`/`DEPLOY_SSH_KEY`
ya estén configurados en GitHub Actions (Settings → Secrets → Actions) para
que `deploy.yml` pueda publicar y desplegar.

**Ya corregido y no forma parte de esta decisión:** que la CLI de `prisma`
faltara en la imagen de producción (movida a dependencias), el `HEALTHCHECK` del
backend apuntando a `/api/health` (404 → `/api/v1/health`), y que la validación
de entorno no atrapara los placeholders `your-production-...` de compose.

---

## Estructura académica (fases 1–2, 2026-11-03) — decisiones abiertas

**Programas creados por el backfill:** `Student.program` era texto libre; el
backfill creó un `Program` en `BORRADOR` por cada valor distinto con
`educationLevel: OTRO` y estructura genérica (`VIRTUAL`/`SEMESTRAL`/`CREDITOS`,
campos obligatorios del modelo). El admin debe completar nivel, modalidad y
periodicidad reales de cada uno y pasarlos a `ACTIVO`.

**Campos legados:** `Course.code/name/credits/semester` y
`Student.program/semester` se conservan como legado de solo lectura. Decidir
cuándo retirarlos en una migración posterior, una vez la UI use solo la
estructura nueva.

**Fuera de alcance anotado (no implementado a propósito):** escalas de
calificación configurables por programa (Decreto 1290 para colegios), boletines
y certificados de notas oficiales, homologaciones, admisiones/CRM, cobro por
programa y facturación electrónica DIAN. `maxCourses` del plan sigue contando
grupos.

---

## Homologación y rutas académicas (2026-11-03) — decisiones abiertas

**Horas reales de los módulos (bloqueante para la institución):** el programa
contable declara 12 créditos × 48 h = 576 h, por debajo del mínimo de 600 h de
formación laboral. El sistema avisa pero no bloquea. Hay que confirmar con la
institución las horas reales de cada módulo y su desglose teórico/práctico: sin
ese dato, el porcentaje de práctica (que debería ser ≥ 50 %) no se puede
validar de verdad.

**Visibilidad del profesorado:** hoy un `TEACHER` puede consultar el historial,
el avance, los bloques y las solicitudes de homologación de **cualquier**
estudiante de su tenant, no solo de los de sus grupos (sí está restringido para
cerrar notas, que exige ser el docente del grupo). Es deliberado — asesoría
académica — pero conviene confirmarlo con la institución; si quieren
"solo mis estudiantes", hace falta un chequeo de pertenencia a grupo en
`historialEstudiante`, `progresoDeInscripcion`, `opcionesDobleTitulacion`,
`bloquesDeEstudiante`, `listarSolicitudes` y `obtenerSolicitud`.

**Registros duplicados por reconocimiento interno:** al inscribir en un
programa nuevo se crea un `StudentSubjectRecord` `RECONOCIMIENTO_INTERNO` que
apunta al original, aunque el avance ya se calcularía bien sin él (el historial
es del estudiante). Se hace para dejar constancia de qué se reconoció y quién
lo autorizó; el cálculo ignora los duplicados quedándose con el registro más
antiguo de cada asignatura. Si molesta el ruido en el historial, la alternativa
es una tabla de auditoría aparte.

**Escala de la nota de origen en homologación externa:** se interpreta como
escala del programa si el valor es ≤ `gradeScaleMax`, y como 0–100 si es mayor.
Es una heurística: si la institución recibe transcripciones en escalas
distintas (0–10, A–F), hace falta un campo de escala de origen explícito.

**Certificados de bloque:** se identifican por el nombre del bloque dentro de
`CertificateRequest.motivo` (`tipo: 'BLOQUE'`), porque `CertificateRequest` no
tiene un campo para el bloque. Funciona, pero renombrar un bloque desliga sus
certificados ya emitidos. Si los certificados intermedios se vuelven
frecuentes, conviene un `blockId` en `CertificateRequest`.

**Fuera de alcance anotado (no implementado a propósito):** cobro diferenciado
o descuentos por créditos homologados (billing), escalas de desempeño de
colegio, admisiones/CRM y facturación electrónica DIAN.

## Sitio web público e inscripciones (nov 2026)

- **Datos obligatorios de publicidad por tipo**: los rótulos SNIES / registro
  ETDH / licencia ya se muestran cuando el programa trae `officialCode`, pero
  QUÉ es legalmente obligatorio mostrar en cada caso debe confirmarlo cada
  institución con su secretaría de educación / MEN. No se afirma como regla
  legal en la UI.
- **Material a nivel de "programa"**: la ficha pública muestra el pensum y la
  articulación; un material colgado del programa (no de asignatura/grupo)
  exigiría migración aparte.
- **Cambio de contraseña obligatorio al primer ingreso**: `User` no tiene
  campo `mustChangePassword`; al admitir se envía clave temporal por correo
  con la instrucción de cambiarla. Añadir el campo + enforcement en auth es
  una migración pequeña pendiente de decidir.
- **Vista previa en desarrollo**: el iframe/enlace de vista previa apunta a la
  raíz del host; con Vite en dev la raíz no pasa por nginx, así que la vista
  previa completa solo se ve con el stack de producción (o entrando directo a
  `http://<slug>.localhost:4000/?preview=…`).
- **Rendimiento móvil exacto**: Lighthouse del entorno midió
  accesibilidad/best-practices/SEO = 100 en portada, oferta y ficha, pero no
  emite la categoría performance; dejar un job de CI con
  `lighthouse --preset=mobile` para la cifra formal (meta ≥ 90).
- **Registro de las secciones nuevas del admin** (`Sitio web`, `Admisiones`,
  `Integraciones`)
  vive en `navegacion.ts`/`AdminDashboard.tsx`, que cargan un rediseño ajeno
  sin commitear: las 7 líneas de registro están en el working tree y viajarán
  con ese trabajo (o en un commit propio cuando el árbol se estabilice).
- **Fuera de alcance confirmado (§11)**: dominio propio con HTTPS automático,
  blog, chat en vivo, agenda de entrevistas, becas/descuentos, pagos de
  matrícula/pensiones, facturación DIAN, bot de WhatsApp (el outbox ya emite
  los eventos), SSO, plugin WordPress, botón de pago de pensiones.
- **Planes por nivel de integración (§13.7)**: `enableEmbed`/`enablePublicApi`
  quedan como banderas; qué plan incluye qué es decisión comercial.
  Sugerencia: enlace+widget en básicos, API+webhooks en el superior.
- **QR en el navegador**: los códigos QR del panel Integraciones se dibujan
  en el cliente (librería `qrcode` sobre canvas) y se descargan como PNG;
  generarlos en el servidor (p. ej. para incluirlos en PDFs o correos) queda
  pendiente de que haya un caso que lo pida.
- **Widget «estado» y cookies de terceros**: dentro del iframe la cookie de
  sesión del aspirante es de tercer origen y navegadores que las bloquean
  (Safari ITP) no la envían; el flujo de inscripción ya no depende de ella
  (token por cabecera `X-Asp-Session`), pero el widget de CONSULTA de estado
  tras canjear un enlace mágico sí usa cookie: en esos navegadores el
  aspirante debe consultar en el sitio del tenant, no incrustado. Documentado
  en el panel; una solución completa (token en URL post-canje) queda
  pendiente.
- **Rate limit de la API pública en memoria**: la ventana de límites vive en
  el proceso; con varias réplicas del backend el límite efectivo se
  multiplica. Mover el contador a Postgres/Redis cuando haya más de una
  réplica.
