import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { leerSeccionDeRuta, useSeccionEnUrl } from './useSeccionEnUrl';

const SECCIONES = ['inicio', 'tareas', 'notas'] as const;
type Seccion = (typeof SECCIONES)[number];

const esValida = (v: string): v is Seccion =>
  (SECCIONES as readonly string[]).includes(v);

/** Dashboard mínimo con la misma forma que los reales: sección en useState. */
function DashboardFalso() {
  const [seccion, setSeccion] = useState<Seccion>('inicio');
  const { pathname } = useLocation();

  useSeccionEnUrl<Seccion>({ base: '/estudiante', seccion, setSeccion, esValida });

  return (
    <div>
      <p data-testid="seccion">{seccion}</p>
      <p data-testid="ruta">{pathname}</p>
      {SECCIONES.map((s) => (
        <button key={s} type="button" onClick={() => setSeccion(s)}>
          ir a {s}
        </button>
      ))}
    </div>
  );
}

function pintar(rutaInicial: string) {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <Routes>
        <Route path="/estudiante/*" element={<DashboardFalso />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('leerSeccionDeRuta', () => {
  it('extrae el segmento que sigue a la base', () => {
    expect(leerSeccionDeRuta('/estudiante/tareas', '/estudiante')).toBe('tareas');
    expect(leerSeccionDeRuta('/estudiante/tareas/5', '/estudiante')).toBe('tareas');
  });

  it('devuelve null cuando no hay sección o la base no coincide', () => {
    expect(leerSeccionDeRuta('/estudiante', '/estudiante')).toBeNull();
    expect(leerSeccionDeRuta('/estudiante/', '/estudiante')).toBeNull();
    expect(leerSeccionDeRuta('/docente/tareas', '/estudiante')).toBeNull();
  });
});

describe('useSeccionEnUrl', () => {
  it('adopta la sección que venga en la URL al entrar', async () => {
    pintar('/estudiante/tareas');
    expect(await screen.findByTestId('seccion')).toHaveTextContent('tareas');
  });

  it('ignora un segmento que no es una sección real', () => {
    pintar('/estudiante/inventado');
    // Se queda en el valor inicial en vez de romperse.
    expect(screen.getByTestId('seccion')).toHaveTextContent('inicio');
  });

  it('completa la URL cuando se entra sin sección', async () => {
    pintar('/estudiante');
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/estudiante/inicio');
  });

  it('actualiza la URL al navegar por el menú', async () => {
    pintar('/estudiante/inicio');

    await userEvent.click(screen.getByRole('button', { name: 'ir a notas' }));

    expect(screen.getByTestId('seccion')).toHaveTextContent('notas');
    expect(screen.getByTestId('ruta')).toHaveTextContent('/estudiante/notas');
  });
});
