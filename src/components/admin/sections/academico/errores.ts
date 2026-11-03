/** Mensaje legible desde un error de axios/Nest (message string o string[]). */
export function mensajeDeError(err: unknown): string {
  const data = (err as any)?.response?.data;
  const mensaje = data?.message;
  if (Array.isArray(mensaje)) return mensaje.join('\n');
  if (typeof mensaje === 'string') return mensaje;
  return (err as any)?.message ?? 'Error inesperado';
}
