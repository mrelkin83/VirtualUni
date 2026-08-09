import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import {
  CreateBookDto,
  UpdateBookDto,
  QueryBooksDto,
  CreateLoanDto,
  QueryLoansDto,
  CreateReservationDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('library')
@Controller('library')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // ------------------------------------------------------------------- Libros
  @Post('books')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Registrar un libro' })
  @ApiResponse({ status: 201, description: 'Libro creado' })
  createBook(@Body() dto: CreateBookDto, @CurrentTenant() tenantId: string) {
    return this.libraryService.createBook(tenantId, dto);
  }

  @Get('books')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Catalogo de libros' })
  findAllBooks(@Query() query: QueryBooksDto, @CurrentTenant() tenantId: string) {
    return this.libraryService.findAllBooks(tenantId, query);
  }

  @Get('categories')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Categorias del catalogo' })
  getCategories(@CurrentTenant() tenantId: string) {
    return this.libraryService.getCategories(tenantId);
  }

  @Get('stats')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Estadisticas de la biblioteca' })
  getStats(@CurrentTenant() tenantId: string) {
    return this.libraryService.getStats(tenantId);
  }

  // ---------------------------------------------------------------- Prestamos
  @Get('loans/my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Mis prestamos' })
  findMyLoans(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string) {
    return this.libraryService.findMyLoans(tenantId, userId);
  }

  @Get('loans')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Listar prestamos' })
  findAllLoans(@Query() query: QueryLoansDto, @CurrentTenant() tenantId: string) {
    return this.libraryService.findAllLoans(tenantId, query);
  }

  @Post('loans')
  @Roles('STUDENT', ...STAFF)
  @ApiOperation({
    summary: 'Registrar un prestamo',
    description:
      'Un estudiante solo puede pedir para si mismo; el personal puede indicar el estudiante.',
  })
  createLoan(
    @Body() dto: CreateLoanDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isStaff = role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN';
    return this.libraryService.createLoan(tenantId, dto, userId, isStaff);
  }

  @Post('loans/refresh-overdue')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Marcar como vencidos los prestamos fuera de plazo' })
  refreshOverdue(@CurrentTenant() tenantId: string) {
    return this.libraryService.refreshOverdueLoans(tenantId);
  }

  @Post('loans/:id/return')
  @Roles('STUDENT', ...STAFF)
  @ApiOperation({ summary: 'Devolver un prestamo' })
  returnLoan(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.libraryService.returnLoan(tenantId, id);
  }

  @Post('loans/:id/renew')
  @Roles('STUDENT', ...STAFF)
  @ApiOperation({ summary: 'Renovar un prestamo' })
  renewLoan(
    @Param('id') id: string,
    @Body('dias') dias: number,
    @CurrentTenant() tenantId: string,
  ) {
    return this.libraryService.renewLoan(tenantId, id, dias);
  }

  // ------------------------------------------------------------------ Reservas
  @Get('reservations/my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Mis reservas' })
  findMyReservations(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.libraryService.findMyReservations(tenantId, userId);
  }

  @Get('reservations')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Listar reservas' })
  findAllReservations(@CurrentTenant() tenantId: string) {
    return this.libraryService.findAllReservations(tenantId);
  }

  @Post('reservations')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Reservar un libro' })
  createReservation(
    @Body() dto: CreateReservationDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.libraryService.createReservation(tenantId, dto, userId);
  }

  @Post('reservations/:id/cancel')
  @Roles('STUDENT', ...STAFF)
  @ApiOperation({ summary: 'Cancelar una reserva' })
  cancelReservation(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.libraryService.cancelReservation(tenantId, id);
  }

  // --------------------------------------------------------- Libro individual
  @Get('books/:id')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Obtener un libro' })
  findOneBook(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.libraryService.findOneBook(tenantId, id);
  }

  @Patch('books/:id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar un libro' })
  updateBook(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.libraryService.updateBook(tenantId, id, dto);
  }

  @Delete('books/:id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar un libro' })
  removeBook(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.libraryService.removeBook(tenantId, id);
  }
}
