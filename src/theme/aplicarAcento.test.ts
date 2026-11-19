import { describe, expect, it } from 'vitest';
import {
  aplicarAcento,
  calcularAcento,
  limpiarAcento,
  revisarColorDeMarca,
} from './aplicarAcento';
import { CONTRASTE_AA, parsearHex, razonDeContraste } from './color';

const raizDePrueba = () => document.createElement('div');

describe('calcularAcento', () => {
  it('devuelve null sin color, para que quede el acento por defecto', () => {
    expect(calcularAcento(null)).toBeNull();
    expect(calcularAcento(undefined)).toBeNull();
    expect(calcularAcento('')).toBeNull();
    expect(calcularAcento('no-es-un-color')).toBeNull();
  });

  it('conserva el color de la institución para rellenos', () => {
    const r = calcularAcento('#1E40AF');
    expect(r?.acento).toBe('#1e40af');
  });

  it('marca como ajustado un color que no llega a AA y lo corrige', () => {
    const r = calcularAcento('#ffd400');
    expect(r?.ajustado).toBe(true);
    expect(r?.contrasteOriginal).toBeLessThan(CONTRASTE_AA);

    const texto = parsearHex(r!.texto)!;
    expect(razonDeContraste(texto, [255, 255, 255])).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });

  it('deja intacto el texto cuando el color ya contrasta', () => {
    const r = calcularAcento('#0a6e7e');
    expect(r?.ajustado).toBe(false);
    expect(r?.texto).toBe('#0a6e7e');
  });

  it('mide contra la superficie oscura cuando el tema es oscuro', () => {
    const claro = calcularAcento('#1E40AF', 'light');
    const oscuro = calcularAcento('#1E40AF', 'dark');
    // El mismo azul es ilegible sobre blanco y sobre la superficie oscura,
    // pero se corrige en direcciones opuestas.
    expect(claro?.texto).not.toBe(oscuro?.texto);
  });

  it('elige la tinta del botón según el relleno', () => {
    expect(calcularAcento('#0a6e7e')?.tinta).toBe('#ffffff');
    expect(calcularAcento('#ffd400')?.tinta).toBe('#0b0e12');
  });
});

describe('aplicarAcento', () => {
  it('escribe las tres variables en la raíz que se le pase', () => {
    const raiz = raizDePrueba();
    const r = aplicarAcento('#1E40AF', 'light', raiz);

    expect(r).not.toBeNull();
    expect(raiz.style.getPropertyValue('--pn-accent')).toBe('#1e40af');
    expect(raiz.style.getPropertyValue('--pn-accent-ink')).toBe(r!.tinta);
    expect(raiz.style.getPropertyValue('--pn-accent-text')).toBe(r!.texto);
  });

  it('limpia lo que hubiera si el color deja de ser válido', () => {
    const raiz = raizDePrueba();
    aplicarAcento('#1E40AF', 'light', raiz);
    expect(raiz.style.getPropertyValue('--pn-accent')).not.toBe('');

    expect(aplicarAcento(null, 'light', raiz)).toBeNull();
    expect(raiz.style.getPropertyValue('--pn-accent')).toBe('');
  });

  it('no estalla si no hay raíz', () => {
    expect(aplicarAcento('#1E40AF', 'light', null)).toBeNull();
    expect(() => limpiarAcento(null)).not.toThrow();
  });

  it('inyecta el color secundario del tenant con su tinta legible', () => {
    const raiz = raizDePrueba();
    aplicarAcento('#1E52DB', 'light', raiz, '#FF701E');

    expect(raiz.style.getPropertyValue('--pn-accent-2')).toBe('#ff701e');
    // Blanco sobre ese naranja da 2,8:1; debe elegir tinta oscura.
    expect(raiz.style.getPropertyValue('--pn-accent-2-ink')).toBe('#0b0e12');
  });

  it('deja el secundario por defecto si el tenant no lo configuró', () => {
    const raiz = raizDePrueba();
    aplicarAcento('#1E52DB', 'light', raiz, null);
    expect(raiz.style.getPropertyValue('--pn-accent-2')).toBe('');
  });

  it('limpia también el secundario', () => {
    const raiz = raizDePrueba();
    aplicarAcento('#1E52DB', 'light', raiz, '#FF701E');
    limpiarAcento(raiz);
    expect(raiz.style.getPropertyValue('--pn-accent-2')).toBe('');
    expect(raiz.style.getPropertyValue('--pn-accent-2-ink')).toBe('');
  });
});

describe('revisarColorDeMarca', () => {
  it('rechaza lo que no es un color', () => {
    const r = revisarColorDeMarca('azulito');
    expect(r.valido).toBe(false);
    expect(r.mensaje).toContain('válido');
  });

  it('aprueba sin reservas un color con contraste suficiente', () => {
    const r = revisarColorDeMarca('#0a6e7e');
    expect(r.valido).toBe(true);
    expect(r.cumpleTexto).toBe(true);
    expect(r.cumpleInterfaz).toBe(true);
  });

  it('avisa, sin bloquear, cuando el color es demasiado claro', () => {
    const r = revisarColorDeMarca('#ffd400');
    expect(r.valido).toBe(true);
    expect(r.cumpleTexto).toBe(false);
    expect(r.mensaje).toContain('oscura');
  });
});
