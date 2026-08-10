# Decisiones pendientes

Cosas que **no son defectos** sino elecciones de negocio o de infraestructura. Se
dejan aquí, con recomendación, en lugar de resolverlas por cuenta propia porque
cambian comportamiento visible, cuestan dinero o alteran la topología de
despliegue. Todo lo que sí era un defecto medible ya está corregido y desplegado.

---

## 1. Pasarela de pago

**Estado:** `realizarPago` no simula ningún cobro. Deja la deuda pendiente y lo
dice con claridad, porque no hay ninguna pasarela configurada (`stripe` está en
las dependencias pero sin claves ni webhook operativo).

**Decisión:** conectar una pasarela real (Stripe u otra) con sus claves y su
webhook, o mantener el pago fuera de la aplicación.

**Recomendación:** si se quiere cobrar dentro de la plataforma, Stripe ya está
como dependencia; falta `STRIPE_SECRET_KEY`, el endpoint de webhook y validar la
firma. Hasta entonces, no fingir el pago es lo correcto.

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

## 3. Topología de despliegue: imágenes publicadas vs. compose

**Estado (medido):** `.github/workflows/deploy.yml` construye y publica en Docker
Hub las imágenes `virtualuni-frontend` y `virtualuni-backend`, pero el
`docker-compose.yml` del servidor **no consume ninguna de las dos**:

- `backend` usa `build: ./backend` (no `image:`), así que `docker-compose pull` no
  puede traerlo y `up -d` lo reconstruye desde el código del servidor.
- `nginx` usa `image: nginx:alpine` y sirve `./dist` por volumen. La imagen
  `virtualuni-frontend` publicada nunca se usa.
- `dist` está en `.gitignore` (líneas 11-12) y el script de despliegue sólo hace
  `git pull` — **no** ejecuta `npm run build`. Consecuencia: en el servidor
  `./dist` estaría vacío y nginx serviría un sitio en blanco.

**Por qué no lo arreglo por mi cuenta:** hay dos topologías válidas y son
mutuamente excluyentes; elegir una cambia el flujo de despliegue y no puedo
probarlo aquí (el demonio de Docker no corre en esta máquina).

**Recomendación — elegir A o B:**

- **A. Despliegue por imágenes (aprovecha lo que deploy.yml ya publica):**
  en `docker-compose.yml`, que `backend` use
  `image: ${DOCKER_USERNAME}/virtualuni-backend:latest` en lugar de `build:`, y
  que `nginx` use `image: ${DOCKER_USERNAME}/virtualuni-frontend:latest` (que ya
  trae `dist` horneado) en vez de `nginx:alpine` + volumen `./dist`. Así
  `docker-compose pull && up -d` en el servidor despliega exactamente lo probado
  en CI.

- **B. Despliegue desde código (más simple, sin registro):** borrar los pasos de
  build-and-push de `deploy.yml` y añadir `npm ci && npm run build` (frontend) en
  el script del servidor antes de `docker-compose up -d`, para que `./dist` exista.

Cualquiera de las dos cierra el hueco. Hoy el pipeline hace trabajo (publicar
imágenes) que el despliegue tira a la basura, y el frontend no llegaría al
servidor.

**Ya corregido y no forma parte de esta decisión:** que la CLI de `prisma`
faltara en la imagen de producción (movida a dependencias), el `HEALTHCHECK` del
backend apuntando a `/api/health` (404 → `/api/v1/health`), y que la validación
de entorno no atrapara los placeholders `your-production-...` de compose.
