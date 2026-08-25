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
