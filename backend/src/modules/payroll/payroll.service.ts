import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreatePayrollEmployeeDto,
  UpdatePayrollEmployeeDto,
  CreatePayrollRecordDto,
  UpdatePayrollRecordDto,
  QueryPayrollEmployeesDto,
  QueryPayrollRecordsDto,
  ProcessPayrollDto,
} from './dto';
import { EmployeeStatus, PayrollStatus, Prisma } from '@prisma/client';

/**
 * Interfaz para las estadisticas de nomina
 */
export interface PayrollStats {
  totalEmpleados: number;
  empleadosActivos: number;
  totalAPagar: number;
  totalBonificaciones: number;
  totalDeducciones: number;
  promedioSalario: number;
  porDepartamento: Record<string, DepartmentStats>;
  registrosPorEstado: Record<PayrollStatus, number>;
}

/**
 * Interfaz para estadisticas por departamento
 */
interface DepartmentStats {
  empleados: number;
  totalSalarios: number;
  totalBonificaciones: number;
  totalDeducciones: number;
  totalNeto: number;
}

/**
 * Interfaz para datos de exportacion a PDF
 */
export interface PayrollExportData {
  periodo: string;
  fechaGeneracion: string;
  tenant: {
    id: string;
  };
  resumen: {
    totalEmpleados: number;
    totalBruto: number;
    totalBonificaciones: number;
    totalDeducciones: number;
    totalNeto: number;
  };
  registros: Array<{
    empleado: {
      nombre: string;
      identificacion: string;
      cargo: string;
      departamento: string;
      banco: string;
      cuentaBancaria: string;
    };
    salarioBase: number;
    bonificaciones: number;
    deducciones: number;
    salarioNeto: number;
    fechaPago: string;
  }>;
}

/**
 * Servicio para la gestion de nomina
 * Maneja operaciones CRUD para empleados y registros de nomina
 * Incluye procesamiento masivo y estadisticas
 */
@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CRUD DE EMPLEADOS DE NOMINA
  // ============================================

  /**
   * Crea un nuevo empleado en el sistema de nomina
   * @param tenantId - ID del tenant
   * @param createDto - Datos del empleado a crear
   * @returns Empleado creado
   */
  async createEmployee(tenantId: string, createDto: CreatePayrollEmployeeDto) {
    this.logger.log(`Creating payroll employee for tenant ${tenantId}`);

    // Verificar que no exista un empleado con la misma identificacion
    const existingEmployee = await this.prisma.payrollEmployee.findFirst({
      where: { tenantId, identificacion: createDto.identificacion },
    });

    if (existingEmployee) {
      throw new ConflictException(
        `Ya existe un empleado con la identificacion ${createDto.identificacion}`,
      );
    }

    try {
      const employee = await this.prisma.payrollEmployee.create({
        data: {
          tenantId,
          nombre: createDto.nombre,
          identificacion: createDto.identificacion,
          cargo: createDto.cargo,
          departamento: createDto.departamento,
          salarioBase: createDto.salarioBase,
          cuentaBancaria: createDto.cuentaBancaria,
          banco: createDto.banco,
          estado: createDto.estado,
          fechaIngreso: new Date(createDto.fechaIngreso),
        },
      });

      this.logger.log(`Payroll employee created successfully with ID: ${employee.id}`);
      return employee;
    } catch (error) {
      this.logger.error(`Error creating payroll employee: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un empleado con esa identificacion');
        }
      }
      throw error;
    }
  }

  /**
   * Lista todos los empleados con filtros y paginacion
   * @param tenantId - ID del tenant
   * @param query - Parametros de consulta
   * @returns Lista paginada de empleados
   */
  async findAllEmployees(tenantId: string, query: QueryPayrollEmployeesDto) {
    const {
      page = 1,
      limit = 20,
      departamento,
      cargo,
      estado,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.PayrollEmployeeWhereInput = { tenantId };

    if (departamento) {
      where.departamento = { contains: departamento, mode: 'insensitive' };
    }

    if (cargo) {
      where.cargo = { contains: cargo, mode: 'insensitive' };
    }

    if (estado) {
      where.estado = estado;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { identificacion: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
        { departamento: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'nombre',
      'identificacion',
      'salarioBase',
      'fechaIngreso',
      'departamento',
      'cargo',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.PayrollEmployeeOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [employees, total] = await Promise.all([
      this.prisma.payrollEmployee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { payrollRecords: true },
          },
        },
      }),
      this.prisma.payrollEmployee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtiene un empleado por su ID
   * @param id - ID del empleado
   * @param tenantId - ID del tenant
   * @returns Empleado encontrado
   */
  async findOneEmployee(id: string, tenantId: string) {
    const employee = await this.prisma.payrollEmployee.findFirst({
      where: { id, tenantId },
      include: {
        payrollRecords: {
          orderBy: { periodo: 'desc' },
          take: 12, // Ultimos 12 registros
        },
        _count: {
          select: { payrollRecords: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Calcular antiguedad en meses
    const antiguedadMeses = this.calculateMonthsDifference(employee.fechaIngreso, new Date());

    return {
      ...employee,
      antiguedadMeses,
    };
  }

  /**
   * Actualiza un empleado existente
   * @param id - ID del empleado
   * @param tenantId - ID del tenant
   * @param updateDto - Datos a actualizar
   * @returns Empleado actualizado
   */
  async updateEmployee(id: string, tenantId: string, updateDto: UpdatePayrollEmployeeDto) {
    const existingEmployee = await this.prisma.payrollEmployee.findFirst({
      where: { id, tenantId },
    });

    if (!existingEmployee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Si se cambia la identificacion, verificar que no exista
    if (updateDto.identificacion && updateDto.identificacion !== existingEmployee.identificacion) {
      const idExists = await this.prisma.payrollEmployee.findFirst({
        where: {
          tenantId,
          identificacion: updateDto.identificacion,
          id: { not: id },
        },
      });

      if (idExists) {
        throw new ConflictException(
          `Ya existe un empleado con la identificacion ${updateDto.identificacion}`,
        );
      }
    }

    const updateData: Prisma.PayrollEmployeeUpdateInput = {};

    if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre;
    if (updateDto.identificacion !== undefined) updateData.identificacion = updateDto.identificacion;
    if (updateDto.cargo !== undefined) updateData.cargo = updateDto.cargo;
    if (updateDto.departamento !== undefined) updateData.departamento = updateDto.departamento;
    if (updateDto.salarioBase !== undefined) updateData.salarioBase = updateDto.salarioBase;
    if (updateDto.cuentaBancaria !== undefined) updateData.cuentaBancaria = updateDto.cuentaBancaria;
    if (updateDto.banco !== undefined) updateData.banco = updateDto.banco;
    if (updateDto.estado !== undefined) updateData.estado = updateDto.estado;
    if (updateDto.fechaIngreso !== undefined) updateData.fechaIngreso = new Date(updateDto.fechaIngreso);

    try {
      const updatedEmployee = await this.prisma.payrollEmployee.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Payroll employee ${id} updated successfully`);
      return updatedEmployee;
    } catch (error) {
      this.logger.error(`Error updating payroll employee ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un empleado del sistema de nomina
   * @param id - ID del empleado
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async removeEmployee(id: string, tenantId: string) {
    const employee = await this.prisma.payrollEmployee.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { payrollRecords: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Advertir si tiene registros de nomina
    if (employee._count.payrollRecords > 0) {
      this.logger.warn(
        `Deleting employee ${id} with ${employee._count.payrollRecords} payroll records`,
      );
    }

    await this.prisma.payrollEmployee.delete({ where: { id } });

    this.logger.log(`Payroll employee ${id} deleted successfully`);

    return {
      message: 'Empleado eliminado exitosamente',
      deletedEmployee: {
        id: employee.id,
        nombre: employee.nombre,
        identificacion: employee.identificacion,
      },
    };
  }

  // ============================================
  // CRUD DE REGISTROS DE NOMINA
  // ============================================

  /**
   * Crea un nuevo registro de nomina
   * @param tenantId - ID del tenant
   * @param createDto - Datos del registro a crear
   * @returns Registro creado con salario neto calculado
   */
  async createRecord(tenantId: string, createDto: CreatePayrollRecordDto) {
    this.logger.log(`Creating payroll record for tenant ${tenantId}`);

    // Verificar que el empleado existe
    const employee = await this.prisma.payrollEmployee.findFirst({
      where: { id: createDto.empleadoId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${createDto.empleadoId} no encontrado`);
    }

    // Verificar que no exista un registro para el mismo empleado y periodo
    const existingRecord = await this.prisma.payrollRecord.findFirst({
      where: {
        tenantId,
        empleadoId: createDto.empleadoId,
        periodo: createDto.periodo,
      },
    });

    if (existingRecord) {
      throw new ConflictException(
        `Ya existe un registro de nomina para el empleado en el periodo ${createDto.periodo}`,
      );
    }

    // Calcular salario neto
    const bonificaciones = createDto.bonificaciones ?? 0;
    const deducciones = createDto.deducciones ?? 0;
    const salarioNeto = this.calculateSalarioNeto(createDto.salarioBase, bonificaciones, deducciones);

    try {
      const record = await this.prisma.payrollRecord.create({
        data: {
          tenantId,
          empleadoId: createDto.empleadoId,
          periodo: createDto.periodo,
          fechaInicio: new Date(createDto.fechaInicio),
          fechaFin: new Date(createDto.fechaFin),
          fechaPago: new Date(createDto.fechaPago),
          salarioBase: createDto.salarioBase,
          bonificaciones,
          deducciones,
          salarioNeto,
          estado: createDto.estado ?? PayrollStatus.BORRADOR,
        },
        include: {
          empleado: true,
        },
      });

      this.logger.log(`Payroll record created successfully with ID: ${record.id}`);
      return record;
    } catch (error) {
      this.logger.error(`Error creating payroll record: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todos los registros de nomina con filtros y paginacion
   * @param tenantId - ID del tenant
   * @param query - Parametros de consulta
   * @returns Lista paginada de registros
   */
  async findAllRecords(tenantId: string, query: QueryPayrollRecordsDto) {
    const {
      page = 1,
      limit = 20,
      periodo,
      estado,
      departamento,
      cargo,
      empleadoId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.PayrollRecordWhereInput = { tenantId };

    if (periodo) {
      where.periodo = periodo;
    }

    if (estado) {
      where.estado = estado;
    }

    if (empleadoId) {
      where.empleadoId = empleadoId;
    }

    // Filtros por datos del empleado
    if (departamento || cargo) {
      where.empleado = {};
      if (departamento) {
        where.empleado.departamento = { contains: departamento, mode: 'insensitive' };
      }
      if (cargo) {
        where.empleado.cargo = { contains: cargo, mode: 'insensitive' };
      }
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'periodo',
      'salarioBase',
      'salarioNeto',
      'fechaPago',
      'estado',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.PayrollRecordOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [records, total] = await Promise.all([
      this.prisma.payrollRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              identificacion: true,
              cargo: true,
              departamento: true,
              banco: true,
              cuentaBancaria: true,
            },
          },
        },
      }),
      this.prisma.payrollRecord.count({ where }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtiene un registro de nomina por su ID
   * @param id - ID del registro
   * @param tenantId - ID del tenant
   * @returns Registro encontrado
   */
  async findOneRecord(id: string, tenantId: string) {
    const record = await this.prisma.payrollRecord.findFirst({
      where: { id, tenantId },
      include: {
        empleado: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Registro de nomina con ID ${id} no encontrado`);
    }

    return record;
  }

  /**
   * Actualiza un registro de nomina existente
   * @param id - ID del registro
   * @param tenantId - ID del tenant
   * @param updateDto - Datos a actualizar
   * @returns Registro actualizado
   */
  async updateRecord(id: string, tenantId: string, updateDto: UpdatePayrollRecordDto) {
    const existingRecord = await this.prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });

    if (!existingRecord) {
      throw new NotFoundException(`Registro de nomina con ID ${id} no encontrado`);
    }

    // No permitir modificar registros ya pagados
    if (existingRecord.estado === PayrollStatus.PAGADO && updateDto.estado !== PayrollStatus.PAGADO) {
      throw new BadRequestException('No se puede modificar un registro de nomina ya pagado');
    }

    // Validar transicion de estado
    if (updateDto.estado) {
      this.validateStatusTransition(existingRecord.estado, updateDto.estado);
    }

    const updateData: Prisma.PayrollRecordUpdateInput = {};

    if (updateDto.fechaInicio !== undefined) updateData.fechaInicio = new Date(updateDto.fechaInicio);
    if (updateDto.fechaFin !== undefined) updateData.fechaFin = new Date(updateDto.fechaFin);
    if (updateDto.fechaPago !== undefined) updateData.fechaPago = new Date(updateDto.fechaPago);
    if (updateDto.salarioBase !== undefined) updateData.salarioBase = updateDto.salarioBase;
    if (updateDto.bonificaciones !== undefined) updateData.bonificaciones = updateDto.bonificaciones;
    if (updateDto.deducciones !== undefined) updateData.deducciones = updateDto.deducciones;
    if (updateDto.estado !== undefined) updateData.estado = updateDto.estado;

    // Recalcular salario neto si se modificaron valores
    const salarioBase = updateDto.salarioBase ?? existingRecord.salarioBase;
    const bonificaciones = updateDto.bonificaciones ?? existingRecord.bonificaciones;
    const deducciones = updateDto.deducciones ?? existingRecord.deducciones;

    if (
      updateDto.salarioBase !== undefined ||
      updateDto.bonificaciones !== undefined ||
      updateDto.deducciones !== undefined
    ) {
      updateData.salarioNeto = this.calculateSalarioNeto(salarioBase, bonificaciones, deducciones);
    }

    try {
      const updatedRecord = await this.prisma.payrollRecord.update({
        where: { id },
        data: updateData,
        include: {
          empleado: true,
        },
      });

      this.logger.log(`Payroll record ${id} updated successfully`);
      return updatedRecord;
    } catch (error) {
      this.logger.error(`Error updating payroll record ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un registro de nomina
   * @param id - ID del registro
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async removeRecord(id: string, tenantId: string) {
    const record = await this.prisma.payrollRecord.findFirst({
      where: { id, tenantId },
      include: {
        empleado: {
          select: { nombre: true, identificacion: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Registro de nomina con ID ${id} no encontrado`);
    }

    // No permitir eliminar registros pagados
    if (record.estado === PayrollStatus.PAGADO) {
      throw new BadRequestException('No se puede eliminar un registro de nomina ya pagado');
    }

    await this.prisma.payrollRecord.delete({ where: { id } });

    this.logger.log(`Payroll record ${id} deleted successfully`);

    return {
      message: 'Registro de nomina eliminado exitosamente',
      deletedRecord: {
        id: record.id,
        periodo: record.periodo,
        empleado: record.empleado.nombre,
      },
    };
  }

  // ============================================
  // OPERACIONES DE PROCESAMIENTO
  // ============================================

  /**
   * Procesa nomina masiva para un periodo
   * Genera registros para todos los empleados activos
   * @param tenantId - ID del tenant
   * @param processDto - Datos del periodo a procesar
   * @returns Resumen del procesamiento
   */
  async processPayrollPeriod(tenantId: string, processDto: ProcessPayrollDto) {
    this.logger.log(`Processing payroll for period ${processDto.periodo} in tenant ${tenantId}`);

    // Obtener empleados activos
    let employeesQuery: Prisma.PayrollEmployeeWhereInput = {
      tenantId,
      estado: EmployeeStatus.ACTIVO,
    };

    // Si se especifican IDs, filtrar por ellos
    if (processDto.empleadosIds && processDto.empleadosIds.length > 0) {
      employeesQuery = {
        ...employeesQuery,
        id: { in: processDto.empleadosIds },
      };
    }

    const activeEmployees = await this.prisma.payrollEmployee.findMany({
      where: employeesQuery,
    });

    if (activeEmployees.length === 0) {
      throw new BadRequestException('No hay empleados activos para procesar');
    }

    // Verificar registros existentes para este periodo
    const existingRecords = await this.prisma.payrollRecord.findMany({
      where: {
        tenantId,
        periodo: processDto.periodo,
        empleadoId: { in: activeEmployees.map((e) => e.id) },
      },
      select: { empleadoId: true },
    });

    const existingEmployeeIds = new Set(existingRecords.map((r) => r.empleadoId));

    // Filtrar empleados que ya tienen registro
    const employeesToProcess = activeEmployees.filter(
      (e) => !existingEmployeeIds.has(e.id),
    );

    if (employeesToProcess.length === 0) {
      throw new ConflictException(
        `Todos los empleados ya tienen registro de nomina para el periodo ${processDto.periodo}`,
      );
    }

    const bonificacionPorcentaje = processDto.bonificacionPorcentaje ?? 0;

    // Crear registros de nomina
    const createdRecords = [];
    const errors = [];

    for (const employee of employeesToProcess) {
      try {
        const bonificaciones = (employee.salarioBase * bonificacionPorcentaje) / 100;
        const deducciones = this.calculateDeduccionesLegales(employee.salarioBase);
        const salarioNeto = this.calculateSalarioNeto(
          employee.salarioBase,
          bonificaciones,
          deducciones,
        );

        const record = await this.prisma.payrollRecord.create({
          data: {
            tenantId,
            empleadoId: employee.id,
            periodo: processDto.periodo,
            fechaInicio: new Date(processDto.fechaInicio),
            fechaFin: new Date(processDto.fechaFin),
            fechaPago: new Date(processDto.fechaPago),
            salarioBase: employee.salarioBase,
            bonificaciones,
            deducciones,
            salarioNeto,
            estado: PayrollStatus.BORRADOR,
          },
        });

        createdRecords.push(record);
      } catch (error) {
        errors.push({
          empleadoId: employee.id,
          nombre: employee.nombre,
          error: error.message,
        });
      }
    }

    const totalBruto = createdRecords.reduce((sum, r) => sum + r.salarioBase, 0);
    const totalBonificaciones = createdRecords.reduce((sum, r) => sum + r.bonificaciones, 0);
    const totalDeducciones = createdRecords.reduce((sum, r) => sum + r.deducciones, 0);
    const totalNeto = createdRecords.reduce((sum, r) => sum + r.salarioNeto, 0);

    this.logger.log(
      `Payroll processed: ${createdRecords.length} records created, ${errors.length} errors`,
    );

    return {
      message: `Nomina procesada exitosamente para el periodo ${processDto.periodo}`,
      periodo: processDto.periodo,
      resumen: {
        empleadosProcesados: createdRecords.length,
        empleadosConError: errors.length,
        empleadosOmitidos: existingEmployeeIds.size,
        totalBruto,
        totalBonificaciones,
        totalDeducciones,
        totalNeto,
      },
      errores: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Calcula el salario neto de un empleado
   * @param salarioBase - Salario base
   * @param bonificaciones - Total bonificaciones
   * @param deducciones - Total deducciones
   * @returns Salario neto calculado
   */
  calculateSalarioNeto(
    salarioBase: number,
    bonificaciones: number,
    deducciones: number,
  ): number {
    return salarioBase + bonificaciones - deducciones;
  }

  /**
   * Calcula deducciones legales (salud + pension = 8%)
   * @param salarioBase - Salario base
   * @returns Total deducciones legales
   */
  private calculateDeduccionesLegales(salarioBase: number): number {
    const porcentajeSalud = 0.04; // 4%
    const porcentajePension = 0.04; // 4%
    return salarioBase * (porcentajeSalud + porcentajePension);
  }

  // ============================================
  // ESTADISTICAS Y REPORTES
  // ============================================

  /**
   * Obtiene estadisticas de nomina para un periodo
   * @param tenantId - ID del tenant
   * @param periodo - Periodo opcional (YYYY-MM)
   * @returns Estadisticas de nomina
   */
  async getPayrollStats(tenantId: string, periodo?: string): Promise<PayrollStats> {
    // Obtener empleados
    const employees = await this.prisma.payrollEmployee.findMany({
      where: { tenantId },
    });

    const empleadosActivos = employees.filter(
      (e) => e.estado === EmployeeStatus.ACTIVO,
    ).length;

    // Obtener registros de nomina
    const recordsWhere: Prisma.PayrollRecordWhereInput = { tenantId };
    if (periodo) {
      recordsWhere.periodo = periodo;
    }

    const records = await this.prisma.payrollRecord.findMany({
      where: recordsWhere,
      include: {
        empleado: {
          select: { departamento: true },
        },
      },
    });

    // Calcular totales
    const totalAPagar = records
      .filter((r) => r.estado !== PayrollStatus.PAGADO)
      .reduce((sum, r) => sum + r.salarioNeto, 0);

    const totalBonificaciones = records.reduce((sum, r) => sum + r.bonificaciones, 0);
    const totalDeducciones = records.reduce((sum, r) => sum + r.deducciones, 0);

    // Estadisticas por departamento
    const porDepartamento: Record<string, DepartmentStats> = {};

    for (const record of records) {
      const dept = record.empleado.departamento;
      if (!porDepartamento[dept]) {
        porDepartamento[dept] = {
          empleados: 0,
          totalSalarios: 0,
          totalBonificaciones: 0,
          totalDeducciones: 0,
          totalNeto: 0,
        };
      }
      porDepartamento[dept].empleados++;
      porDepartamento[dept].totalSalarios += record.salarioBase;
      porDepartamento[dept].totalBonificaciones += record.bonificaciones;
      porDepartamento[dept].totalDeducciones += record.deducciones;
      porDepartamento[dept].totalNeto += record.salarioNeto;
    }

    // Contar registros por estado
    const registrosPorEstado: Record<PayrollStatus, number> = {
      BORRADOR: 0,
      PROCESADO: 0,
      PAGADO: 0,
    };

    records.forEach((r) => {
      registrosPorEstado[r.estado]++;
    });

    // Calcular promedio de salario
    const promedioSalario =
      employees.length > 0
        ? employees.reduce((sum, e) => sum + e.salarioBase, 0) / employees.length
        : 0;

    return {
      totalEmpleados: employees.length,
      empleadosActivos,
      totalAPagar,
      totalBonificaciones,
      totalDeducciones,
      promedioSalario: Math.round(promedioSalario),
      porDepartamento,
      registrosPorEstado,
    };
  }

  /**
   * Obtiene el historial de pagos de un empleado
   * @param empleadoId - ID del empleado
   * @param tenantId - ID del tenant
   * @returns Historial de pagos
   */
  async getEmployeePayrollHistory(empleadoId: string, tenantId: string) {
    const employee = await this.prisma.payrollEmployee.findFirst({
      where: { id: empleadoId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    const records = await this.prisma.payrollRecord.findMany({
      where: { empleadoId, tenantId },
      orderBy: { periodo: 'desc' },
    });

    // Calcular estadisticas del historial
    const totalPagado = records
      .filter((r) => r.estado === PayrollStatus.PAGADO)
      .reduce((sum, r) => sum + r.salarioNeto, 0);

    const promedioNeto =
      records.length > 0
        ? records.reduce((sum, r) => sum + r.salarioNeto, 0) / records.length
        : 0;

    const totalBonificaciones = records.reduce((sum, r) => sum + r.bonificaciones, 0);
    const totalDeducciones = records.reduce((sum, r) => sum + r.deducciones, 0);

    return {
      empleado: {
        id: employee.id,
        nombre: employee.nombre,
        identificacion: employee.identificacion,
        cargo: employee.cargo,
        departamento: employee.departamento,
        salarioActual: employee.salarioBase,
        fechaIngreso: employee.fechaIngreso,
      },
      estadisticas: {
        totalRegistros: records.length,
        totalPagado,
        promedioNeto: Math.round(promedioNeto),
        totalBonificaciones,
        totalDeducciones,
      },
      historial: records,
    };
  }

  /**
   * Prepara datos para exportar nomina a PDF
   * @param tenantId - ID del tenant
   * @param periodo - Periodo a exportar
   * @returns Datos estructurados para PDF
   */
  async exportPayrollToPDF(tenantId: string, periodo: string): Promise<PayrollExportData> {
    const records = await this.prisma.payrollRecord.findMany({
      where: { tenantId, periodo },
      include: {
        empleado: true,
      },
      orderBy: [
        { empleado: { departamento: 'asc' } },
        { empleado: { nombre: 'asc' } },
      ],
    });

    if (records.length === 0) {
      throw new NotFoundException(`No hay registros de nomina para el periodo ${periodo}`);
    }

    const totalBruto = records.reduce((sum, r) => sum + r.salarioBase, 0);
    const totalBonificaciones = records.reduce((sum, r) => sum + r.bonificaciones, 0);
    const totalDeducciones = records.reduce((sum, r) => sum + r.deducciones, 0);
    const totalNeto = records.reduce((sum, r) => sum + r.salarioNeto, 0);

    return {
      periodo,
      fechaGeneracion: new Date().toISOString(),
      tenant: {
        id: tenantId,
      },
      resumen: {
        totalEmpleados: records.length,
        totalBruto,
        totalBonificaciones,
        totalDeducciones,
        totalNeto,
      },
      registros: records.map((r) => ({
        empleado: {
          nombre: r.empleado.nombre,
          identificacion: r.empleado.identificacion,
          cargo: r.empleado.cargo,
          departamento: r.empleado.departamento,
          banco: r.empleado.banco,
          cuentaBancaria: r.empleado.cuentaBancaria,
        },
        salarioBase: r.salarioBase,
        bonificaciones: r.bonificaciones,
        deducciones: r.deducciones,
        salarioNeto: r.salarioNeto,
        fechaPago: r.fechaPago.toISOString(),
      })),
    };
  }

  // ============================================
  // METODOS AUXILIARES
  // ============================================

  /**
   * Valida la transicion de estado de un registro de nomina
   * BORRADOR -> PROCESADO -> PAGADO (flujo unidireccional)
   */
  private validateStatusTransition(currentStatus: PayrollStatus, newStatus: PayrollStatus): void {
    const validTransitions: Record<PayrollStatus, PayrollStatus[]> = {
      BORRADOR: [PayrollStatus.PROCESADO],
      PROCESADO: [PayrollStatus.PAGADO, PayrollStatus.BORRADOR],
      PAGADO: [], // No se puede cambiar desde pagado
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`,
      );
    }
  }

  /**
   * Calcula la diferencia en meses entre dos fechas
   */
  private calculateMonthsDifference(startDate: Date, endDate: Date): number {
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return Math.max(0, months);
  }
}
