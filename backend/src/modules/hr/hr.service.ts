import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeesDto,
  CreateVacationRequestDto,
  UpdateVacationRequestDto,
  ApproveVacationDto,
} from './dto';
import {
  EmployeeStatus,
  ContractType,
  Gender,
  CivilStatus,
  VacationStatus,
  Prisma,
} from '@prisma/client';

/**
 * Interfaz para estadisticas de empleados
 */
export interface EmployeeStats {
  totalEmpleados: number;
  porEstado: Record<EmployeeStatus, number>;
  porTipoContrato: Record<ContractType, number>;
  porDepartamento: Record<string, number>;
  porGenero: Record<Gender, number>;
  promedioSalario: number;
  empleadosRecientes: number;
  vacacionesPendientes: number;
}

/**
 * Interfaz para balance de vacaciones
 */
export interface VacationBalance {
  empleadoId: string;
  nombreEmpleado: string;
  fechaIngreso: Date;
  anosAntiguedad: number;
  diasAcumulados: number;
  diasUsados: number;
  diasDisponibles: number;
}

/**
 * Servicio para la gestion de recursos humanos
 * Maneja empleados y solicitudes de vacaciones
 */
@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);

  // Dias de vacaciones por ano trabajado (legislacion colombiana)
  private readonly VACATION_DAYS_PER_YEAR = 15;

  constructor(private readonly prisma: PrismaService) {}

  // =============================================
  // EMPLEADOS - CRUD
  // =============================================

  /**
   * Crea un nuevo empleado
   * @param tenantId - ID del tenant
   * @param createEmployeeDto - Datos del empleado a crear
   * @returns Empleado creado
   */
  async createEmployee(tenantId: string, createEmployeeDto: CreateEmployeeDto) {
    this.logger.log(`Creating new employee for tenant ${tenantId}`);

    // Verificar que la identificacion no exista para este tenant
    const existingByIdentificacion = await this.prisma.employee.findFirst({
      where: { tenantId, identificacion: createEmployeeDto.identificacion },
    });

    if (existingByIdentificacion) {
      throw new ConflictException(
        `Ya existe un empleado con la identificacion ${createEmployeeDto.identificacion}`,
      );
    }

    // Verificar que el email no exista para este tenant
    const existingByEmail = await this.prisma.employee.findFirst({
      where: { tenantId, email: createEmployeeDto.email.toLowerCase() },
    });

    if (existingByEmail) {
      throw new ConflictException(
        `Ya existe un empleado con el email ${createEmployeeDto.email}`,
      );
    }

    try {
      const employee = await this.prisma.employee.create({
        data: {
          tenantId,
          nombre: createEmployeeDto.nombre,
          identificacion: createEmployeeDto.identificacion,
          email: createEmployeeDto.email.toLowerCase(),
          telefono: createEmployeeDto.telefono,
          cargo: createEmployeeDto.cargo,
          departamento: createEmployeeDto.departamento,
          fechaIngreso: new Date(createEmployeeDto.fechaIngreso),
          tipoContrato: createEmployeeDto.tipoContrato,
          salario: createEmployeeDto.salario,
          estado: createEmployeeDto.estado,
          direccion: createEmployeeDto.direccion,
          fechaNacimiento: new Date(createEmployeeDto.fechaNacimiento),
          genero: createEmployeeDto.genero,
          estadoCivil: createEmployeeDto.estadoCivil,
          contactoEmergenciaNombre: createEmployeeDto.contactoEmergenciaNombre,
          contactoEmergenciaTelefono: createEmployeeDto.contactoEmergenciaTelefono,
          contactoEmergenciaRelacion: createEmployeeDto.contactoEmergenciaRelacion,
        },
      });

      this.logger.log(`Employee created successfully with ID: ${employee.id}`);
      return employee;
    } catch (error) {
      this.logger.error(`Error creating employee: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un empleado con esos datos unicos');
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
  async findAllEmployees(tenantId: string, query: QueryEmployeesDto) {
    const {
      page = 1,
      limit = 20,
      departamento,
      cargo,
      estado,
      tipoContrato,
      genero,
      estadoCivil,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.EmployeeWhereInput = { tenantId };

    // Filtros exactos (enums)
    if (estado) {
      where.estado = estado;
    }

    if (tipoContrato) {
      where.tipoContrato = tipoContrato;
    }

    if (genero) {
      where.genero = genero;
    }

    if (estadoCivil) {
      where.estadoCivil = estadoCivil;
    }

    // Filtros con busqueda parcial
    if (departamento) {
      where.departamento = { contains: departamento, mode: 'insensitive' };
    }

    if (cargo) {
      where.cargo = { contains: cargo, mode: 'insensitive' };
    }

    // Busqueda general
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { identificacion: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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
      'cargo',
      'departamento',
      'fechaIngreso',
      'salario',
      'estado',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    // Ejecutar consultas en paralelo
    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { vacationRequests: true },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    // Agregar informacion de antiguedad
    const employeesWithInfo = employees.map((employee) => {
      const antiguedadAnos = this.calculateYearsOfService(employee.fechaIngreso);
      return {
        ...employee,
        antiguedadAnos,
        solicitudesVacaciones: employee._count.vacationRequests,
      };
    });

    return {
      data: employeesWithInfo,
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
   * @returns Empleado encontrado con sus solicitudes de vacaciones
   */
  async findOneEmployee(id: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        vacationRequests: {
          orderBy: { fechaSolicitud: 'desc' },
          take: 10, // Ultimas 10 solicitudes
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    const antiguedadAnos = this.calculateYearsOfService(employee.fechaIngreso);
    const vacationBalance = await this.calculateVacationDays(id, tenantId);

    return {
      ...employee,
      antiguedadAnos,
      vacationBalance,
    };
  }

  /**
   * Actualiza un empleado existente
   * @param id - ID del empleado
   * @param tenantId - ID del tenant
   * @param updateEmployeeDto - Datos a actualizar
   * @returns Empleado actualizado
   */
  async updateEmployee(id: string, tenantId: string, updateEmployeeDto: UpdateEmployeeDto) {
    // Verificar que el empleado existe
    const existingEmployee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
    });

    if (!existingEmployee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Si se cambia la identificacion, verificar que no exista
    if (
      updateEmployeeDto.identificacion &&
      updateEmployeeDto.identificacion !== existingEmployee.identificacion
    ) {
      const identExists = await this.prisma.employee.findFirst({
        where: {
          tenantId,
          identificacion: updateEmployeeDto.identificacion,
          id: { not: id },
        },
      });

      if (identExists) {
        throw new ConflictException(
          `Ya existe un empleado con la identificacion ${updateEmployeeDto.identificacion}`,
        );
      }
    }

    // Si se cambia el email, verificar que no exista
    if (updateEmployeeDto.email && updateEmployeeDto.email !== existingEmployee.email) {
      const emailExists = await this.prisma.employee.findFirst({
        where: {
          tenantId,
          email: updateEmployeeDto.email.toLowerCase(),
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new ConflictException(
          `Ya existe un empleado con el email ${updateEmployeeDto.email}`,
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: Prisma.EmployeeUpdateInput = {};

    if (updateEmployeeDto.nombre !== undefined) updateData.nombre = updateEmployeeDto.nombre;
    if (updateEmployeeDto.identificacion !== undefined)
      updateData.identificacion = updateEmployeeDto.identificacion;
    if (updateEmployeeDto.email !== undefined)
      updateData.email = updateEmployeeDto.email.toLowerCase();
    if (updateEmployeeDto.telefono !== undefined) updateData.telefono = updateEmployeeDto.telefono;
    if (updateEmployeeDto.cargo !== undefined) updateData.cargo = updateEmployeeDto.cargo;
    if (updateEmployeeDto.departamento !== undefined)
      updateData.departamento = updateEmployeeDto.departamento;
    if (updateEmployeeDto.fechaIngreso !== undefined)
      updateData.fechaIngreso = new Date(updateEmployeeDto.fechaIngreso);
    if (updateEmployeeDto.tipoContrato !== undefined)
      updateData.tipoContrato = updateEmployeeDto.tipoContrato;
    if (updateEmployeeDto.salario !== undefined) updateData.salario = updateEmployeeDto.salario;
    if (updateEmployeeDto.estado !== undefined) updateData.estado = updateEmployeeDto.estado;
    if (updateEmployeeDto.direccion !== undefined) updateData.direccion = updateEmployeeDto.direccion;
    if (updateEmployeeDto.fechaNacimiento !== undefined)
      updateData.fechaNacimiento = new Date(updateEmployeeDto.fechaNacimiento);
    if (updateEmployeeDto.genero !== undefined) updateData.genero = updateEmployeeDto.genero;
    if (updateEmployeeDto.estadoCivil !== undefined)
      updateData.estadoCivil = updateEmployeeDto.estadoCivil;
    if (updateEmployeeDto.contactoEmergenciaNombre !== undefined)
      updateData.contactoEmergenciaNombre = updateEmployeeDto.contactoEmergenciaNombre;
    if (updateEmployeeDto.contactoEmergenciaTelefono !== undefined)
      updateData.contactoEmergenciaTelefono = updateEmployeeDto.contactoEmergenciaTelefono;
    if (updateEmployeeDto.contactoEmergenciaRelacion !== undefined)
      updateData.contactoEmergenciaRelacion = updateEmployeeDto.contactoEmergenciaRelacion;

    try {
      const updatedEmployee = await this.prisma.employee.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Employee ${id} updated successfully`);
      return updatedEmployee;
    } catch (error) {
      this.logger.error(`Error updating employee ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un empleado
   * @param id - ID del empleado
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async removeEmployee(id: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    await this.prisma.employee.delete({ where: { id } });

    this.logger.log(`Employee ${id} deleted successfully`);

    return {
      message: 'Empleado eliminado exitosamente',
      deletedEmployee: {
        id: employee.id,
        nombre: employee.nombre,
        identificacion: employee.identificacion,
      },
    };
  }

  /**
   * Obtiene empleados por departamento
   * @param tenantId - ID del tenant
   * @param departamento - Nombre del departamento
   * @returns Lista de empleados del departamento
   */
  async getEmployeesByDepartment(tenantId: string, departamento: string) {
    const employees = await this.prisma.employee.findMany({
      where: {
        tenantId,
        departamento: { contains: departamento, mode: 'insensitive' },
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      departamento,
      count: employees.length,
      employees,
    };
  }

  /**
   * Obtiene estadisticas de empleados
   * @param tenantId - ID del tenant
   * @returns Estadisticas completas de empleados
   */
  async getEmployeeStats(tenantId: string): Promise<EmployeeStats> {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId },
    });

    const totalEmpleados = employees.length;

    if (totalEmpleados === 0) {
      return {
        totalEmpleados: 0,
        porEstado: {
          ACTIVO: 0,
          INACTIVO: 0,
          VACACIONES: 0,
          INCAPACIDAD: 0,
        },
        porTipoContrato: {
          INDEFINIDO: 0,
          FIJO: 0,
          PRESTACION: 0,
          PASANTIA: 0,
        },
        porDepartamento: {},
        porGenero: {
          MASCULINO: 0,
          FEMENINO: 0,
          OTRO: 0,
        },
        promedioSalario: 0,
        empleadosRecientes: 0,
        vacacionesPendientes: 0,
      };
    }

    // Contar por estado
    const porEstado: Record<EmployeeStatus, number> = {
      ACTIVO: 0,
      INACTIVO: 0,
      VACACIONES: 0,
      INCAPACIDAD: 0,
    };
    employees.forEach((emp) => porEstado[emp.estado]++);

    // Contar por tipo de contrato
    const porTipoContrato: Record<ContractType, number> = {
      INDEFINIDO: 0,
      FIJO: 0,
      PRESTACION: 0,
      PASANTIA: 0,
    };
    employees.forEach((emp) => porTipoContrato[emp.tipoContrato]++);

    // Contar por departamento
    const porDepartamento: Record<string, number> = {};
    employees.forEach((emp) => {
      porDepartamento[emp.departamento] = (porDepartamento[emp.departamento] || 0) + 1;
    });

    // Contar por genero
    const porGenero: Record<Gender, number> = {
      MASCULINO: 0,
      FEMENINO: 0,
      OTRO: 0,
    };
    employees.forEach((emp) => porGenero[emp.genero]++);

    // Promedio de salario
    const totalSalario = employees.reduce((sum, emp) => sum + emp.salario, 0);
    const promedioSalario = Math.round(totalSalario / totalEmpleados);

    // Empleados ingresados en los ultimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const empleadosRecientes = employees.filter((emp) => emp.fechaIngreso >= thirtyDaysAgo).length;

    // Solicitudes de vacaciones pendientes
    const vacacionesPendientes = await this.prisma.vacationRequest.count({
      where: { tenantId, estado: VacationStatus.PENDIENTE },
    });

    return {
      totalEmpleados,
      porEstado,
      porTipoContrato,
      porDepartamento,
      porGenero,
      promedioSalario,
      empleadosRecientes,
      vacacionesPendientes,
    };
  }

  // =============================================
  // VACACIONES - CRUD
  // =============================================

  /**
   * Crea una nueva solicitud de vacaciones
   * @param tenantId - ID del tenant
   * @param createVacationDto - Datos de la solicitud
   * @returns Solicitud creada
   */
  async createVacationRequest(tenantId: string, createVacationDto: CreateVacationRequestDto) {
    this.logger.log(`Creating vacation request for employee ${createVacationDto.empleadoId}`);

    // Verificar que el empleado existe
    const employee = await this.prisma.employee.findFirst({
      where: { id: createVacationDto.empleadoId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Empleado con ID ${createVacationDto.empleadoId} no encontrado`,
      );
    }

    const fechaInicio = new Date(createVacationDto.fechaInicio);
    const fechaFin = new Date(createVacationDto.fechaFin);

    // Validar que fechaFin >= fechaInicio
    if (fechaFin < fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser igual o posterior a la fecha de inicio',
      );
    }

    // Calcular dias solicitados (incluyendo ambos dias)
    const diasSolicitados = this.calculateDaysBetweenDates(fechaInicio, fechaFin);

    // Verificar que el empleado tenga dias disponibles
    const balance = await this.calculateVacationDays(createVacationDto.empleadoId, tenantId);
    if (diasSolicitados > balance.diasDisponibles) {
      throw new BadRequestException(
        `No tiene suficientes dias de vacaciones disponibles. ` +
          `Dias solicitados: ${diasSolicitados}, Dias disponibles: ${balance.diasDisponibles}`,
      );
    }

    try {
      const vacationRequest = await this.prisma.vacationRequest.create({
        data: {
          tenantId,
          empleadoId: createVacationDto.empleadoId,
          fechaInicio,
          fechaFin,
          diasSolicitados,
          motivo: createVacationDto.motivo,
          estado: VacationStatus.PENDIENTE,
        },
        include: {
          empleado: {
            select: { id: true, nombre: true, cargo: true, departamento: true },
          },
        },
      });

      this.logger.log(`Vacation request created with ID: ${vacationRequest.id}`);
      return vacationRequest;
    } catch (error) {
      this.logger.error(`Error creating vacation request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todas las solicitudes de vacaciones
   * @param tenantId - ID del tenant
   * @param page - Numero de pagina
   * @param limit - Registros por pagina
   * @returns Lista paginada de solicitudes
   */
  async findAllVacationRequests(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.vacationRequest.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { fechaSolicitud: 'desc' },
        include: {
          empleado: {
            select: { id: true, nombre: true, cargo: true, departamento: true },
          },
        },
      }),
      this.prisma.vacationRequest.count({ where: { tenantId } }),
    ]);

    return {
      data: requests,
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
   * Obtiene una solicitud de vacaciones por su ID
   * @param id - ID de la solicitud
   * @param tenantId - ID del tenant
   * @returns Solicitud encontrada
   */
  async findOneVacationRequest(id: string, tenantId: string) {
    const request = await this.prisma.vacationRequest.findFirst({
      where: { id, tenantId },
      include: {
        empleado: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Solicitud de vacaciones con ID ${id} no encontrada`);
    }

    return request;
  }

  /**
   * Actualiza una solicitud de vacaciones (solo si esta PENDIENTE)
   * @param id - ID de la solicitud
   * @param tenantId - ID del tenant
   * @param updateVacationDto - Datos a actualizar
   * @returns Solicitud actualizada
   */
  async updateVacationRequest(
    id: string,
    tenantId: string,
    updateVacationDto: UpdateVacationRequestDto,
  ) {
    const existingRequest = await this.prisma.vacationRequest.findFirst({
      where: { id, tenantId },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Solicitud de vacaciones con ID ${id} no encontrada`);
    }

    // Solo permitir modificaciones si esta en estado PENDIENTE
    if (existingRequest.estado !== VacationStatus.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden modificar solicitudes en estado PENDIENTE',
      );
    }

    const updateData: Prisma.VacationRequestUpdateInput = {};

    let fechaInicio = existingRequest.fechaInicio;
    let fechaFin = existingRequest.fechaFin;

    if (updateVacationDto.fechaInicio !== undefined) {
      fechaInicio = new Date(updateVacationDto.fechaInicio);
      updateData.fechaInicio = fechaInicio;
    }

    if (updateVacationDto.fechaFin !== undefined) {
      fechaFin = new Date(updateVacationDto.fechaFin);
      updateData.fechaFin = fechaFin;
    }

    // Validar fechas si alguna cambio
    if (updateVacationDto.fechaInicio || updateVacationDto.fechaFin) {
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin debe ser igual o posterior a la fecha de inicio',
        );
      }

      // Recalcular dias
      const diasSolicitados = this.calculateDaysBetweenDates(fechaInicio, fechaFin);
      updateData.diasSolicitados = diasSolicitados;

      // Verificar disponibilidad de dias
      const balance = await this.calculateVacationDays(existingRequest.empleadoId, tenantId);
      // Sumar los dias de la solicitud actual ya que se estan recalculando
      const diasDisponiblesAjustados = balance.diasDisponibles + existingRequest.diasSolicitados;

      if (diasSolicitados > diasDisponiblesAjustados) {
        throw new BadRequestException(
          `No tiene suficientes dias de vacaciones disponibles. ` +
            `Dias solicitados: ${diasSolicitados}, Dias disponibles: ${diasDisponiblesAjustados}`,
        );
      }
    }

    if (updateVacationDto.motivo !== undefined) {
      updateData.motivo = updateVacationDto.motivo;
    }

    const updatedRequest = await this.prisma.vacationRequest.update({
      where: { id },
      data: updateData,
      include: {
        empleado: {
          select: { id: true, nombre: true, cargo: true, departamento: true },
        },
      },
    });

    this.logger.log(`Vacation request ${id} updated successfully`);
    return updatedRequest;
  }

  /**
   * Elimina una solicitud de vacaciones (solo si esta PENDIENTE)
   * @param id - ID de la solicitud
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async removeVacationRequest(id: string, tenantId: string) {
    const request = await this.prisma.vacationRequest.findFirst({
      where: { id, tenantId },
    });

    if (!request) {
      throw new NotFoundException(`Solicitud de vacaciones con ID ${id} no encontrada`);
    }

    if (request.estado !== VacationStatus.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden eliminar solicitudes en estado PENDIENTE',
      );
    }

    await this.prisma.vacationRequest.delete({ where: { id } });

    this.logger.log(`Vacation request ${id} deleted successfully`);

    return {
      message: 'Solicitud de vacaciones eliminada exitosamente',
      deletedRequest: {
        id: request.id,
        fechaInicio: request.fechaInicio,
        fechaFin: request.fechaFin,
        diasSolicitados: request.diasSolicitados,
      },
    };
  }

  /**
   * Aprueba o rechaza una solicitud de vacaciones
   * @param id - ID de la solicitud
   * @param tenantId - ID del tenant
   * @param approveDto - Datos de aprobacion/rechazo
   * @returns Solicitud actualizada
   */
  async approveVacationRequest(id: string, tenantId: string, approveDto: ApproveVacationDto) {
    const request = await this.prisma.vacationRequest.findFirst({
      where: { id, tenantId },
      include: { empleado: true },
    });

    if (!request) {
      throw new NotFoundException(`Solicitud de vacaciones con ID ${id} no encontrada`);
    }

    if (request.estado !== VacationStatus.PENDIENTE) {
      throw new BadRequestException(
        `Esta solicitud ya fue ${request.estado === VacationStatus.APROBADA ? 'aprobada' : 'rechazada'}`,
      );
    }

    const nuevoEstado = approveDto.aprobado
      ? VacationStatus.APROBADA
      : VacationStatus.RECHAZADA;

    // Si es rechazo, debe tener motivo
    if (!approveDto.aprobado && !approveDto.motivoRechazo) {
      throw new BadRequestException(
        'Debe proporcionar un motivo al rechazar la solicitud',
      );
    }

    const updatedRequest = await this.prisma.vacationRequest.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        // Podriamos agregar un campo para comentarios si fuera necesario
      },
      include: {
        empleado: {
          select: { id: true, nombre: true, cargo: true, departamento: true },
        },
      },
    });

    const accion = approveDto.aprobado ? 'aprobada' : 'rechazada';
    this.logger.log(`Vacation request ${id} ${accion}`);

    return {
      ...updatedRequest,
      mensaje: `Solicitud de vacaciones ${accion} exitosamente`,
      motivoRechazo: approveDto.aprobado ? undefined : approveDto.motivoRechazo,
      comentarios: approveDto.comentarios,
    };
  }

  /**
   * Obtiene las proximas vacaciones (aprobadas, con fechaInicio futura)
   * @param tenantId - ID del tenant
   * @param days - Numero de dias hacia adelante (default: 30)
   * @returns Lista de proximas vacaciones
   */
  async getUpcomingVacations(tenantId: string, days = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const upcomingVacations = await this.prisma.vacationRequest.findMany({
      where: {
        tenantId,
        estado: VacationStatus.APROBADA,
        fechaInicio: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { fechaInicio: 'asc' },
      include: {
        empleado: {
          select: { id: true, nombre: true, cargo: true, departamento: true },
        },
      },
    });

    return {
      periodo: `Proximos ${days} dias`,
      count: upcomingVacations.length,
      vacaciones: upcomingVacations,
    };
  }

  /**
   * Obtiene las solicitudes pendientes de aprobacion
   * @param tenantId - ID del tenant
   * @returns Lista de solicitudes pendientes
   */
  async getPendingRequests(tenantId: string) {
    const pendingRequests = await this.prisma.vacationRequest.findMany({
      where: {
        tenantId,
        estado: VacationStatus.PENDIENTE,
      },
      orderBy: { fechaSolicitud: 'asc' }, // Mas antiguas primero
      include: {
        empleado: {
          select: { id: true, nombre: true, cargo: true, departamento: true },
        },
      },
    });

    return {
      count: pendingRequests.length,
      solicitudes: pendingRequests,
    };
  }

  /**
   * Calcula los dias de vacaciones acumulados, usados y disponibles
   * @param empleadoId - ID del empleado
   * @param tenantId - ID del tenant
   * @returns Balance de vacaciones
   */
  async calculateVacationDays(empleadoId: string, tenantId: string): Promise<VacationBalance> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: empleadoId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    const anosAntiguedad = this.calculateYearsOfService(employee.fechaIngreso);

    // Dias acumulados: 15 dias por ano trabajado (proporcional)
    const diasAcumulados = Math.floor(anosAntiguedad * this.VACATION_DAYS_PER_YEAR);

    // Dias usados: sumar dias de solicitudes aprobadas
    const solicitudesAprobadas = await this.prisma.vacationRequest.findMany({
      where: {
        empleadoId,
        tenantId,
        estado: VacationStatus.APROBADA,
      },
    });

    const diasUsados = solicitudesAprobadas.reduce(
      (total, req) => total + req.diasSolicitados,
      0,
    );

    // Dias disponibles
    const diasDisponibles = Math.max(0, diasAcumulados - diasUsados);

    return {
      empleadoId: employee.id,
      nombreEmpleado: employee.nombre,
      fechaIngreso: employee.fechaIngreso,
      anosAntiguedad: Math.round(anosAntiguedad * 100) / 100, // 2 decimales
      diasAcumulados,
      diasUsados,
      diasDisponibles,
    };
  }

  // =============================================
  // UTILIDADES PRIVADAS
  // =============================================

  /**
   * Calcula los anos de servicio desde la fecha de ingreso
   * @param fechaIngreso - Fecha de ingreso del empleado
   * @returns Anos de servicio (con decimales)
   */
  private calculateYearsOfService(fechaIngreso: Date): number {
    const now = new Date();
    const diffTime = now.getTime() - fechaIngreso.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, diffYears);
  }

  /**
   * Calcula los dias entre dos fechas (incluyendo ambos extremos)
   * @param fechaInicio - Fecha de inicio
   * @param fechaFin - Fecha de fin
   * @returns Numero de dias
   */
  private calculateDaysBetweenDates(fechaInicio: Date, fechaFin: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    return Math.round(diffTime / oneDay) + 1; // +1 para incluir ambos dias
  }
}
