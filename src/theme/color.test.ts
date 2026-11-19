import { describe, expect, it } from 'vitest';
import {
  CONTRASTE_AA,
  acentoLegible,
  aHex,
  luminanciaRelativa,
  parsearHex,
  razonDeContraste,
  tintaSobre,
  type Rgb,
} from './color';

const BLANCO: Rgb = [255, 255, 255];
const NEGRO: Rgb = [0, 0, 0];

describe('parsearHex', () => {
  it('acepta las cuatro formas que escribe la gente', () => {
    expect(parsearHex('#fff')).toEqual([255, 255, 255]);
    expect(parsearHex('fff')).toEqual([255, 255, 255]);
    expect(parsearHex('#1E40AF')).toEqual([30, 64, 175]);
    expect(parsearHex('  #1e40af  ')).toEqual([30, 64, 175]);
  });

  it('devuelve null en vez de inventarse un color', () => {
    expect(parsearHex('')).toBeNull();
    expect(parsearHex('rojo')).toBeNull();
    expect(parsearHex('#12')).toBeNull();
    expect(parsearHex('#1234567')).toBeNull();
    expect(parsearHex('#gggggg')).toBeNull();
    expect(parsearHex(null as unknown as string)).toBeNull();
  });
});

describe('aHex', () => {
  it('recorta y redondea fuera de rango en vez de emitir hex inválido', () => {
    expect(aHex([30, 64, 175])).toBe('#1e40af');
    expect(aHex([-20, 300, 127.6])).toBe('#00ff80');
  });
});

describe('razonDeContraste', () => {
  it('da los extremos conocidos de WCAG', () => {
    expect(razonDeContraste(NEGRO, BLANCO)).toBeCloseTo(21, 5);
    expect(razonDeContraste(BLANCO, BLANCO)).toBeCloseTo(1, 5);
  });

  it('es simétrica', () => {
    const a: Rgb = [10, 120, 200];
    expect(razonDeContraste(a, BLANCO)).toBeCloseTo(razonDeContraste(BLANCO, a), 10);
  });

  it('coincide con el valor publicado para #767676 sobre blanco', () => {
    // El gris de referencia de WCAG: el más claro que aún pasa AA.
    expect(razonDeContraste([118, 118, 118], BLANCO)).toBeCloseTo(4.54, 2);
  });
});

describe('luminanciaRelativa', () => {
  it('ancla negro en 0 y blanco en 1', () => {
    expect(luminanciaRelativa(NEGRO)).toBeCloseTo(0, 10);
    expect(luminanciaRelativa(BLANCO)).toBeCloseTo(1, 10);
  });
});

describe('tintaSobre', () => {
  it('elige blanco sobre rellenos oscuros y oscuro sobre claros', () => {
    expect(tintaSobre([10, 110, 126])).toEqual(BLANCO); // acento por defecto
    expect(tintaSobre([255, 212, 0])).toEqual([11, 14, 18]); // amarillo
  });
});

describe('acentoLegible', () => {
  it('no toca un color que ya cumple', () => {
    const acento: Rgb = [10, 110, 126];
    expect(acentoLegible(acento, BLANCO)).toEqual(acento);
  });

  it('oscurece un amarillo hasta alcanzar AA sobre blanco', () => {
    const amarillo: Rgb = [255, 212, 0];
    expect(razonDeContraste(amarillo, BLANCO)).toBeLessThan(CONTRASTE_AA);

    const ajustado = acentoLegible(amarillo, BLANCO);
    expect(razonDeContraste(ajustado, BLANCO)).toBeGreaterThanOrEqual(CONTRASTE_AA);
    expect(luminanciaRelativa(ajustado)).toBeLessThan(luminanciaRelativa(amarillo));
  });

  it('aclara en vez de oscurecer cuando el fondo es oscuro', () => {
    const azulOscuro: Rgb = [30, 64, 175];
    const fondoOscuro: Rgb = [20, 25, 33];
    expect(razonDeContraste(azulOscuro, fondoOscuro)).toBeLessThan(CONTRASTE_AA);

    const ajustado = acentoLegible(azulOscuro, fondoOscuro);
    expect(razonDeContraste(ajustado, fondoOscuro)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
    expect(luminanciaRelativa(ajustado)).toBeGreaterThan(
      luminanciaRelativa(azulOscuro),
    );
  });

  it('siempre termina cumpliendo, incluso en el peor caso', () => {
    // Blanco sobre blanco no tiene margen: debe acabar en negro.
    const resultado = acentoLegible(BLANCO, BLANCO);
    expect(razonDeContraste(resultado, BLANCO)).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });
});
