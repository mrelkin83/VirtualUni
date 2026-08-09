import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Toda consulta y toda escritura se acotan al tenant recibido. Los filtros de
 * query se construyen a partir de una lista blanca: nunca se vuelca el objeto
 * de query directamente en el `where` de Prisma, porque eso permitiria a un
 * cliente sobrescribir el propio filtro de tenant.
 */
@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private pickFilters(params: any, allowed: string[]): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (!params) {
      return where;
    }

    for (const key of allowed) {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        where[key] = value;
      }
    }

    return where;
  }

  /** Verifica que el registro pertenezca al tenant antes de mutarlo. */
  private async assertOwnership(
    model: 'transaction' | 'account' | 'budget' | 'studentInvoice' | 'studentPayment',
    id: string,
    tenantId: string,
    label: string,
  ): Promise<void> {
    const found = await (this.prisma[model] as any).findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!found) {
      throw new NotFoundException(`${label} con ID ${id} no encontrado`);
    }
  }

  // ---------------------------------------------------------------- Transactions
  private async generateTransactionCode(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.transaction.count({
      where: {
        tenantId,
        codigo: { startsWith: `TRN-${year}-` },
      },
    });
    return `TRN-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async createTransaction(
    data: CreateTransactionDto & { creadoPor: string },
    tenantId: string,
  ) {
    const codigo = await this.generateTransactionCode(tenantId);

    return this.prisma.transaction.create({
      data: {
        ...data,
        codigo,
        tenantId,
        fecha: new Date(data.fecha),
        estado: data.estado || 'PENDIENTE',
      },
    });
  }

  async findAllTransactions(params: any, tenantId: string) {
    return this.prisma.transaction.findMany({
      where: {
        ...this.pickFilters(params, ['tipo', 'estado', 'categoria', 'estudiante']),
        tenantId,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOneTransaction(id: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaccion con ID ${id} no encontrada`);
    }

    return transaction;
  }

  async updateTransaction(id: string, data: Partial<CreateTransactionDto>, tenantId: string) {
    await this.assertOwnership('transaction', id, tenantId, 'Transaccion');

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      },
    });
  }

  async removeTransaction(id: string, tenantId: string) {
    await this.assertOwnership('transaction', id, tenantId, 'Transaccion');

    return this.prisma.transaction.delete({ where: { id } });
  }

  async getStats(tenantId: string) {
    const [ingresos, egresos, transactions] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { tenantId, tipo: 'INGRESO', estado: 'COMPLETADO' },
        _sum: { monto: true },
      }),
      this.prisma.transaction.aggregate({
        where: { tenantId, tipo: 'EGRESO', estado: 'COMPLETADO' },
        _sum: { monto: true },
      }),
      this.prisma.transaction.count({ where: { tenantId } }),
    ]);

    return {
      totalIngresos: ingresos._sum.monto || 0,
      totalEgresos: egresos._sum.monto || 0,
      balance: (ingresos._sum.monto || 0) - (egresos._sum.monto || 0),
      totalTransacciones: transactions,
    };
  }

  // -------------------------------------------------------------------- Accounts
  private async generateAccountCode(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.account.count({
      where: {
        tenantId,
        codigo: { startsWith: `ACC-${year}-` },
      },
    });
    return `ACC-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async createAccount(data: any, tenantId: string) {
    const codigo = await this.generateAccountCode(tenantId);

    return this.prisma.account.create({
      data: { ...data, codigo, tenantId },
    });
  }

  async findAllAccounts(params: any, tenantId: string) {
    return this.prisma.account.findMany({
      where: {
        ...this.pickFilters(params, ['tipo', 'categoria', 'activa']),
        tenantId,
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async findOneAccount(id: string, tenantId: string) {
    const account = await this.prisma.account.findFirst({ where: { id, tenantId } });

    if (!account) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }

    return account;
  }

  async updateAccount(id: string, data: any, tenantId: string) {
    await this.assertOwnership('account', id, tenantId, 'Cuenta');

    return this.prisma.account.update({ where: { id }, data });
  }

  async removeAccount(id: string, tenantId: string) {
    await this.assertOwnership('account', id, tenantId, 'Cuenta');

    return this.prisma.account.delete({ where: { id } });
  }

  // --------------------------------------------------------------------- Budgets
  async createBudget(data: any, tenantId: string) {
    return this.prisma.budget.create({
      data: {
        ...data,
        tenantId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
      },
    });
  }

  async findAllBudgets(params: any, tenantId: string) {
    return this.prisma.budget.findMany({
      where: {
        ...this.pickFilters(params, ['estado', 'periodo', 'categoria']),
        tenantId,
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findOneBudget(id: string, tenantId: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, tenantId } });

    if (!budget) {
      throw new NotFoundException(`Presupuesto con ID ${id} no encontrado`);
    }

    return budget;
  }

  async updateBudget(id: string, data: any, tenantId: string) {
    await this.assertOwnership('budget', id, tenantId, 'Presupuesto');

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...data,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      },
    });
  }

  async removeBudget(id: string, tenantId: string) {
    await this.assertOwnership('budget', id, tenantId, 'Presupuesto');

    return this.prisma.budget.delete({ where: { id } });
  }

  // ------------------------------------------------------------- Student Invoices
  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.studentInvoice.count({
      where: {
        tenantId,
        numero: { startsWith: `INV-${year}-` },
      },
    });
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async createInvoice(data: any, tenantId: string) {
    const numero = await this.generateInvoiceNumber(tenantId);

    return this.prisma.studentInvoice.create({
      data: {
        ...data,
        numero,
        tenantId,
        fechaEmision: new Date(data.fechaEmision),
        fechaVencimiento: new Date(data.fechaVencimiento),
      },
    });
  }

  async findAllInvoices(params: any, tenantId: string) {
    return this.prisma.studentInvoice.findMany({
      where: {
        ...this.pickFilters(params, ['estado', 'estudiante', 'numero']),
        tenantId,
      },
      include: { payments: true },
      orderBy: { fechaEmision: 'desc' },
    });
  }

  async findOneInvoice(id: string, tenantId: string) {
    const invoice = await this.prisma.studentInvoice.findFirst({
      where: { id, tenantId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return invoice;
  }

  async updateInvoice(id: string, data: any, tenantId: string) {
    await this.assertOwnership('studentInvoice', id, tenantId, 'Factura');

    return this.prisma.studentInvoice.update({
      where: { id },
      data: {
        ...data,
        fechaEmision: data.fechaEmision ? new Date(data.fechaEmision) : undefined,
        fechaVencimiento: data.fechaVencimiento
          ? new Date(data.fechaVencimiento)
          : undefined,
      },
    });
  }

  async removeInvoice(id: string, tenantId: string) {
    await this.assertOwnership('studentInvoice', id, tenantId, 'Factura');

    return this.prisma.studentInvoice.delete({ where: { id } });
  }

  // -------------------------------------------------------------------- Payments
  async createPayment(data: any, tenantId: string) {
    // La factura destino debe pertenecer al mismo tenant.
    if (data?.invoiceId) {
      await this.assertOwnership('studentInvoice', data.invoiceId, tenantId, 'Factura');
    }

    return this.prisma.studentPayment.create({
      data: {
        ...data,
        tenantId,
        fecha: new Date(data.fecha),
      },
    });
  }

  async findAllPayments(params: any, tenantId: string) {
    return this.prisma.studentPayment.findMany({
      where: {
        ...this.pickFilters(params, ['invoiceId', 'metodoPago']),
        tenantId,
      },
      include: { invoice: true },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOnePayment(id: string, tenantId: string) {
    const payment = await this.prisma.studentPayment.findFirst({
      where: { id, tenantId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return payment;
  }

  // ------------------------------------------------------- Vista del estudiante
  private async getStudentId(userId: string, tenantId: string): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, tenantId: true },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    return student.id;
  }

  /** Facturas del estudiante autenticado, con sus pagos aplicados. */
  async findMyInvoices(tenantId: string, userId: string) {
    const studentId = await this.getStudentId(userId, tenantId);

    return this.prisma.studentInvoice.findMany({
      where: { tenantId, studentId },
      include: { payments: true },
      orderBy: { fechaEmision: 'desc' },
    });
  }

  /** Resumen financiero del estudiante: total facturado, pagado y pendiente. */
  async getMyFinancialSummary(tenantId: string, userId: string) {
    const studentId = await this.getStudentId(userId, tenantId);

    const invoices = await this.prisma.studentInvoice.findMany({
      where: { tenantId, studentId },
      include: { payments: true },
    });

    const totalFacturado = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPagado = invoices.reduce(
      (sum, i) => sum + i.payments.reduce((s, p) => s + p.monto, 0),
      0,
    );

    const ahora = new Date();
    const vencidas = invoices.filter((i) => {
      const pagado = i.payments.reduce((s, p) => s + p.monto, 0);
      return pagado < i.total && i.fechaVencimiento < ahora;
    });

    return {
      totalFacturado,
      totalPagado,
      saldoPendiente: totalFacturado - totalPagado,
      facturasTotales: invoices.length,
      facturasVencidas: vencidas.length,
    };
  }

  async updatePayment(id: string, data: any, tenantId: string) {
    await this.assertOwnership('studentPayment', id, tenantId, 'Pago');

    return this.prisma.studentPayment.update({
      where: { id },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      },
    });
  }

  async removePayment(id: string, tenantId: string) {
    await this.assertOwnership('studentPayment', id, tenantId, 'Pago');

    return this.prisma.studentPayment.delete({ where: { id } });
  }
}
