import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { LoanStatus, Prisma, ReservationStatus, Student } from '@prisma/client';
import {
  CreateBookDto,
  UpdateBookDto,
  QueryBooksDto,
  CreateLoanDto,
  QueryLoansDto,
  CreateReservationDto,
} from './dto';

const DIAS_PRESTAMO_POR_DEFECTO = 15;
const MAX_PRESTAMOS_ACTIVOS = 3;
const MAX_RENOVACIONES = 2;

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(private prisma: PrismaService) {}

  private async getStudent(userId: string, tenantId: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({ where: { userId } });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    return student;
  }

  // ------------------------------------------------------------------- Libros
  async createBook(tenantId: string, dto: CreateBookDto) {
    const total = dto.ejemplaresTotal ?? 1;

    return this.prisma.book.create({
      data: {
        ...dto,
        tenantId,
        ejemplaresTotal: total,
        ejemplaresDisponibles: total,
      },
    });
  }

  async findAllBooks(tenantId: string, query: QueryBooksDto) {
    const where: Prisma.BookWhereInput = { tenantId };

    if (query.categoria) where.categoria = query.categoria;
    if (query.soloDisponibles === 'true') where.ejemplaresDisponibles = { gt: 0 };
    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { autor: { contains: query.search, mode: 'insensitive' } },
        { isbn: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.book.findMany({ where, orderBy: { titulo: 'asc' } });
  }

  async findOneBook(tenantId: string, id: string) {
    const book = await this.prisma.book.findFirst({ where: { id, tenantId } });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    return book;
  }

  async updateBook(tenantId: string, id: string, dto: UpdateBookDto) {
    const book = await this.findOneBook(tenantId, id);

    // Al cambiar el total hay que reajustar los disponibles conservando los prestados.
    let ejemplaresDisponibles: number | undefined;
    if (dto.ejemplaresTotal != null) {
      const prestados = book.ejemplaresTotal - book.ejemplaresDisponibles;

      if (dto.ejemplaresTotal < prestados) {
        throw new BadRequestException(
          `No se puede reducir a ${dto.ejemplaresTotal}: hay ${prestados} ejemplares prestados`,
        );
      }

      ejemplaresDisponibles = dto.ejemplaresTotal - prestados;
    }

    return this.prisma.book.update({
      where: { id },
      data: { ...dto, ...(ejemplaresDisponibles != null ? { ejemplaresDisponibles } : {}) },
    });
  }

  async removeBook(tenantId: string, id: string) {
    const book = await this.findOneBook(tenantId, id);

    const activos = await this.prisma.bookLoan.count({
      where: { bookId: book.id, estado: LoanStatus.ACTIVO },
    });

    if (activos > 0) {
      throw new BadRequestException(
        'No se puede eliminar un libro con prestamos activos',
      );
    }

    await this.prisma.book.delete({ where: { id } });

    return { message: 'Libro eliminado correctamente' };
  }

  async getCategories(tenantId: string) {
    const rows = await this.prisma.book.groupBy({
      by: ['categoria'],
      where: { tenantId },
      _count: { _all: true },
    });

    return rows.map((r) => ({ categoria: r.categoria, total: r._count._all }));
  }

  // --------------------------------------------------------------- Prestamos
  async createLoan(tenantId: string, dto: CreateLoanDto, userId: string, isStaff: boolean) {
    const studentId = isStaff && dto.studentId
      ? dto.studentId
      : (await this.getStudent(userId, tenantId)).id;

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { id: true },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const book = await this.findOneBook(tenantId, dto.bookId);

    if (book.ejemplaresDisponibles < 1) {
      throw new BadRequestException('No hay ejemplares disponibles de este libro');
    }

    const activos = await this.prisma.bookLoan.count({
      where: { studentId, tenantId, estado: LoanStatus.ACTIVO },
    });

    if (activos >= MAX_PRESTAMOS_ACTIVOS) {
      throw new BadRequestException(
        `El estudiante ya tiene ${MAX_PRESTAMOS_ACTIVOS} prestamos activos`,
      );
    }

    const yaPrestado = await this.prisma.bookLoan.findFirst({
      where: { studentId, bookId: book.id, estado: LoanStatus.ACTIVO },
      select: { id: true },
    });

    if (yaPrestado) {
      throw new BadRequestException('El estudiante ya tiene prestado este libro');
    }

    const dias = dto.dias ?? DIAS_PRESTAMO_POR_DEFECTO;
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);

    // Prestamo y decremento de stock en una sola transaccion.
    const [loan] = await this.prisma.$transaction([
      this.prisma.bookLoan.create({
        data: { tenantId, bookId: book.id, studentId, fechaVencimiento },
        include: { book: true },
      }),
      this.prisma.book.update({
        where: { id: book.id },
        data: { ejemplaresDisponibles: { decrement: 1 } },
      }),
    ]);

    return loan;
  }

  async findAllLoans(tenantId: string, query: QueryLoansDto) {
    const where: Prisma.BookLoanWhereInput = { tenantId };

    if (query.estado) where.estado = query.estado;
    if (query.studentId) where.studentId = query.studentId;

    return this.prisma.bookLoan.findMany({
      where,
      include: {
        book: true,
        student: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }

  async findMyLoans(tenantId: string, userId: string) {
    const student = await this.getStudent(userId, tenantId);

    return this.prisma.bookLoan.findMany({
      where: { tenantId, studentId: student.id },
      include: { book: true },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }

  private async getLoan(tenantId: string, id: string) {
    const loan = await this.prisma.bookLoan.findFirst({
      where: { id, tenantId },
      include: { book: true },
    });

    if (!loan) {
      throw new NotFoundException('Prestamo no encontrado');
    }

    return loan;
  }

  async returnLoan(tenantId: string, id: string) {
    const loan = await this.getLoan(tenantId, id);

    if (loan.estado === LoanStatus.DEVUELTO) {
      throw new BadRequestException('Este prestamo ya fue devuelto');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.bookLoan.update({
        where: { id },
        data: { estado: LoanStatus.DEVUELTO, fechaDevolucion: new Date() },
        include: { book: true },
      }),
      this.prisma.book.update({
        where: { id: loan.bookId },
        data: { ejemplaresDisponibles: { increment: 1 } },
      }),
    ]);

    return updated;
  }

  async renewLoan(tenantId: string, id: string, dias = DIAS_PRESTAMO_POR_DEFECTO) {
    const loan = await this.getLoan(tenantId, id);

    if (loan.estado !== LoanStatus.ACTIVO) {
      throw new BadRequestException('Solo se pueden renovar prestamos activos');
    }

    if (loan.renovaciones >= MAX_RENOVACIONES) {
      throw new BadRequestException(
        `Este prestamo ya alcanzo el maximo de ${MAX_RENOVACIONES} renovaciones`,
      );
    }

    const fechaVencimiento = new Date(loan.fechaVencimiento);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);

    return this.prisma.bookLoan.update({
      where: { id },
      data: { fechaVencimiento, renovaciones: { increment: 1 } },
      include: { book: true },
    });
  }

  /** Marca como VENCIDO los prestamos activos cuya fecha ya paso. */
  async refreshOverdueLoans(tenantId: string) {
    const result = await this.prisma.bookLoan.updateMany({
      where: {
        tenantId,
        estado: LoanStatus.ACTIVO,
        fechaVencimiento: { lt: new Date() },
      },
      data: { estado: LoanStatus.VENCIDO },
    });

    return { actualizados: result.count };
  }

  // ---------------------------------------------------------------- Reservas
  async createReservation(tenantId: string, dto: CreateReservationDto, userId: string) {
    const student = await this.getStudent(userId, tenantId);
    const book = await this.findOneBook(tenantId, dto.bookId);

    const existente = await this.prisma.bookReservation.findFirst({
      where: {
        bookId: book.id,
        studentId: student.id,
        estado: { in: [ReservationStatus.PENDIENTE, ReservationStatus.LISTA] },
      },
      select: { id: true },
    });

    if (existente) {
      throw new BadRequestException('Ya tienes una reserva activa para este libro');
    }

    const fechaExpiracion = dto.fechaExpiracion
      ? new Date(dto.fechaExpiracion)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          return d;
        })();

    return this.prisma.bookReservation.create({
      data: { tenantId, bookId: book.id, studentId: student.id, fechaExpiracion },
      include: { book: true },
    });
  }

  async findMyReservations(tenantId: string, userId: string) {
    const student = await this.getStudent(userId, tenantId);

    return this.prisma.bookReservation.findMany({
      where: { tenantId, studentId: student.id },
      include: { book: true },
      orderBy: { fechaReserva: 'desc' },
    });
  }

  async findAllReservations(tenantId: string) {
    return this.prisma.bookReservation.findMany({
      where: { tenantId },
      include: {
        book: true,
        student: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
      orderBy: { fechaReserva: 'desc' },
    });
  }

  async cancelReservation(tenantId: string, id: string) {
    const reservation = await this.prisma.bookReservation.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.estado === ReservationStatus.CANCELADA) {
      throw new BadRequestException('Esta reserva ya esta cancelada');
    }

    return this.prisma.bookReservation.update({
      where: { id },
      data: { estado: ReservationStatus.CANCELADA },
      include: { book: true },
    });
  }

  // ------------------------------------------------------------ Estadisticas
  async getStats(tenantId: string) {
    const [libros, ejemplares, prestamosActivos, vencidos, reservas] = await Promise.all([
      this.prisma.book.count({ where: { tenantId } }),
      this.prisma.book.aggregate({
        where: { tenantId },
        _sum: { ejemplaresTotal: true, ejemplaresDisponibles: true },
      }),
      this.prisma.bookLoan.count({ where: { tenantId, estado: LoanStatus.ACTIVO } }),
      this.prisma.bookLoan.count({ where: { tenantId, estado: LoanStatus.VENCIDO } }),
      this.prisma.bookReservation.count({
        where: { tenantId, estado: ReservationStatus.PENDIENTE },
      }),
    ]);

    return {
      totalLibros: libros,
      totalEjemplares: ejemplares._sum.ejemplaresTotal ?? 0,
      ejemplaresDisponibles: ejemplares._sum.ejemplaresDisponibles ?? 0,
      prestamosActivos,
      prestamosVencidos: vencidos,
      reservasPendientes: reservas,
    };
  }
}
