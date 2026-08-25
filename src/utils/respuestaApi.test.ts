import { describe, it, expect } from 'vitest';
import { comoArreglo } from './respuestaApi';

describe('comoArreglo', () => {
  it('devuelve el arreglo cuando ya es plano', () => {
    expect(comoArreglo([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('desenvuelve un sobre { data }', () => {
    expect(comoArreglo({ data: [1, 2] })).toEqual([1, 2]);
  });

  // Regresión: éste es el sobre real que devuelve el backend paginado
  // (card-issuances.service.ts findAll, cardTemplatesApi.getAll, etc.) y que
  // "expediciones.map is not a function" reveló en runtime.
  it('desenvuelve un sobre paginado { data, meta }', () => {
    const respuesta = { data: [{ id: 1 }, { id: 2 }], meta: { total: 2, page: 1 } };
    expect(comoArreglo(respuesta)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('desenvuelve el doble envoltorio que agrega apiClient ({ data: { data, meta } })', () => {
    const respuesta = { data: { data: [{ id: 1 }], meta: { total: 1 } } };
    expect(comoArreglo(respuesta)).toEqual([{ id: 1 }]);
  });

  it('reconoce items y results como alias de la lista', () => {
    expect(comoArreglo({ items: [1] })).toEqual([1]);
    expect(comoArreglo({ results: [2] })).toEqual([2]);
  });

  it('devuelve arreglo vacío en vez de lanzar cuando no encuentra una lista', () => {
    expect(comoArreglo(null)).toEqual([]);
    expect(comoArreglo(undefined)).toEqual([]);
    expect(comoArreglo({ foo: 'bar' })).toEqual([]);
    expect(comoArreglo('texto')).toEqual([]);
  });
});
