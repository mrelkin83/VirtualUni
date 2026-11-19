import { createContext, useContext, type ReactNode } from 'react';

/**
 * Avisos de la aplicación.
 *
 * Hay dos formas de usarlos y las dos hacen falta:
 *
 *   useToast()  dentro de un componente, cuando ya estás en su cuerpo.
 *   avisar.*    desde cualquier sitio, incluido un `catch`, un `then` o una
 *               función auxiliar fuera del componente.
 *
 * La segunda existe porque los `alert()` que hay que sustituir no viven todos
 * en el cuerpo de un componente: muchos están dentro de manejadores y de
 * promesas, donde un hook no se puede invocar. Sin este emisor, migrarlos
 * exigiría reestructurar cada archivo a mano.
 *
 * `ToastProvider` se registra al montarse. Si no hay proveedor —una prueba, un
 * render aislado— el aviso no se pierde: cae a la consola, y la confirmación
 * cae al `confirm` del navegador. Degradar es preferible a tragarse el mensaje.
 */

export type TonoAviso = 'ok' | 'error' | 'info' | 'warn';

export interface ApiAvisos {
  /** `ms` a 0 deja el aviso fijo hasta que lo descarten. */
  avisar: (mensaje: ReactNode, tono?: TonoAviso, ms?: number) => void;
  ok: (mensaje: ReactNode) => void;
  error: (mensaje: ReactNode) => void;
  info: (mensaje: ReactNode) => void;
}

export const AvisosCtx = createContext<ApiAvisos | null>(null);

export function useToast(): ApiAvisos {
  const ctx = useContext(AvisosCtx);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Emisor sin hook                                                      */
/* ------------------------------------------------------------------ */

type Emisor = (mensaje: ReactNode, tono: TonoAviso, ms?: number) => void;

let emisor: Emisor | null = null;

/** La usa ToastProvider al montarse. Devuelve la función para darse de baja. */
export function registrarEmisor(fn: Emisor): () => void {
  emisor = fn;
  return () => {
    if (emisor === fn) emisor = null;
  };
}

function emitir(mensaje: ReactNode, tono: TonoAviso, ms?: number) {
  if (emisor) {
    emisor(mensaje, tono, ms);
    return;
  }
  // Sin proveedor montado. No se traga el mensaje.
  const texto = typeof mensaje === 'string' ? mensaje : '[aviso]';
  if (tono === 'error') console.error(texto);
  else console.warn(texto);
}

export const avisar = {
  ok: (mensaje: ReactNode) => emitir(mensaje, 'ok'),
  error: (mensaje: ReactNode) => emitir(mensaje, 'error'),
  info: (mensaje: ReactNode) => emitir(mensaje, 'info'),
  warn: (mensaje: ReactNode) => emitir(mensaje, 'warn'),
  /** Control fino: tono y duración explícitos. */
  con: (mensaje: ReactNode, tono: TonoAviso = 'info', ms?: number) =>
    emitir(mensaje, tono, ms),
};

/* ------------------------------------------------------------------ */
/* Confirmación                                                         */
/* ------------------------------------------------------------------ */

export interface OpcionesConfirmar {
  titulo: string;
  mensaje: string;
  /** Qué dice el botón que ejecuta. «Eliminar», no «Aceptar». */
  textoConfirmar?: string;
  textoCancelar?: string;
  destructiva?: boolean;
}

type Confirmador = (o: OpcionesConfirmar) => Promise<boolean>;

let confirmador: Confirmador | null = null;

export function registrarConfirmador(fn: Confirmador): () => void {
  confirmador = fn;
  return () => {
    if (confirmador === fn) confirmador = null;
  };
}

/**
 * Sustituto de `window.confirm`. Devuelve una promesa, así que quien la llama
 * tiene que ser `async`.
 *
 * Acepta una cadena suelta para que la migración desde `confirm('¿Seguro?')`
 * sea directa; con un objeto se puede nombrar la acción en el botón, que es
 * lo que evita los borrados por error.
 */
export function confirmar(
  opciones: OpcionesConfirmar | string,
): Promise<boolean> {
  const o: OpcionesConfirmar =
    typeof opciones === 'string'
      ? { titulo: 'Confirmar', mensaje: opciones }
      : opciones;

  if (confirmador) return confirmador(o);

  // Sin proveedor: el diálogo del navegador antes que perder la confirmación.
  if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
    return Promise.resolve(window.confirm(o.mensaje));
  }
  return Promise.resolve(false);
}
