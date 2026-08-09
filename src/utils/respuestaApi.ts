/**
 * Extrae la lista de una respuesta de la API.
 *
 * Los listados del backend no son homogéneos: unos devuelven un arreglo pelado
 * (`/library/books`, `/finance/invoices`) y otros un sobre de paginación
 * — `{ data, pagination }` en procedures, announcements y mass-messages;
 * `{ data, meta }` en assets, inventory, hr, payroll y card-issuances —. Encima,
 * los clientes de `src/api/endpoints` vuelven a envolverlo en `{ data }`.
 *
 * Quedarse en el nivel equivocado deja un objeto donde el componente espera un
 * arreglo, y un `.map` sobre eso lanza un TypeError que React propaga hasta
 * desmontar el panel completo. Esta función desenvuelve hasta encontrar la
 * lista y, si no la encuentra, devuelve un arreglo vacío: preferible una
 * sección vacía a una aplicación caída.
 */
export function comoArreglo<T = any>(respuesta: unknown): T[] {
  let actual: any = respuesta;

  for (let i = 0; i < 4; i++) {
    if (Array.isArray(actual)) return actual as T[];
    if (actual && typeof actual === 'object') {
      if (Array.isArray(actual.data)) return actual.data as T[];
      if (Array.isArray(actual.items)) return actual.items as T[];
      if (Array.isArray(actual.results)) return actual.results as T[];
      actual = actual.data;
      continue;
    }
    break;
  }

  return [];
}
