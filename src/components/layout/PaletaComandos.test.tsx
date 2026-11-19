import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookOpen, Home, Mail } from 'lucide-react';
import { PaletaComandos, normalizar, puntuar } from './PaletaComandos';
import type { GrupoNav } from './navegacion';

/**
 * La paleta se prueba por su contrato de teclado: es su razón de ser. Si hay
 * que llegar con el ratón, no sirve de nada.
 */

type Seccion = 'inicio' | 'cursos' | 'mensajes';

const GRUPOS: GrupoNav<Seccion>[] = [
  {
    titulo: 'Cursar',
    entradas: [
      { id: 'inicio', etiqueta: 'Inicio', icono: Home },
      { id: 'cursos', etiqueta: 'Mis cursos', icono: BookOpen },
    ],
  },
  {
    titulo: 'Recursos',
    entradas: [{ id: 'mensajes', etiqueta: 'Mensajes', icono: Mail }],
  },
];

function montar(props: { abierta?: boolean } = {}) {
  const onIr = vi.fn();
  const onCerrar = vi.fn();
  render(
    <PaletaComandos
      grupos={GRUPOS}
      abierta={props.abierta ?? true}
      onCerrar={onCerrar}
      onIr={onIr}
    />,
  );
  return { onIr, onCerrar };
}

describe('normalizar', () => {
  it('quita tildes y mayúsculas', () => {
    expect(normalizar('Exámenes')).toBe('examenes');
    expect(normalizar('  Calificación  ')).toBe('calificacion');
  });
});

describe('puntuar', () => {
  it('ordena por prefijo, palabra y contenido', () => {
    expect(puntuar('Mensajes', 'men')).toBe(0);
    expect(puntuar('Mis cursos', 'cur')).toBe(1);
    expect(puntuar('Estado de cuenta', 'cuenta')).toBe(1);
    expect(puntuar('Biblioteca', 'lio')).toBe(2);
  });

  it('encuentra sin tildes', () => {
    expect(puntuar('Exámenes', 'examenes')).toBe(0);
  });

  it('exige que aparezcan todas las palabras', () => {
    expect(puntuar('Mis cursos', 'mis cursos')).toBe(0);
    expect(puntuar('Mis cursos', 'mis tareas')).toBeNull();
  });
});

describe('PaletaComandos', () => {
  it('no pinta nada mientras está cerrada', () => {
    montar({ abierta: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('es un diálogo modal con la caja de texto enfocada', () => {
    montar();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('lista todas las secciones y su grupo', () => {
    montar();
    const opciones = screen.getAllByRole('option');
    expect(opciones).toHaveLength(3);
    expect(opciones[0]).toHaveTextContent('Inicio');
    expect(opciones[0]).toHaveTextContent('Cursar');
  });

  it('filtra por lo escrito', async () => {
    const usuario = userEvent.setup();
    montar();
    await usuario.type(screen.getByRole('combobox'), 'mensaj');
    const opciones = screen.getAllByRole('option');
    expect(opciones).toHaveLength(1);
    expect(opciones[0]).toHaveTextContent('Mensajes');
  });

  it('avisa cuando nada coincide', async () => {
    const usuario = userEvent.setup();
    montar();
    await usuario.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText(/Ninguna sección coincide/)).toBeInTheDocument();
  });

  it('recorre con las flechas sin sacar el foco de la caja', async () => {
    const usuario = userEvent.setup();
    montar();
    const caja = screen.getByRole('combobox');

    expect(caja).toHaveAttribute('aria-activedescendant', 'paleta-opcion-0');
    await usuario.keyboard('{ArrowDown}');
    expect(caja).toHaveAttribute('aria-activedescendant', 'paleta-opcion-1');
    expect(caja).toHaveFocus();

    // Da la vuelta al llegar al final.
    await usuario.keyboard('{ArrowDown}{ArrowDown}');
    expect(caja).toHaveAttribute('aria-activedescendant', 'paleta-opcion-0');
    await usuario.keyboard('{ArrowUp}');
    expect(caja).toHaveAttribute('aria-activedescendant', 'paleta-opcion-2');
  });

  it('marca como seleccionada solo la opción activa', async () => {
    const usuario = userEvent.setup();
    montar();
    await usuario.keyboard('{ArrowDown}');
    const opciones = screen.getAllByRole('option');
    expect(opciones[0]).toHaveAttribute('aria-selected', 'false');
    expect(opciones[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('con Enter navega a la sección elegida y cierra', async () => {
    const usuario = userEvent.setup();
    const { onIr, onCerrar } = montar();
    await usuario.keyboard('{ArrowDown}{Enter}');
    expect(onIr).toHaveBeenCalledWith('cursos');
    expect(onCerrar).toHaveBeenCalled();
  });

  it('con Escape cierra sin navegar', async () => {
    const usuario = userEvent.setup();
    const { onIr, onCerrar } = montar();
    await usuario.keyboard('{Escape}');
    expect(onCerrar).toHaveBeenCalled();
    expect(onIr).not.toHaveBeenCalled();
  });

  it('al hacer clic en una opción navega a ella', async () => {
    const usuario = userEvent.setup();
    const { onIr } = montar();
    await usuario.click(screen.getByRole('option', { name: /Mensajes/ }));
    expect(onIr).toHaveBeenCalledWith('mensajes');
  });

  it('filtrar devuelve la selección a la primera opción', async () => {
    const usuario = userEvent.setup();
    montar();
    await usuario.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      'paleta-opcion-2',
    );
    await usuario.type(screen.getByRole('combobox'), 'c');
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      'paleta-opcion-0',
    );
  });
});
