import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCerrarConEscape } from './useCerrarConEscape';

/**
 * Los cuatro dropdowns de la cabecera solo se cerraban pulsando el overlay:
 * con el teclado no había salida. Esto vigila que la haya.
 */

function Panel({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  useCerrarConEscape(abierto, onCerrar);
  return abierto ? <div>panel</div> : null;
}

describe('useCerrarConEscape', () => {
  it('cierra con Escape cuando está abierto', async () => {
    const usuario = userEvent.setup();
    const onCerrar = vi.fn();
    render(<Panel abierto onCerrar={onCerrar} />);

    await usuario.keyboard('{Escape}');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('no hace nada con otras teclas', async () => {
    const usuario = userEvent.setup();
    const onCerrar = vi.fn();
    render(<Panel abierto onCerrar={onCerrar} />);

    await usuario.keyboard('{Enter}a{ArrowDown}');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('cerrado no escucha', async () => {
    const usuario = userEvent.setup();
    const onCerrar = vi.fn();
    render(<Panel abierto={false} onCerrar={onCerrar} />);

    await usuario.keyboard('{Escape}');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('se da de baja al desmontar', async () => {
    const usuario = userEvent.setup();
    const onCerrar = vi.fn();
    const { unmount } = render(<Panel abierto onCerrar={onCerrar} />);

    unmount();
    await usuario.keyboard('{Escape}');
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
