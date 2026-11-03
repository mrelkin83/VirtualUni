/**
 * Formato de moneda y fechas, unificado.
 *
 * Antes cada componente traía su propia copia: `formatMoney` en
 * CertificadosSection y FinancieroSection, `formatCurrency` en
 * FinanzasContabilidadSection y FinancialTrendsChart (esta última con
 * agrupación en formato US: `$1,234`), y `formatDate` en ExpedicionesTab.
 * El mismo peso colombiano se veía distinto según la pantalla.
 */

/**
 * Pesos colombianos sin decimales (el COP no usa centavos en la práctica).
 * `gratisSiCero` muestra "Gratis" en vez de "$ 0" — útil en catálogos.
 */
export function formatearCop(monto: number, opciones?: { gratisSiCero?: boolean }): string {
  if (opciones?.gratisSiCero && monto === 0) return 'Gratis';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

/** Fecha corta en español: 5 mar 2026. */
export function formatearFecha(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Fecha y hora en español: 5 mar 2026, 14:30. */
export function formatearFechaHora(fecha: string | Date): string {
  return new Date(fecha).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
