import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModalA11y } from './useModalA11y';

// Regresión: auditoría de agosto 2026 encontró que ningún modal de la app
// tenía role="dialog", trampa de foco, cierre con Escape ni devolvía el foco
// al cerrar (grep de role="dialog"/aria-modal en src/ no daba resultados).

function Dialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useModalA11y(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <button>Primero</button>
      <button>Segundo</button>
      <button>Último</button>
    </div>
  );
}

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Dialog isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

describe('useModalA11y', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('mueve el foco al primer elemento enfocable al abrir', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('Abrir'));

    await waitFor(() => {
      expect(screen.getByText('Primero')).toHaveFocus();
    });
  });

  it('cierra con Escape', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('Abrir'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('atrapa el foco: Tab en el último botón vuelve al primero', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('Abrir'));
    await waitFor(() => expect(screen.getByText('Primero')).toHaveFocus());

    screen.getByText('Último').focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getByText('Primero')).toHaveFocus();
  });

  it('Shift+Tab en el primer botón va al último', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('Abrir'));
    await waitFor(() => expect(screen.getByText('Primero')).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(screen.getByText('Último')).toHaveFocus();
  });

  it('devuelve el foco al elemento que lo tenía antes de abrir', async () => {
    render(<Harness />);
    const abrirBtn = screen.getByText('Abrir');
    await userEvent.click(abrirBtn);
    await waitFor(() => expect(screen.getByText('Primero')).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(abrirBtn).toHaveFocus();
    });
  });

  it('llama a onClose una sola vez por pulsación de Escape', async () => {
    const onClose = vi.fn();
    function Standalone() {
      const ref = useModalA11y(true, onClose);
      return (
        <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}>
          <button>X</button>
        </div>
      );
    }
    render(<Standalone />);
    await waitFor(() => expect(screen.getByText('X')).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
