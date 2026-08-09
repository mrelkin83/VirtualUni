import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { QueryAccountDto } from './dto/query-account.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.TENANT_ADMIN)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Vista del estudiante: sus propias facturas y su resumen financiero.
  @Get('my-invoices')
  @Roles(UserRole.STUDENT)
  findMyInvoices(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.financeService.findMyInvoices(tenantId, userId);
  }

  @Get('my-summary')
  @Roles(UserRole.STUDENT)
  getMyFinancialSummary(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.financeService.getMyFinancialSummary(tenantId, userId);
  }

  // Transactions
  @Post('transactions')
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('email') email: string,
  ) {
    // El creador lo fija el servidor a partir del usuario autenticado: es un
    // dato de auditoria y no debe depender de lo que envie el cliente.
    return this.financeService.createTransaction(
      { ...createTransactionDto, creadoPor: email },
      tenantId,
    );
  }

  @Get('transactions')
  findAllTransactions(
    @Query() query: QueryTransactionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findAllTransactions(query, tenantId);
  }

  @Get('transactions/stats')
  getTransactionStats(@CurrentTenant() tenantId: string) {
    return this.financeService.getStats(tenantId);
  }

  @Get('transactions/:id')
  findOneTransaction(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findOneTransaction(id, tenantId);
  }

  @Patch('transactions/:id')
  updateTransaction(
    @Param('id') id: string,
    @Body() updateTransactionDto: Partial<CreateTransactionDto>,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.updateTransaction(id, updateTransactionDto, tenantId);
  }

  @Delete('transactions/:id')
  removeTransaction(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.removeTransaction(id, tenantId);
  }

  // Accounts
  @Post('accounts')
  createAccount(
    @Body() data: CreateAccountDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.createAccount(data, tenantId);
  }

  @Get('accounts')
  findAllAccounts(
    @Query() query: QueryAccountDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findAllAccounts(query, tenantId);
  }

  @Get('accounts/:id')
  findOneAccount(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findOneAccount(id, tenantId);
  }

  @Patch('accounts/:id')
  updateAccount(
    @Param('id') id: string,
    @Body() data: UpdateAccountDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.updateAccount(id, data, tenantId);
  }

  @Delete('accounts/:id')
  removeAccount(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.removeAccount(id, tenantId);
  }

  // Budgets
  @Post('budgets')
  createBudget(
    @Body() data: CreateBudgetDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.createBudget(data, tenantId);
  }

  @Get('budgets')
  findAllBudgets(
    @Query() query: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findAllBudgets(query, tenantId);
  }

  @Get('budgets/:id')
  findOneBudget(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findOneBudget(id, tenantId);
  }

  @Patch('budgets/:id')
  updateBudget(
    @Param('id') id: string,
    @Body() data: Partial<CreateBudgetDto>,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.updateBudget(id, data, tenantId);
  }

  @Delete('budgets/:id')
  removeBudget(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.removeBudget(id, tenantId);
  }

  // Invoices
  @Post('invoices')
  createInvoice(
    @Body() data: CreateInvoiceDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.createInvoice(data, tenantId);
  }

  @Get('invoices')
  findAllInvoices(
    @Query() query: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findAllInvoices(query, tenantId);
  }

  @Get('invoices/:id')
  findOneInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findOneInvoice(id, tenantId);
  }

  @Patch('invoices/:id')
  updateInvoice(
    @Param('id') id: string,
    @Body() data: Partial<CreateInvoiceDto>,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.updateInvoice(id, data, tenantId);
  }

  @Delete('invoices/:id')
  removeInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.removeInvoice(id, tenantId);
  }

  // Payments
  @Post('payments')
  createPayment(
    @Body() data: CreatePaymentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.createPayment(data, tenantId);
  }

  @Get('payments')
  findAllPayments(
    @Query() query: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findAllPayments(query, tenantId);
  }

  @Get('payments/:id')
  findOnePayment(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.findOnePayment(id, tenantId);
  }

  @Patch('payments/:id')
  updatePayment(
    @Param('id') id: string,
    @Body() data: Partial<CreatePaymentDto>,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.updatePayment(id, data, tenantId);
  }

  @Delete('payments/:id')
  removePayment(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeService.removePayment(id, tenantId);
  }
}
