import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Trash2 } from 'lucide-react';
import { Button, IconButton } from './Button';
import { Field, Input, Toggle } from './Field';
import { Modal } from './Modal';
import { DataTable, type ColumnaTabla } from './DataTable';
import { ToastProvider } from './Feedback';
import { useToast } from './avisos';

/**
 * Estas pruebas vigilan el contrato de accesibilidad, que es la razón de ser
 * del módulo. Lo visual no se prueba aquí: eso va por captura.
 */

describe('Button', () => {
  it('es type="button" salvo que se pida lo contrario', () => {
    const { rerender } = render(<Button>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<Button type="submit">Guardar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('cargando deshabilita y anuncia el estado', () => {
    const alPulsar = vi.fn();
    render(
      <Button cargando onClick={alPulsar}>
        Guardar
      </Button>,
    );

    const boton = screen.getByRole('button');
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
  });

  it('IconButton exige etiqueta y la expone como nombre accesible', () => {
    render(<IconButton icono={Trash2} etiqueta="Eliminar material" />);
    expect(
      screen.getByRole('button', { name: 'Eliminar material' }),
    ).toBeInTheDocument();
  });
});

describe('Field', () => {
  it('conecta etiqueta y control sin que el consumidor ponga htmlFor', () => {
    render(
      <Field etiqueta="Número de documento">
        <Input />
      </Field>,
    );
    // Si el enlace faltara, getByLabelText no encontraría nada.
    expect(screen.getByLabelText('Número de documento')).toBeInTheDocument();
  });

  it('enlaza la ayuda con aria-describedby', () => {
    render(
      <Field etiqueta="Créditos" ayuda="Máximo 21 por periodo.">
        <Input />
      </Field>,
    );

    const campo = screen.getByLabelText('Créditos');
    const descrito = campo.getAttribute('aria-describedby');
    expect(descrito).toBeTruthy();
    expect(document.getElementById(descrito!)).toHaveTextContent(
      'Máximo 21 por periodo.',
    );
  });

  it('el error sustituye a la ayuda, marca el campo y se anuncia', () => {
    render(
      <Field
        etiqueta="Créditos"
        ayuda="Máximo 21 por periodo."
        error="Supera el máximo de 21 créditos."
      >
        <Input />
      </Field>,
    );

    const campo = screen.getByLabelText('Créditos');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Supera el máximo');
    expect(screen.queryByText('Máximo 21 por periodo.')).not.toBeInTheDocument();

    const descrito = campo.getAttribute('aria-describedby');
    expect(document.getElementById(descrito!)).toHaveTextContent('Supera el máximo');
  });

  it('propaga `requerido` al control', () => {
    render(
      <Field etiqueta="Correo" requerido>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText(/Correo/)).toBeRequired();
  });
});

describe('Toggle', () => {
  it('es un switch con estado y etiqueta legibles', async () => {
    const alCambiar = vi.fn();
    render(
      <Toggle activo={false} onCambio={alCambiar} etiqueta="Recibir correos" />,
    );

    const control = screen.getByRole('switch', { name: 'Recibir correos' });
    expect(control).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(control);
    expect(alCambiar).toHaveBeenCalledWith(true);
  });
});

describe('Modal', () => {
  it('no pinta nada cerrado', () => {
    render(
      <Modal abierto={false} onCerrar={() => {}} titulo="Confirmar">
        Contenido
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('abierto es un dialog modal nombrado por su título', () => {
    render(
      <Modal
        abierto
        onCerrar={() => {}}
        titulo="Subir material"
        descripcion="PDF o enlace"
      >
        Contenido
      </Modal>,
    );

    const dialogo = screen.getByRole('dialog', { name: 'Subir material' });
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAccessibleDescription('PDF o enlace');
  });

  it('cierra con Escape', async () => {
    const alCerrar = vi.fn();
    render(
      <Modal abierto onCerrar={alCerrar} titulo="Subir material">
        Contenido
      </Modal>,
    );

    await userEvent.keyboard('{Escape}');
    expect(alCerrar).toHaveBeenCalled();
  });

  it('cierra desde el botón de la cabecera', async () => {
    const alCerrar = vi.fn();
    render(
      <Modal abierto onCerrar={alCerrar} titulo="Subir material">
        Contenido
      </Modal>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(alCerrar).toHaveBeenCalled();
  });
});

interface FilaNota {
  id: string;
  nombre: string;
  nota: number;
}

const FILAS: FilaNota[] = [
  { id: 'a', nombre: 'Ruiz Castaño, Daniel', nota: 2.8 },
  { id: 'b', nombre: 'Morales Quintero, Ana', nota: 4.35 },
  { id: 'c', nombre: 'Ocampo Herrera, Lucía', nota: 3.95 },
];

const COLUMNAS: ColumnaTabla<FilaNota>[] = [
  {
    clave: 'nombre',
    cabecera: 'Estudiante',
    celda: (f) => f.nombre,
    ordenarPor: (f) => f.nombre,
  },
  {
    clave: 'nota',
    cabecera: 'Nota',
    celda: (f) => f.nota.toFixed(2),
    numerica: true,
    ordenarPor: (f) => f.nota,
  },
];

describe('DataTable', () => {
  const pintar = (props: Record<string, unknown> = {}) =>
    render(
      <DataTable
        titulo="Notas del grupo"
        columnas={COLUMNAS}
        filas={FILAS}
        idFila={(f: FilaNota) => f.id}
        {...props}
      />,
    );

  const notas = () =>
    screen
      .getAllByRole('row')
      .slice(1)
      .map((f) => within(f).getAllByRole('cell')[1].textContent);

  it('expone la tabla con su descripción accesible', () => {
    pintar();
    expect(
      screen.getByRole('table', { name: 'Notas del grupo' }),
    ).toBeInTheDocument();
  });

  it('ordena al pulsar y vuelve al orden original en la tercera', async () => {
    pintar();
    const cabecera = screen.getByRole('columnheader', { name: /Nota/ });
    const boton = within(cabecera).getByRole('button');

    expect(notas()).toEqual(['2.80', '4.35', '3.95']);

    await userEvent.click(boton);
    expect(cabecera).toHaveAttribute('aria-sort', 'ascending');
    expect(notas()).toEqual(['2.80', '3.95', '4.35']);

    await userEvent.click(boton);
    expect(cabecera).toHaveAttribute('aria-sort', 'descending');
    expect(notas()).toEqual(['4.35', '3.95', '2.80']);

    await userEvent.click(boton);
    expect(cabecera).toHaveAttribute('aria-sort', 'none');
    expect(notas()).toEqual(['2.80', '4.35', '3.95']);
  });

  it('no muta el arreglo que recibe', async () => {
    const original = [...FILAS];
    pintar();
    await userEvent.click(
      within(screen.getByRole('columnheader', { name: /Nota/ })).getByRole('button'),
    );
    expect(FILAS).toEqual(original);
  });

  it('muestra el estado vacío en vez de una tabla sin filas', () => {
    pintar({ filas: [], vacio: { titulo: 'Sin notas registradas' } });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Sin notas registradas')).toBeInTheDocument();
  });

  it('anuncia la carga', () => {
    pintar({ cargando: true });
    expect(screen.getByLabelText('Cargando Notas del grupo')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});

describe('ToastProvider', () => {
  function Disparador() {
    const { ok } = useToast();
    return <Button onClick={() => ok('Material subido')}>Subir</Button>;
  }

  it('publica los avisos en una región aria-live', async () => {
    const { container } = render(
      <ToastProvider>
        <Disparador />
      </ToastProvider>,
    );

    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();

    await userEvent.click(screen.getByRole('button', { name: 'Subir' }));
    expect(screen.getByText('Material subido')).toBeInTheDocument();
  });

  it('se puede descartar a mano', async () => {
    render(
      <ToastProvider>
        <Disparador />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Subir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.queryByText('Material subido')).not.toBeInTheDocument();
  });

  it('useToast fuera del proveedor falla con un mensaje claro', () => {
    const Suelto = () => {
      useToast();
      return null;
    };
    const silencio = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Suelto />)).toThrow(/ToastProvider/);
    silencio.mockRestore();
  });
});
