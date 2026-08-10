import { validarEntorno, asegurarEntornoValido } from './validate-env';

const SECRETO_FUERTE_A = 'a'.repeat(48);
const SECRETO_FUERTE_B = 'b'.repeat(48);

const entornoValido = (extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({
  JWT_SECRET: SECRETO_FUERTE_A,
  JWT_REFRESH_SECRET: SECRETO_FUERTE_B,
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  FRONTEND_URL: 'http://localhost:3000',
  ...extra,
});

describe('validarEntorno', () => {
  it('no reporta errores con una configuración correcta', () => {
    expect(validarEntorno(entornoValido()).errores).toEqual([]);
  });

  it('detecta los secretos por defecto del repositorio', () => {
    const { errores } = validarEntorno(
      entornoValido({
        JWT_SECRET: 'virtualuni-super-secret-jwt-key-change-in-production-2024',
      }),
    );

    expect(errores.some((e) => e.includes('JWT_SECRET'))).toBe(true);
  });

  // Los placeholders de docker-compose.yml superan los 32 caracteres y difieren
  // entre sí, así que pasaban la longitud y la comparación de igualdad. Antes de
  // añadirlos a la lista / la heurística `your-`, este caso devolvía 0 errores.
  it('detecta los placeholders de docker-compose', () => {
    const { errores } = validarEntorno(
      entornoValido({
        NODE_ENV: 'production',
        JWT_SECRET: 'your-production-jwt-secret-key-minimum-32-characters-long',
        JWT_REFRESH_SECRET: 'your-production-refresh-secret-key-minimum-32-characters-long',
        DATABASE_URL: 'postgresql://postgres:your-secure-password@postgres:5432/virtualuni',
      }),
    );

    expect(errores.some((e) => e.includes('JWT_SECRET'))).toBe(true);
    expect(errores.some((e) => e.includes('JWT_REFRESH_SECRET'))).toBe(true);
    expect(errores.some((e) => e.includes('DATABASE_URL'))).toBe(true);
  });

  it('detecta secretos demasiado cortos', () => {
    const { errores } = validarEntorno(entornoValido({ JWT_SECRET: 'corto' }));

    expect(errores.some((e) => e.includes('demasiado corto'))).toBe(true);
  });

  it('detecta secretos ausentes', () => {
    const env = entornoValido();
    delete env.JWT_REFRESH_SECRET;

    expect(validarEntorno(env).errores.some((e) => e.includes('no está definido'))).toBe(true);
  });

  // Reutilizar el mismo secreto haría que un token de acceso sirviera como refresh.
  it('detecta que ambos secretos sean iguales', () => {
    const { errores } = validarEntorno(
      entornoValido({ JWT_REFRESH_SECRET: SECRETO_FUERTE_A }),
    );

    expect(errores.some((e) => e.includes('iguales'))).toBe(true);
  });

  it('exige DATABASE_URL', () => {
    const env = entornoValido();
    delete env.DATABASE_URL;

    expect(validarEntorno(env).errores.some((e) => e.includes('DATABASE_URL'))).toBe(true);
  });

  it('avisa si falta FRONTEND_URL en producción', () => {
    const env = entornoValido({ NODE_ENV: 'production' });
    delete env.FRONTEND_URL;

    expect(validarEntorno(env).avisos.some((a) => a.includes('FRONTEND_URL'))).toBe(true);
  });
});

describe('asegurarEntornoValido', () => {
  it('aborta el arranque en producción con configuración insegura', () => {
    const env = entornoValido({ NODE_ENV: 'production', JWT_SECRET: 'corto' });

    expect(() => asegurarEntornoValido(env)).toThrow(/Configuración insegura/);
  });

  it('no aborta en desarrollo, sólo advierte', () => {
    const env = entornoValido({ NODE_ENV: 'development', JWT_SECRET: 'corto' });

    expect(() => asegurarEntornoValido(env)).not.toThrow();
  });

  it('no aborta en producción si todo es correcto', () => {
    const env = entornoValido({ NODE_ENV: 'production' });

    expect(() => asegurarEntornoValido(env)).not.toThrow();
  });
});
