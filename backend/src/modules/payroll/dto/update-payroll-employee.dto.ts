import { PartialType } from '@nestjs/swagger';
import { CreatePayrollEmployeeDto } from './create-payroll-employee.dto';

/**
 * DTO para la actualizacion de un empleado existente en nomina
 * Hereda todas las propiedades de CreatePayrollEmployeeDto como opcionales
 */
export class UpdatePayrollEmployeeDto extends PartialType(CreatePayrollEmployeeDto) {}
