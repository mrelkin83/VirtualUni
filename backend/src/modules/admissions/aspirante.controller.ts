import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { PublicTenantService, ContextoSitio } from '../public-site/public-tenant.service';
import { AdmissionsService } from './admissions.service';
import {
  ActualizarBorradorDto,
  CrearBorradorDto,
  EnviarDto,
  LeadDto,
  SolicitarEnlaceDto,
} from './dto/admissions.dto';

/**
 * API pública JSON del aspirante (la consume el JS del formulario). Capa
 * delgada sobre AdmissionsService (§2). Tenant SOLO por Host; la sesión del
 * aspirante es una cookie HMAC por correo; nada de cuentas.
 */
@ApiExcludeController()
@Controller('aspirante/api')
@UseGuards(ThrottlerGuard)
export class AspiranteController {
  constructor(
    private readonly tenants: PublicTenantService,
    private readonly servicio: AdmissionsService,
  ) {}

  private async ctx(req: Request): Promise<ContextoSitio> {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) throw new NotFoundException('No encontrado');
    return ctx;
  }

  private sesion(req: Request, tenantId: string): string {
    const email = this.servicio.emailDeSesion(req, tenantId);
    if (!email) throw new UnauthorizedException('Sesión vencida: vuelve a entrar con tu enlace');
    return email;
  }

  @Post('borrador')
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async crearBorrador(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() dto: CrearBorradorDto) {
    const ctx = await this.ctx(req);
    return this.servicio.crearBorrador(
      ctx.tenant.id,
      dto,
      { utm: this.servicio.utmDeCookie(req), ip: this.servicio.ipDe(req) },
      res,
    );
  }

  @Patch('borrador/:code')
  async actualizarBorrador(@Req() req: Request, @Param('code') code: string, @Body() dto: ActualizarBorradorDto) {
    const ctx = await this.ctx(req);
    return this.servicio.actualizarBorrador(ctx.tenant.id, this.sesion(req, ctx.tenant.id), code, dto);
  }

  @Post('borrador/:code/documentos/:requiredDocId')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file'))
  async subirDocumento(
    @Req() req: Request,
    @Param('code') code: string,
    @Param('requiredDocId') requiredDocId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Adjunta el archivo');
    const ctx = await this.ctx(req);
    return this.servicio.subirDocumento(
      ctx.tenant.id,
      this.sesion(req, ctx.tenant.id),
      code,
      requiredDocId,
      file,
    );
  }

  @Post('borrador/:code/enviar')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async enviar(@Req() req: Request, @Param('code') code: string, @Body() dto: EnviarDto) {
    const ctx = await this.ctx(req);
    const base = `${((req.headers['x-forwarded-proto'] as string) || req.protocol).split(',')[0]}://${req.headers.host}`;
    return this.servicio.enviar(
      ctx.tenant.id,
      this.sesion(req, ctx.tenant.id),
      code,
      dto.consent,
      this.servicio.ipDe(req),
      base,
    );
  }

  @Get('mis-solicitudes')
  async misSolicitudes(@Req() req: Request) {
    const ctx = await this.ctx(req);
    return this.servicio.misSolicitudes(ctx.tenant.id, this.sesion(req, ctx.tenant.id));
  }

  @Post('enlace')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async solicitarEnlace(@Req() req: Request, @Body() dto: SolicitarEnlaceDto) {
    const ctx = await this.ctx(req);
    const base = `${((req.headers['x-forwarded-proto'] as string) || req.protocol).split(',')[0]}://${req.headers.host}`;
    return this.servicio.solicitarEnlace(ctx.tenant.id, dto, base);
  }

  /** Su propio documento (visor del aspirante). */
  @Get('documentos/:docId/archivo')
  async miDocumento(@Req() req: Request, @Res() res: Response, @Param('docId') docId: string) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) return res.status(404).type('text/plain').send('No encontrado');
    const email = this.servicio.emailDeSesion(req, ctx.tenant.id);
    if (!email) return res.status(401).type('text/plain').send('Sesión vencida');
    const { stream, mime, nombre } = await this.servicio.streamDocumentoAspirante(ctx.tenant.id, email, docId);
    res.type(mime).setHeader('Content-Disposition', `inline; filename="${nombre.replace(/[^\w.() -]/g, '_')}"`);
    stream.pipe(res);
  }
}

/** POST del formulario clásico de /contacto (sin JS): crea un lead y redirige. */
@ApiExcludeController()
@Controller('contacto')
@UseGuards(ThrottlerGuard)
export class ContactoController {
  constructor(
    private readonly tenants: PublicTenantService,
    private readonly servicio: AdmissionsService,
  ) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async crear(@Req() req: Request, @Res() res: Response, @Body() dto: LeadDto) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) return res.status(404).type('text/plain').send('No encontrado');
    await this.servicio.crearLead(ctx.tenant.id, dto, {
      utm: this.servicio.utmDeCookie(req),
      ip: this.servicio.ipDe(req),
    });
    return res.redirect(303, '/contacto?ok=1');
  }
}
