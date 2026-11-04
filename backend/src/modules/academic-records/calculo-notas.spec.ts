import { calcularNotaDefinitiva, horasDeAsignatura } from './calculo-notas';

describe('calcularNotaDefinitiva', () => {
  it('sin notas no puede calcular', () => {
    expect(calcularNotaDefinitiva([], 5)).toBeNull();
  });

  it('sin pesos promedia en partes iguales y normaliza a la escala del programa', () => {
    const resultado = calcularNotaDefinitiva(
      [
        { gradeType: 'parcial1', grade: 80, weight: null },
        { gradeType: 'parcial2', grade: 60, weight: null },
      ],
      5,
    );

    expect(resultado).toMatchObject({
      promedio100: 70,
      finalGrade: 3.5,
      pesoDeclarado: 0,
      parcialesIgnorados: [],
    });
  });

  it('respeta los pesos declarados', () => {
    const resultado = calcularNotaDefinitiva(
      [
        { gradeType: 'parcial', grade: 50, weight: 0.3 },
        { gradeType: 'final', grade: 100, weight: 0.7 },
      ],
      5,
    );

    // 50*0.3 + 100*0.7 = 85
    expect(resultado?.promedio100).toBe(85);
    expect(resultado?.finalGrade).toBe(4.25);
  });

  it('reparte el peso restante entre las notas sin peso', () => {
    const resultado = calcularNotaDefinitiva(
      [
        { gradeType: 'final', grade: 100, weight: 0.5 },
        { gradeType: 'taller1', grade: 40, weight: null },
        { gradeType: 'taller2', grade: 60, weight: null },
      ],
      5,
    );

    // 100*0.5 + 40*0.25 + 60*0.25 = 75
    expect(resultado?.promedio100).toBe(75);
    expect(resultado?.parcialesIgnorados).toEqual([]);
  });

  it('avisa de las notas que quedan fuera cuando los pesos ya suman 1', () => {
    const resultado = calcularNotaDefinitiva(
      [
        { gradeType: 'parcial', grade: 90, weight: 0.5 },
        { gradeType: 'final', grade: 70, weight: 0.5 },
        { gradeType: 'extra', grade: 10, weight: null },
      ],
      5,
    );

    expect(resultado?.promedio100).toBe(80);
    expect(resultado?.parcialesIgnorados).toEqual(['extra']);
  });

  it('normaliza a una escala distinta de 5', () => {
    const resultado = calcularNotaDefinitiva(
      [{ gradeType: 'unica', grade: 80, weight: null }],
      10,
    );
    expect(resultado?.finalGrade).toBe(8);
  });
});

describe('horasDeAsignatura', () => {
  it('usa las horas explícitas si existen', () => {
    expect(horasDeAsignatura(60, 1, 48)).toBe(60);
  });

  it('las deriva de los créditos cuando faltan', () => {
    expect(horasDeAsignatura(null, 2, 48)).toBe(96);
  });

  it('devuelve null si no hay horas ni créditos', () => {
    expect(horasDeAsignatura(null, null, 48)).toBeNull();
  });
});
