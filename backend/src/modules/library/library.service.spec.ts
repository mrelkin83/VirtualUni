import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LibraryService } from './library.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const LIBRO = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ESTUDIANTE = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('LibraryService', () => {
  let service: LibraryService;

  const prismaMock: any = {
    book: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: {} }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    bookLoan: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    bookReservation: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    student: { findUnique: jest.fn(), findFirst: jest.fn() },
    // $transaction recibe un array de promesas y devuelve sus resultados.
    $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.bookLoan.count.mockResolvedValue(0);
    prismaMock.$transaction.mockImplementation((ops: any[]) => Promise.all(ops));

    const module: TestingModule = await Test.createTestingModule({
      providers: [LibraryService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
  });

  const libroDisponible = {
    id: LIBRO,
    titulo: 'Estructuras de datos',
    ejemplaresTotal: 3,
    ejemplaresDisponibles: 2,
  };

  const conEstudianteValido = () => {
    prismaMock.student.findUnique.mockResolvedValue({ id: ESTUDIANTE, tenantId: TENANT_A });
    prismaMock.student.findFirst.mockResolvedValue({ id: ESTUDIANTE });
  };

  describe('createLoan', () => {
    it('rechaza a un estudiante de otro tenant', async () => {
      prismaMock.student.findUnique.mockResolvedValue({ id: ESTUDIANTE, tenantId: 'otro' });

      await expect(
        service.createLoan(TENANT_A, { bookId: LIBRO }, 'user-1', false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rechaza si no quedan ejemplares disponibles', async () => {
      conEstudianteValido();
      prismaMock.book.findFirst.mockResolvedValue({ ...libroDisponible, ejemplaresDisponibles: 0 });

      await expect(
        service.createLoan(TENANT_A, { bookId: LIBRO }, 'user-1', false),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.bookLoan.create).not.toHaveBeenCalled();
    });

    it('rechaza al alcanzar el máximo de préstamos activos', async () => {
      conEstudianteValido();
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookLoan.count.mockResolvedValue(3);

      await expect(
        service.createLoan(TENANT_A, { bookId: LIBRO }, 'user-1', false),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza pedir dos veces el mismo libro', async () => {
      conEstudianteValido();
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookLoan.findFirst.mockResolvedValue({ id: 'prestamo-previo' });

      await expect(
        service.createLoan(TENANT_A, { bookId: LIBRO }, 'user-1', false),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // El préstamo y el descuento de stock deben ir juntos: si se separan, dos
    // peticiones simultáneas podrían prestar el último ejemplar dos veces.
    it('crea el préstamo y descuenta stock en una única transacción', async () => {
      conEstudianteValido();
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookLoan.findFirst.mockResolvedValue(null);
      prismaMock.bookLoan.create.mockResolvedValue({ id: 'nuevo' });
      prismaMock.book.update.mockResolvedValue({});

      await service.createLoan(TENANT_A, { bookId: LIBRO }, 'user-1', false);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.book.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { ejemplaresDisponibles: { decrement: 1 } } }),
      );
    });

    it('un estudiante no puede pedir en nombre de otro', async () => {
      conEstudianteValido();
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookLoan.findFirst.mockResolvedValue(null);
      prismaMock.bookLoan.create.mockResolvedValue({ id: 'nuevo' });

      // Envía un studentId ajeno sin ser personal de biblioteca.
      await service.createLoan(TENANT_A, { bookId: LIBRO, studentId: 'otro-alumno' }, 'user-1', false);

      expect(prismaMock.bookLoan.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ studentId: ESTUDIANTE }) }),
      );
    });

    it('el personal sí puede registrar el préstamo de un estudiante concreto', async () => {
      prismaMock.student.findFirst.mockResolvedValue({ id: 'otro-alumno' });
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookLoan.findFirst.mockResolvedValue(null);
      prismaMock.bookLoan.create.mockResolvedValue({ id: 'nuevo' });

      await service.createLoan(TENANT_A, { bookId: LIBRO, studentId: 'otro-alumno' }, 'admin', true);

      expect(prismaMock.bookLoan.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ studentId: 'otro-alumno' }) }),
      );
    });
  });

  describe('returnLoan', () => {
    it('devuelve el ejemplar al stock', async () => {
      prismaMock.bookLoan.findFirst.mockResolvedValue({
        id: 'p1',
        bookId: LIBRO,
        estado: 'ACTIVO',
        book: libroDisponible,
      });
      prismaMock.bookLoan.update.mockResolvedValue({ id: 'p1' });
      prismaMock.book.update.mockResolvedValue({});

      await service.returnLoan(TENANT_A, 'p1');

      expect(prismaMock.book.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { ejemplaresDisponibles: { increment: 1 } } }),
      );
    });

    it('no permite devolver dos veces el mismo préstamo', async () => {
      prismaMock.bookLoan.findFirst.mockResolvedValue({
        id: 'p1',
        bookId: LIBRO,
        estado: 'DEVUELTO',
        book: libroDisponible,
      });

      await expect(service.returnLoan(TENANT_A, 'p1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.book.update).not.toHaveBeenCalled();
    });

    it('falla si el préstamo es de otro tenant', async () => {
      prismaMock.bookLoan.findFirst.mockResolvedValue(null);

      await expect(service.returnLoan(TENANT_A, 'p1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('renewLoan', () => {
    it('rechaza renovar un préstamo ya devuelto', async () => {
      prismaMock.bookLoan.findFirst.mockResolvedValue({
        id: 'p1',
        estado: 'DEVUELTO',
        renovaciones: 0,
        fechaVencimiento: new Date(),
        book: libroDisponible,
      });

      await expect(service.renewLoan(TENANT_A, 'p1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza superar el máximo de renovaciones', async () => {
      prismaMock.bookLoan.findFirst.mockResolvedValue({
        id: 'p1',
        estado: 'ACTIVO',
        renovaciones: 2,
        fechaVencimiento: new Date(),
        book: libroDisponible,
      });

      await expect(service.renewLoan(TENANT_A, 'p1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('amplía la fecha de vencimiento y cuenta la renovación', async () => {
      const vencimiento = new Date('2026-01-10');
      prismaMock.bookLoan.findFirst.mockResolvedValue({
        id: 'p1',
        estado: 'ACTIVO',
        renovaciones: 0,
        fechaVencimiento: vencimiento,
        book: libroDisponible,
      });
      prismaMock.bookLoan.update.mockResolvedValue({});

      await service.renewLoan(TENANT_A, 'p1', 7);

      const data = prismaMock.bookLoan.update.mock.calls[0][0].data;
      expect(data.fechaVencimiento).toEqual(new Date('2026-01-17'));
      expect(data.renovaciones).toEqual({ increment: 1 });
    });
  });

  describe('updateBook', () => {
    it('impide reducir el total por debajo de los ejemplares prestados', async () => {
      // 3 totales, 2 disponibles => 1 prestado. No se puede bajar a 0.
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);

      await expect(
        service.updateBook(TENANT_A, LIBRO, { ejemplaresTotal: 0 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reajusta los disponibles al ampliar el total', async () => {
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.book.update.mockResolvedValue({});

      await service.updateBook(TENANT_A, LIBRO, { ejemplaresTotal: 5 });

      // 5 totales - 1 prestado = 4 disponibles.
      expect(prismaMock.book.update.mock.calls[0][0].data.ejemplaresDisponibles).toBe(4);
    });
  });

  describe('removeBook', () => {
    it('no elimina un libro con préstamos activos', async () => {
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookLoan.count.mockResolvedValue(1);

      await expect(service.removeBook(TENANT_A, LIBRO)).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.book.delete).not.toHaveBeenCalled();
    });
  });

  describe('createReservation', () => {
    it('rechaza una segunda reserva activa del mismo libro', async () => {
      conEstudianteValido();
      prismaMock.book.findFirst.mockResolvedValue(libroDisponible);
      prismaMock.bookReservation.findFirst.mockResolvedValue({ id: 'reserva-previa' });

      await expect(
        service.createReservation(TENANT_A, { bookId: LIBRO }, 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('createBook', () => {
    it('inicializa los disponibles igual al total', async () => {
      prismaMock.book.create.mockResolvedValue({});

      await service.createBook(TENANT_A, {
        titulo: 'X',
        autor: 'Y',
        categoria: 'Z',
        ejemplaresTotal: 4,
      } as any);

      const data = prismaMock.book.create.mock.calls[0][0].data;
      expect(data.ejemplaresTotal).toBe(4);
      expect(data.ejemplaresDisponibles).toBe(4);
      expect(data.tenantId).toBe(TENANT_A);
    });
  });
});
