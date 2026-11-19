/**
 * Qué color de texto va encima de cada relleno de marca.
 *
 * Por el código hay varias listas que guardan el relleno en un campo `color`
 * —tarjetas de reporte, distintivos de rol, cabeceras de curso, grupos— y que
 * lo pintaban con un `text-white` fijo al lado. Eso solo funciona mientras el
 * relleno sea oscuro, y el acento secundario lo elige cada institución: el
 * naranja de la de prueba deja el blanco en 2.77:1, por debajo del 4.5 de AA.
 *
 * Los tokens `*-ink` ya vienen calculados por contraste contra su propio
 * relleno (ver src/theme/aplicarAcento.ts). Aquí solo se emparejan.
 */
const TINTA_DE_RELLENO: Record<string, string> = {
  'bg-pn-accent': 'text-pn-accent-ink',
  'bg-pn-accent-hover': 'text-pn-accent-ink',
  'bg-pn-accent-2': 'text-pn-accent-2-ink',
  // Los semánticos son oscuros por definición: se fijan en index.css y no
  // dependen del tenant, así que la superficie clara siempre contrasta.
  'bg-pn-ok': 'text-pn-surface',
  'bg-pn-warn': 'text-pn-surface',
  'bg-pn-danger': 'text-pn-surface',
  'bg-pn-info': 'text-pn-surface',
  'bg-pn-ink': 'text-pn-surface',
  'bg-pn-muted': 'text-pn-surface',
};

/**
 * Devuelve la clase de texto que contrasta con `relleno`. Si el relleno no
 * está en el mapa cae en la superficie clara, que es lo que vale para los
 * rellenos oscuros, que son la mayoría.
 */
export function tintaDeRelleno(relleno: string | undefined): string {
  if (!relleno) return 'text-pn-surface';
  // El campo puede traer más de una clase ('bg-pn-ok rounded-lg'): se busca
  // la primera que sea un relleno conocido.
  for (const clase of relleno.split(/\s+/)) {
    const tinta = TINTA_DE_RELLENO[clase];
    if (tinta) return tinta;
  }
  return 'text-pn-surface';
}
