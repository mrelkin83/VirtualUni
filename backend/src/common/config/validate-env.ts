import { Logger } from '@nestjs/common';

const logger = new Logger('ConfigValidation');

/** Longitud mínima razonable para un secreto HMAC. */
const LONGITUD_MINIMA_SECRETO = 32;

/**
 * Valores que venían por defecto en el repositorio. Nunca deben llegar a un
 * entorno real: cualquiera que haya visto el código podría firmar tokens.
 */
const SECRETOS_CONOCIDOS = [
  'virtualuni-super-secret-jwt-key-change-in-production-2024',
  'virtualuni-super-secret-refresh-key-change-in-production-2024',
  'secret',
  'changeme',
];

export interface ResultadoValidacion {
  errores: string[];
  avisos: string[];
}

/**
 * Comprueba la configuración sensible. En producción los problemas son
 * errores fatales; en desarrollo se degradan a avisos para no estorbar.
 */
export function validarEntorno(env: NodeJS.ProcessEnv = process.env): ResultadoValidacion {
  const errores: string[] = [];
  const avisos: string[] = [];
  const esProduccion = env.NODE_ENV === 'production';

  const revisarSecreto = (nombre: string) => {
    const valor = env[nombre];

    if (!valor) {
      errores.push(`${nombre} no está definido.`);
      return;
    }

    if (SECRETOS_CONOCIDOS.includes(valor)) {
      errores.push(
        `${nombre} conserva el valor por defecto del repositorio. Genera uno nuevo: ` +
          `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
      );
      return;
    }

    if (valor.length < LONGITUD_MINIMA_SECRETO) {
      errores.push(
        `${nombre} es demasiado corto (${valor.length} caracteres, mínimo ${LONGITUD_MINIMA_SECRETO}).`,
      );
    }
  };

  revisarSecreto('JWT_SECRET');
  revisarSecreto('JWT_REFRESH_SECRET');

  if (env.JWT_SECRET && env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
    errores.push(
      'JWT_SECRET y JWT_REFRESH_SECRET son iguales: un token de acceso valdría como refresh.',
    );
  }

  if (!env.DATABASE_URL) {
    errores.push('DATABASE_URL no está definido.');
  }

  if (esProduccion && !env.FRONTEND_URL) {
    avisos.push('FRONTEND_URL no está definido: CORS puede bloquear al frontend.');
  }

  return { errores, avisos };
}

/**
 * Aplica el resultado de la validación. Aborta el arranque en producción si
 * hay errores; en desarrollo sólo advierte.
 */
export function asegurarEntornoValido(env: NodeJS.ProcessEnv = process.env): void {
  const { errores, avisos } = validarEntorno(env);

  for (const aviso of avisos) {
    logger.warn(aviso);
  }

  if (errores.length === 0) {
    return;
  }

  if (env.NODE_ENV === 'production') {
    for (const error of errores) {
      logger.error(error);
    }
    throw new Error(
      'Configuración insegura: revisa las variables de entorno antes de arrancar en producción.',
    );
  }

  for (const error of errores) {
    logger.warn(`[solo desarrollo] ${error}`);
  }
}
