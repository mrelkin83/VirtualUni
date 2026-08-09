import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TENANT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const REGISTRO = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('FinanceService', () => {
  let service: FinanceService;

  const modelo = () => ({
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _sum: {} }),
  });

  const prismaMock: any = {
    transaction: modelo(),
    account: modelo(),
    budget: modelo(),
    studentInvoice: modelo(),
    studentPayment: modelo(),
    student: modelo(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    for (const m of Object.values(prismaMock) as any[]) {
      m.findMany.mockResolvedValue([]);
      m.count.mockResolvedValue(0);
      m.aggregate.mockResolvedValue({ _sum: {} });
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  describe('aislamiento por tenant en mutaciones', () => {
    // Regresión: update/remove operaban por id sin filtrar por tenant, de modo
    // que un admin podía modificar o borrar registros de otro tenant.
    const casos: Array<[string, string, () => Promise<unknown>]> = [
      ['updateTransaction', 'transaction', () => service.updateTransaction(REGISTRO, {} as any, TENANT_A)],
      ['removeTransaction', 'transaction', () => service.removeTransaction(REGISTRO, TENANT_A)],
      ['updateAccount', 'account', () => service.updateAccount(REGISTRO, {}, TENANT_A)],
      ['removeAccount', 'account', () => service.removeAccount(REGISTRO, TENANT_A)],
      ['updateBudget', 'budget', () => service.updateBudget(REGISTRO, {}, TENANT_A)],
      ['removeBudget', 'budget', () => service.removeBudget(REGISTRO, TENANT_A)],
      ['updateInvoice', 'studentInvoice', () => service.updateInvoice(REGISTRO, {}, TENANT_A)],
      ['removeInvoice', 'studentInvoice', () => service.removeInvoice(REGISTRO, TENANT_A)],
      ['updatePayment', 'studentPayment', () => service.updatePayment(REGISTRO, {}, TENANT_A)],
      ['removePayment', 'studentPayment', () => service.removePayment(REGISTRO, TENANT_A)],
    ];

    it.each(casos)('%s falla si el registro es de otro tenant', async (_nombre, model, accion) => {
      // El registro existe, pero no dentro del tenant que lo pide.
      prismaMock[model].findFirst.mockResolvedValue(null);

      await expect(accion()).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock[model].update).not.toHaveBeenCalled();
      expect(prismaMock[model].delete).not.toHaveBeenCalled();
    });

    it.each(casos)('%s comprueba la pertenencia acotando por tenantId', async (_n, model, accion) => {
      prismaMock[model].findFirst.mockResolvedValue({ id: REGISTRO });
      prismaMock[model].update.mockResolvedValue({ id: REGISTRO });
      prismaMock[model].delete.mockResolvedValue({ id: REGISTRO });

      await accion();

      expect(prismaMock[model].findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: REGISTRO, tenantId: TENANT_A } }),
      );
    });
  });

  describe('filtros de consulta', () => {
    // Regresión: `where: { tenantId, ...params }` permitía que un cliente
    // enviara ?tenantId=<otro> y sobrescribiera el filtro de tenant.
    it('ignora un tenantId inyectado por query en las transacciones', async () => {
      await service.findAllTransactions({ tenantId: TENANT_B, tipo: 'INGRESO' }, TENANT_A);

      const where = prismaMock.transaction.findMany.mock.calls[0][0].where;
      expect(where.tenantId).toBe(TENANT_A);
      expect(where.tipo).toBe('INGRESO');
    });

    it.each([
      ['findAllAccounts', 'account'],
      ['findAllBudgets', 'budget'],
      ['findAllInvoices', 'studentInvoice'],
      ['findAllPayments', 'studentPayment'],
    ])('%s no permite sobrescribir el tenant', async (metodo, model) => {
      await (service as any)[metodo]({ tenantId: TENANT_B }, TENANT_A);

      expect(prismaMock[model].findMany.mock.calls[0][0].where.tenantId).toBe(TENANT_A);
    });

    it('descarta claves de filtro no permitidas', async () => {
      await service.findAllAccounts({ saldo: { gt: 0 }, nombre: 'x', tipo: 'ACTIVO' }, TENANT_A);

      const where = prismaMock.account.findMany.mock.calls[0][0].where;
      expect(where).toEqual({ tipo: 'ACTIVO', tenantId: TENANT_A });
    });
  });

  describe('creación', () => {
    it('fija el tenant del servidor al crear una transacción', async () => {
      prismaMock.transaction.create.mockResolvedValue({ id: REGISTRO });

      await service.createTransaction(
        {
          tipo: 'INGRESO',
          categoria: 'Matriculas',
          concepto: 'Pago',
          monto: 1000,
          fecha: '2026-01-01',
          creadoPor: 'admin@uniprueba.com',
        } as any,
        TENANT_A,
      );

      const data = prismaMock.transaction.create.mock.calls[0][0].data;
      expect(data.tenantId).toBe(TENANT_A);
      expect(data.creadoPor).toBe('admin@uniprueba.com');
      expect(data.estado).toBe('PENDIENTE');
    });

    it('rechaza un pago cuya factura pertenece a otro tenant', async () => {
      prismaMock.studentInvoice.findFirst.mockResolvedValue(null);

      await expect(
        service.createPayment({ invoiceId: REGISTRO, fecha: '2026-01-01' }, TENANT_A),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.studentPayment.create).not.toHaveBeenCalled();
    });
  });

  describe('resumen financiero del estudiante', () => {
    it('calcula lo pagado y el saldo pendiente a partir de las facturas', async () => {
      prismaMock.student.findUnique.mockResolvedValue({ id: 'stu-1', tenantId: TENANT_A });
      prismaMock.studentInvoice.findMany.mockResolvedValue([
        { total: 1000, fechaVencimiento: new Date('2030-01-01'), payments: [{ monto: 400 }] },
        { total: 500, fechaVencimiento: new Date('2030-01-01'), payments: [] },
      ]);

      const resumen = await service.getMyFinancialSummary(TENANT_A, 'user-1');

      expect(resumen).toMatchObject({
        totalFacturado: 1500,
        totalPagado: 400,
        saldoPendiente: 1100,
        facturasTotales: 2,
      });
    });

    it('cuenta como vencidas las facturas impagas fuera de plazo', async () => {
      prismaMock.student.findUnique.mockResolvedValue({ id: 'stu-1', tenantId: TENANT_A });
      prismaMock.studentInvoice.findMany.mockResolvedValue([
        { total: 1000, fechaVencimiento: new Date('2020-01-01'), payments: [] },
        { total: 500, fechaVencimiento: new Date('2020-01-01'), payments: [{ monto: 500 }] },
      ]);

      const resumen = await service.getMyFinancialSummary(TENANT_A, 'user-1');

      expect(resumen.facturasVencidas).toBe(1);
    });
  });
});
