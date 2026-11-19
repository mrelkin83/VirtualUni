# Sistema de diseño del sitio público — «Horizonte Académico»

Generado con Google Stitch (proyecto `15472931827694721300`, design system
`assets/26344c50696b4d0085bcf02c6a689617`) a partir de las referencias que
eligió el usuario: Fundación San Mateo, Politécnico Agroindustrial, Los
Libertadores, Unisalamanca, Unireformada, Unisangil y Unitec. Es la guía de
estilo de las plantillas Eta de este módulo.

## Principios

- Institución educativa colombiana **mixta** (bachillerato por ciclos,
  técnicos laborales, tecnológicos, pregrados): la jerarquía visual nunca
  asume "universidad"; los niveles se nombran por `nav.categorias`.
- Tono: riguroso pero cálido; microcopia directa orientada al logro
  ("Tu futuro comienza aquí", "Así de simple es ingresar").
- Fusión *Corporate Modern* + *Tactile Softness*: lienzo marfil cálido,
  tarjetas blancas elevadas, radios suaves, sombras aterciopeladas.

## Color

El color institucional llega por tenant (`--c1` primario, `--c2` secundario).
Sobre ellos se derivan en CSS:

| Token | Valor | Uso |
| --- | --- | --- |
| `--tinta` | mix(c1 72%, #0b0d16) | superficies oscuras (hero, footer, bandas) |
| `--tinte` | mix(c1 6%, white) | fondos de secciones de apoyo |
| `--lienzo` | `#faf8f5` | fondo base marfil de toda página |
| `--borde-carta` | `rgba(15,23,42,.08)` | borde de tarjetas |

Reglas del sistema Stitch que sí aplican multi-tenant:

- CTAs de conversión siempre sobre `--c1` (garantiza contraste; `--c2` puede
  ser ámbar y no soporta texto blanco).
- `--c2` queda para acentos pequeños: numeración de pasos, íconos de
  beneficios, porcentajes de articulación, badges.
- Verde `#25D366` reservado exclusivamente a WhatsApp.
- Ámbar reservado a badges "NUEVO" y sellos.

## Tipografía (sistema «cartel»)

- Cartelería: **Anton** en mayúsculas (`.font-cartel` / `.titulo-cartel`) —
  el lenguaje promocional condensado de Salamanca/Unitec. Héroes, títulos de
  sección, nombres de nivel, números de paso y cifras.
- Interfaz y cuerpo: **Hanken Grotesk** 400–800 (`font-display` y `font-sans`).
- Datos (fechas, códigos, precios, conteos): **IBM Plex Mono** — se conserva
  del campus para que todo dato duro sea visualmente "dato".

## Piezas del cartel (site.src.css)

- `.sello`: sticker blanco girado («¡Inscripciones abiertas!»).
- `.pleca`: cinta inclinada sobre `--c2`; su texto usa `--c2-ink`, la tinta
  negra/blanca que el controlador calcula por luminancia WCAG del color del
  tenant (ámbar → oscuro, rojo/teal → blanco).
- `.kicker`: antetítulo mono con pleca corta del secundario.
- `.hero-cartel` + `.marco-blob` + `.inicial-fantasma`: héroe póster con
  resplandor orgánico, foto en marco blob o inicial fantasma.
- `.vigilada-borde`: rótulo legal vertical en el borde del héroe
  (Libertadores); el texto sale de `textos.vigilada` según el tipo de
  institución (IES → «Vigilada Mineducación», ETDH/colegios → SED).
- `.ficha-dato`: ficha Unitec «Duración: / Modalidad: / Inversión:».
- Header: barra de contacto sobre el color institucional, botones de
  audiencia delineados (Estudiantes/Aspirantes) y barra de menú sólida a
  todo lo ancho con enlaces en mayúsculas.

## Elevación

1. Tarjetas e inputs: borde `rgba(15,23,42,.08)` + sombra
   `0 4px 20px -2px rgba(27,42,82,.05)`.
2. Hover/activo: borde al tinte del primario + sombra
   `0 12px 32px -4px rgba(27,42,82,.12), 0 2px 6px -1px rgba(27,42,82,.04)`.
3. Flotantes (WhatsApp, buscador superpuesto al hero): sombra de alto impacto.

## Patrones tomados de cada referencia

- **San Mateo**: tarjeta de búsqueda blanca superpuesta al borde del hero con
  chips por nivel; barra superior con lenguaje de audiencias ("Soy
  aspirante", "Soy estudiante"); tarjetas de programa con foto y etiqueta de
  nivel en color.
- **Politécnico Agroindustrial**: instituto mixto como caso primario; barra
  de utilidades (plataforma virtual, PQRSF/consulta); franja "Matrículas
  abiertas"; menús desplegables por grupos institucionales.
- **Unireformada**: banner de convocatoria con periodo visible y CTAs de
  inscripción; accesos a portales.
- **Unisangil**: asesoría por WhatsApp con mensaje contextual; franja de
  cifras de respaldo/acreditación.
- **Los Libertadores**: secciones de vida institucional y noticias (cubierto
  por `nav.paginas` + anuncio del sitio).
