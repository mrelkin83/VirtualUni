import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { AdmissionCall, AdmissionRequiredDocument, ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PublicCatalogService } from '../public-site/public-catalog.service';
import { MailService } from './mail.service';
import { ArchivosAdmisionService } from './archivos.service';
import {
  ActualizarBorradorDto,
  CrearBorradorDto,
  LeadDto,
  PedirCorreccionDto,
  RevisarDocumentoDto,
  SolicitarEnlaceDto,
} from './dto/admissions.dto';

type CallConDocs = AdmissionCall & {
  requiredDocuments: AdmissionRequiredDocument[];
  program: { id: string; name: string; slug: string | null; educationLevel: string };
};

/** Estados que ocupan cupo (BORRADOR no; los terminales negativos tampoco). */
const OCUPAN_CUPO: ApplicationStatus[] = [
  'ENVIADA', 'PAGO_PENDIENTE', 'PAGO_EN_VERIFICACION', 'PAGADA',
  'EN_REVISION', 'DOCUMENTOS_INCOMPLETOS', 'ADMITIDA', 'MATRICULADA',
];

/**
 * Jerarquía de escolaridad para minEducation. Se compara por palabra clave
 * contenida, en minúsculas: "9° aprobado" y "Noveno aprobado" caen en el
 * mismo escalón.
 */
const ESCALONES: { clave: RegExp; nivel: number }[] = [
  { clave: /primaria/, nivel: 1 },
  { clave: /9|noveno|secundaria/, nivel: 2 },
  { clave: /bachiller|media|11/, nivel: 3 },
  { clave: /t[eé]cnico/, nivel: 4 },
  { clave: /tecn[oó]logo/, nivel: 5 },
  { clave: /profesional|pregrado|universitario/, nivel: 6 },
  { clave: /especialista|posgrado|maestr[ií]a|doctor/, nivel: 7 },
];

function escalon(texto?: string | null): number | null {
  if (!texto) return null;
  const t = texto.toLowerCase();
  // De mayor a menor: "técnico profesional" debe caer en técnico (4), no en
  // profesional (6)… al revés: el escalón más ALTO que matchee gana, salvo
  // que el texto empiece por el término más específico. Práctico: primera
  // coincidencia recorriendo de arriba (específico) hacia abajo.
  for (const e of [...ESCALONES].reverse()) {
    if (e.clave.test(t)) return e.nivel;
  }
  return null;
}

const edad = (nacimiento: Date): number => {
  const hoy = new Date();
  let a = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) a--;
  return a;
};

@Injectable()
export class AdmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogo: PublicCatalogService,
    private readonly mail: MailService,
    private readonly archivos: ArchivosAdmisionService,
  ) {}

  // ============================================================ sesión
  // Cookie del aspirante: HMAC(tenantId|email|exp). La llave de la sesión es
  // el CORREO dentro del tenant: así un acudiente con dos hijos inscritos ve
  // las dos solicitudes con un solo acceso (§12).

  private secreto(): string {
    return process.env.JWT_SECRET || 'dev-secret';
  }

  private firmarSesion(tenantId: string, email: string, expMs: number): string {
    const base = `${tenantId}|${email.toLowerCase()}|${expMs}`;
    const firma = createHmac('sha256', this.secreto()).update(base).digest('base64url');
    return `${expMs}.${Buffer.from(email.toLowerCase()).toString('base64url')}.${firma}`;
  }

  abrirSesion(res: Response, tenantId: string, email: string) {
    const exp = Date.now() + 24 * 3600_000;
    res.cookie('vu_asp', this.firmarSesion(tenantId, email, exp), {
      maxAge: 24 * 3600_000,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  emailDeSesion(req: Request, tenantId: string): string | null {
    const crudo = /(?:^|;\s*)vu_asp=([^;]+)/.exec(req.headers.cookie || '')?.[1];
    if (!crudo) return null;
    const [expStr, emailB64, firma] = decodeURIComponent(crudo).split('.');
    const exp = Number(expStr);
    if (!exp || exp < Date.now() || !emailB64 || !firma) return null;
    let email: string;
    try {
      email = Buffer.from(emailB64, 'base64url').toString('utf8');
    } catch {
      return null;
    }
    const esperado = this.firmarSesion(tenantId, email, exp).split('.')[2];
    const a = Buffer.from(firma);
    const b = Buffer.from(esperado);
    return a.length === b.length && timingSafeEqual(a, b) ? email.toLowerCase() : null;
  }

  // ========================================================= antispam

  /** Honeypot lleno o formulario "llenado" en menos de 4 segundos → fuera. */
  verificarAntispam(dto: { web?: string; _t?: string }) {
    if (dto.web) throw new BadRequestException('Solicitud rechazada');
    const t = Number(dto._t);
    if (t && Date.now() - t < 4000) {
      throw new BadRequestException('Formulario enviado demasiado rápido, inténtalo de nuevo');
    }
  }

  // ===================================================== convocatoria

  async convocatoriaPorSlug(tenantId: string, slug: string): Promise<CallConDocs> {
    const call = await this.prisma.admissionCall.findFirst({
      where: { tenantId, slug },
      include: {
        requiredDocuments: true,
        program: { select: { id: true, name: true, slug: true, educationLevel: true } },
      },
    });
    if (!call) throw new NotFoundException('Convocatoria no encontrada');
    return call as CallConDocs;
  }

  private asegurarAbierta(call: AdmissionCall) {
    if (!this.catalogo.llamadaAbierta(call)) {
      throw new BadRequestException('La convocatoria no está abierta');
    }
  }

  private async asegurarCupo(call: CallConDocs, targetLevel?: number) {
    const niveles = (call.targetLevels as { level: number; label: string; capacity?: number }[] | null) ?? null;

    if (niveles && niveles.length) {
      // Colegio: el cupo se controla POR GRADO (§0.1), no por el total.
      if (targetLevel === undefined || targetLevel === null) {
        throw new BadRequestException('Indica el grado al que aspira');
      }
      const grado = niveles.find((n) => n.level === targetLevel);
      if (!grado) throw new BadRequestException('Esa convocatoria no ofrece ese grado');
      if (grado.capacity) {
        const ocupados = await this.prisma.application.count({
          where: { tenantId: call.tenantId, callId: call.id, targetLevel, status: { in: OCUPAN_CUPO } },
        });
        if (ocupados >= grado.capacity) {
          throw new ConflictException(`No hay cupo disponible para ${grado.label}`);
        }
      }
      return;
    }

    if (call.capacity) {
      const ocupados = await this.prisma.application.count({
        where: { tenantId: call.tenantId, callId: call.id, status: { in: OCUPAN_CUPO } },
      });
      if (ocupados >= call.capacity) throw new ConflictException('La convocatoria ya no tiene cupo');
    }
  }

  private validarRequisitos(call: CallConDocs, dto: CrearBorradorDto) {
    const esColegio = !!(call.targetLevels as unknown[] | null)?.length;

    if (dto.birthDate) {
      const anios = edad(new Date(dto.birthDate));
      if (call.minAge && anios < call.minAge) {
        throw new BadRequestException(
          `Este programa pide mínimo ${call.minAge} años; según la fecha de nacimiento tiene ${anios}`,
        );
      }
      if (call.maxAge && anios > call.maxAge) {
        throw new BadRequestException(`Este programa admite hasta ${call.maxAge} años`);
      }
    } else if (call.minAge) {
      throw new BadRequestException('Indica la fecha de nacimiento');
    }

    if (call.minEducation) {
      const requerido = escalon(call.minEducation);
      const tiene = escalon(dto.previousEducation);
      if (requerido !== null) {
        if (tiene === null) {
          throw new BadRequestException(
            `Indica tu último nivel de estudios: este programa pide ${call.minEducation}`,
          );
        }
        if (tiene < requerido) {
          throw new BadRequestException(
            `Este programa pide ${call.minEducation}; no es posible continuar con "${dto.previousEducation}"`,
          );
        }
      }
    }

    const esMenor = dto.birthDate ? edad(new Date(dto.birthDate)) < 18 : false;
    if ((esMenor || esColegio) && !dto.guardian) {
      throw new BadRequestException('Para un menor de edad se requieren los datos del acudiente');
    }
    if ((esMenor || esColegio) && !dto.guardianConsent) {
      throw new BadRequestException('Falta la autorización del acudiente');
    }
  }

  // ========================================================== borrador

  private async generarCode(tenantId: string): Promise<string> {
    const anio = new Date().getFullYear();
    for (let intento = 0; intento < 5; intento++) {
      const n = (await this.prisma.application.count({ where: { tenantId } })) + 1 + intento;
      const code = `INS-${anio}-${String(n).padStart(6, '0')}`;
      const choca = await this.prisma.application.findFirst({
        where: { tenantId, code },
        select: { id: true },
      });
      if (!choca) return code;
    }
    return `INS-${anio}-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async crearBorrador(
    tenantId: string,
    dto: CrearBorradorDto,
    contexto: { utm?: Record<string, string> | null; ip: string },
    res: Response,
  ) {
    this.verificarAntispam(dto);
    const call = await this.convocatoriaPorSlug(tenantId, dto.callSlug);
    this.asegurarAbierta(call);
    this.validarRequisitos(call, dto);
    await this.asegurarCupo(call, dto.targetLevel);

    const email = dto.email.toLowerCase();

    const applicant = await this.prisma.applicant.upsert({
      where: {
        tenantId_documentType_documentNumber: {
          tenantId,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
        },
      },
      update: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        phone: dto.phone,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        city: dto.city,
        previousEducation: dto.previousEducation,
        guardian: (dto.guardian as unknown as Prisma.InputJsonValue) ?? undefined,
        guardianConsent: dto.guardianConsent ?? undefined,
      },
      create: {
        tenantId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        phone: dto.phone,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        city: dto.city,
        previousEducation: dto.previousEducation,
        guardian: (dto.guardian as unknown as Prisma.InputJsonValue) ?? undefined,
        guardianConsent: dto.guardianConsent ?? false,
        // El consentimiento REAL (fecha/IP/versión definitivas) se fija al
        // ENVIAR; esto registra la creación del borrador.
        consentAt: new Date(),
        consentIp: contexto.ip,
        consentVersion: 'borrador',
        utm: (contexto.utm as Prisma.InputJsonValue) ?? undefined,
      },
    });

    // UTM first-touch: si el aspirante ya existía sin campaña, se conserva la nueva.
    if (contexto.utm && !applicant.utm) {
      await this.prisma.applicant.update({
        where: { id: applicant.id },
        data: { utm: contexto.utm as Prisma.InputJsonValue },
      });
    }

    const existente = await this.prisma.application.findUnique({
      where: { applicantId_callId: { applicantId: applicant.id, callId: call.id } },
      select: { id: true, code: true, status: true },
    });

    if (existente) {
      if (existente.status === 'BORRADOR' || existente.status === 'DOCUMENTOS_INCOMPLETOS') {
        // Retoma el borrador: mismos code y documentos ya subidos.
        if (dto.targetLevel !== undefined) {
          await this.prisma.application.update({
            where: { id: existente.id },
            data: { targetLevel: dto.targetLevel, submittedByGuardian: dto.submittedByGuardian ?? false },
          });
        }
        this.abrirSesion(res, tenantId, email);
        return this.estadoBorrador(tenantId, existente.code);
      }
      throw new ConflictException(
        `Ya tienes una solicitud (${existente.code}) para esta convocatoria; consúltala en "Estado de tu solicitud"`,
      );
    }

    const app = await this.prisma.application.create({
      data: {
        tenantId,
        applicantId: applicant.id,
        callId: call.id,
        targetLevel: dto.targetLevel,
        submittedByGuardian: dto.submittedByGuardian ?? !!dto.guardian,
        code: await this.generarCode(tenantId),
        status: 'BORRADOR',
      },
    });
    await this.evento(tenantId, app.id, 'created', null, { callSlug: call.slug });

    this.abrirSesion(res, tenantId, email);
    return this.estadoBorrador(tenantId, app.code);
  }

  /** Vista del borrador para el asistente por pasos. */
  async estadoBorrador(tenantId: string, code: string) {
    const app = await this.prisma.application.findFirst({
      where: { tenantId, code },
      include: {
        applicant: true,
        call: { include: { requiredDocuments: true, program: { select: { name: true, slug: true } } } },
        documents: true,
      },
    });
    if (!app || !app.call) throw new NotFoundException('Solicitud no encontrada');
    return {
      code: app.code,
      status: app.status,
      targetLevel: app.targetLevel,
      programa: app.call.program.name,
      applicationFee: app.call.applicationFee,
      requiredDocuments: app.call.requiredDocuments.map((d) => {
        const subido = app.documents.find((x) => x.requiredDocId === d.id);
        return {
          id: d.id,
          name: d.name,
          required: d.required,
          acceptTypes: d.acceptTypes,
          maxSizeMb: d.maxSizeMb,
          subido: !!subido,
          estado: subido?.status ?? null,
          reviewNote: subido?.reviewNote ?? null,
        };
      }),
    };
  }

  private async appDeSesion(tenantId: string, email: string, code: string) {
    const app = await this.prisma.application.findFirst({
      where: { tenantId, code },
      include: {
        applicant: true,
        call: { include: { requiredDocuments: true, program: { select: { name: true, slug: true } } } },
        documents: true,
      },
    });
    if (!app || app.applicant.email.toLowerCase() !== email) {
      // Mismo mensaje exista o no: sin enumeración de códigos (§8).
      throw new NotFoundException('Solicitud no encontrada');
    }
    return app;
  }

  async actualizarBorrador(tenantId: string, email: string, code: string, dto: ActualizarBorradorDto) {
    const app = await this.appDeSesion(tenantId, email, code);
    if (app.status !== 'BORRADOR' && app.status !== 'DOCUMENTOS_INCOMPLETOS') {
      throw new BadRequestException('La solicitud ya fue enviada');
    }
    await this.prisma.applicant.update({
      where: { id: app.applicantId },
      data: {
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        city: dto.city,
        previousEducation: dto.previousEducation,
        guardian: (dto.guardian as unknown as Prisma.InputJsonValue) ?? undefined,
        guardianConsent: dto.guardianConsent ?? undefined,
      },
    });
    return this.estadoBorrador(tenantId, code);
  }

  async subirDocumento(
    tenantId: string,
    email: string,
    code: string,
    requiredDocId: string,
    archivo: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    const app = await this.appDeSesion(tenantId, email, code);
    if (!['BORRADOR', 'DOCUMENTOS_INCOMPLETOS', 'ENVIADA', 'PAGO_PENDIENTE'].includes(app.status)) {
      throw new BadRequestException('La solicitud no admite cambios de documentos');
    }
    const regla = app.call?.requiredDocuments.find((d) => d.id === requiredDocId);
    if (!regla) throw new NotFoundException('Documento requerido no encontrado');

    const { fileKey, sizeKb } = await this.archivos.guardarValido(tenantId, app.id, archivo, regla);

    // Re-subir reemplaza el anterior del mismo requisito (queda PENDIENTE).
    await this.prisma.applicationDocument.deleteMany({
      where: { applicationId: app.id, requiredDocId },
    });
    await this.prisma.applicationDocument.create({
      data: {
        tenantId,
        applicationId: app.id,
        requiredDocId,
        fileKey,
        originalName: archivo.originalname.slice(0, 180),
        mimeType: archivo.mimetype,
        sizeKb,
      },
    });
    await this.evento(tenantId, app.id, 'doc_uploaded', null, { requisito: regla.name });

    // Si estaba en corrección y ya no quedan rechazados: vuelve a revisión…
    // salvo que la inscripción tenga valor y aún no esté pagada, en cuyo caso
    // el siguiente paso del aspirante es el PAGO, no esperar al revisor.
    if (app.status === 'DOCUMENTOS_INCOMPLETOS') {
      const rechazados = await this.prisma.applicationDocument.count({
        where: { applicationId: app.id, status: 'RECHAZADO' },
      });
      if (rechazados === 0) {
        const fee = app.call?.applicationFee ?? 0;
        const siguiente: ApplicationStatus = fee > 0 && !app.paidAt ? 'PAGO_PENDIENTE' : 'EN_REVISION';
        await this.cambiarEstado(tenantId, app.id, siguiente, null, 'docs_resubmitted');
      }
    }

    return this.estadoBorrador(tenantId, code);
  }

  async enviar(tenantId: string, email: string, code: string, consent: boolean, ip: string, baseUrl: string) {
    if (!consent) {
      throw new BadRequestException('Debes autorizar el tratamiento de datos para enviar la solicitud');
    }
    const app = await this.appDeSesion(tenantId, email, code);
    if (app.status !== 'BORRADOR') throw new BadRequestException('La solicitud ya fue enviada');
    const call = app.call as NonNullable<typeof app.call>;
    this.asegurarAbierta(call);
    await this.asegurarCupo(call as unknown as CallConDocs, app.targetLevel ?? undefined);

    const faltantes = call.requiredDocuments
      .filter((d) => d.required)
      .filter((d) => !app.documents.some((x) => x.requiredDocId === d.id));
    if (faltantes.length) {
      throw new BadRequestException(`Faltan documentos: ${faltantes.map((d) => d.name).join(', ')}`);
    }

    const site = await this.prisma.tenantSite.findUnique({
      where: { tenantId },
      select: { privacyVersion: true },
    });
    await this.prisma.applicant.update({
      where: { id: app.applicantId },
      data: { consentAt: new Date(), consentIp: ip, consentVersion: site?.privacyVersion ?? '1' },
    });

    const nuevo: ApplicationStatus = call.applicationFee > 0 ? 'PAGO_PENDIENTE' : 'ENVIADA';
    await this.prisma.application.update({
      where: { id: app.id },
      data: { status: nuevo, submittedAt: new Date() },
    });
    await this.evento(tenantId, app.id, 'submitted', null, { fee: call.applicationFee });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    const enlace = await this.generarEnlace(app.id);
    await this.mail.confirmacionEnvio({
      para: app.applicant.email,
      institucion: tenant?.name ?? '',
      nombre: app.applicant.firstName,
      code: app.code,
      programa: (app.call?.program.name as string) ?? '',
      enlaceAcceso: `${baseUrl}/aspirante/acceso?token=${enlace}`,
      requierePago: nuevo === 'PAGO_PENDIENTE',
    });

    return { code: app.code, status: nuevo, applicationFee: call.applicationFee };
  }

  // ====================================================== enlace mágico

  /** Token de un solo uso, 30 minutos: `${applicationId}.${secreto}`; se guarda solo el hash. */
  private async generarEnlace(applicationId: string): Promise<string> {
    const secreto = randomBytes(24).toString('base64url');
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        accessTokenHash: createHash('sha256').update(secreto).digest('hex'),
        accessTokenExpiresAt: new Date(Date.now() + 30 * 60_000),
      },
    });
    return `${applicationId}.${secreto}`;
  }

  async solicitarEnlace(tenantId: string, dto: SolicitarEnlaceDto, baseUrl: string) {
    this.verificarAntispam(dto);
    const generica = {
      message: 'Si los datos coinciden con una solicitud, te enviamos un enlace de acceso al correo.',
    };
    const applicant = await this.prisma.applicant.findFirst({
      where: { tenantId, documentNumber: dto.documentNumber, email: dto.email.toLowerCase() },
      include: { applications: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true } } },
    });
    const app = applicant?.applications[0];
    if (!applicant || !app) return generica; // misma respuesta: sin enumeración

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    const token = await this.generarEnlace(app.id);
    await this.mail.enlaceAcceso({
      para: applicant.email,
      institucion: tenant?.name ?? '',
      enlace: `${baseUrl}/aspirante/acceso?token=${token}`,
    });
    return generica;
  }

  /** Canjea el enlace: de un solo uso (el hash se borra al entrar). */
  async canjearEnlace(tenantId: string, token: string, res: Response): Promise<boolean> {
    const [id, secreto] = token.split('.');
    if (!id || !secreto) return false;
    const app = await this.prisma.application.findFirst({
      where: { tenantId, id, accessTokenHash: { not: null }, accessTokenExpiresAt: { gt: new Date() } },
      include: { applicant: { select: { email: true } } },
    });
    if (!app) return false;
    const hash = createHash('sha256').update(secreto).digest('hex');
    const a = Buffer.from(hash);
    const b = Buffer.from(app.accessTokenHash as string);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

    await this.prisma.application.update({
      where: { id: app.id },
      data: { accessTokenHash: null, accessTokenExpiresAt: null },
    });
    this.abrirSesion(res, tenantId, app.applicant.email);
    return true;
  }

  /** Todas las solicitudes del correo de la sesión (un acudiente ve a sus dos hijos). */
  async misSolicitudes(tenantId: string, email: string) {
    const site = await this.prisma.tenantSite.findUnique({
      where: { tenantId },
      select: { paymentInstructions: true },
    });
    const wompi = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
      select: { active: true, publicKey: true, integrityKeyEnc: true, eventsKeyEnc: true },
    });
    const pagoEnLinea = !!(wompi?.active && wompi.publicKey && wompi.integrityKeyEnc && wompi.eventsKeyEnc);
    const apps = await this.prisma.application.findMany({
      where: { tenantId, applicant: { email }, status: { not: 'INTERESADO' } },
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: { select: { firstName: true, lastName: true } },
        call: { include: { requiredDocuments: true, program: { select: { name: true, slug: true } } } },
        documents: true,
      },
    });
    return apps.map((app) => ({
      code: app.code,
      status: app.status,
      aspirante: `${app.applicant.firstName} ${app.applicant.lastName}`,
      programa: app.call?.program.name ?? null,
      programaSlug: app.call?.program.slug ?? null,
      targetLevel: app.targetLevel,
      applicationFee: app.call?.applicationFee ?? 0,
      // Pago manual: instrucciones de la institución y si ya hay comprobante.
      paymentInstructions:
        app.status === 'PAGO_PENDIENTE' || app.status === 'PAGO_EN_VERIFICACION'
          ? site?.paymentInstructions ?? null
          : null,
      comprobanteSubido: app.documents.some((d) => d.requiredDocId === null),
      pagoEnLinea: pagoEnLinea && app.status === 'PAGO_PENDIENTE',
      submittedAt: app.submittedAt,
      documentos: (app.call?.requiredDocuments ?? []).map((d) => {
        const subido = app.documents.find((x) => x.requiredDocId === d.id);
        return {
          id: d.id,
          name: d.name,
          required: d.required,
          estado: subido?.status ?? (subido ? 'PENDIENTE' : null),
          reviewNote: subido?.reviewNote ?? null,
        };
      }),
    }));
  }

  // ============================================================= leads

  /** Contacto / POST leads: aspirante INTERESADO sin convocatoria. */
  async crearLead(
    tenantId: string,
    dto: LeadDto,
    contexto: { utm?: Record<string, string> | null; ip: string },
  ) {
    this.verificarAntispam(dto);
    if (!dto.acepta) {
      throw new BadRequestException('Debes autorizar el tratamiento de datos');
    }
    const email = dto.email.toLowerCase();
    const [firstName, ...resto] = dto.nombre.trim().split(/\s+/);

    // Un lead no trae documento: se registra con el correo como identificador
    // (documentType SIN_DOCUMENTO). Si luego se inscribe de verdad, su
    // documento real crea/actualiza el registro completo.
    const applicant = await this.prisma.applicant.upsert({
      where: {
        tenantId_documentType_documentNumber: {
          tenantId,
          documentType: 'SIN_DOCUMENTO',
          documentNumber: email.slice(0, 20).replace(/[^A-Za-z0-9-]/g, '-'),
        },
      },
      update: { phone: dto.telefono, firstName, lastName: resto.join(' ') || '-' },
      create: {
        tenantId,
        documentType: 'SIN_DOCUMENTO',
        documentNumber: email.slice(0, 20).replace(/[^A-Za-z0-9-]/g, '-'),
        firstName,
        lastName: resto.join(' ') || '-',
        email,
        phone: dto.telefono,
        consentAt: new Date(),
        consentIp: contexto.ip,
        consentVersion: 'contacto',
        utm: (contexto.utm as Prisma.InputJsonValue) ?? undefined,
      },
    });

    const app = await this.prisma.application.create({
      data: {
        tenantId,
        applicantId: applicant.id,
        code: await this.generarCode(tenantId),
        status: 'INTERESADO',
      },
    });
    await this.evento(tenantId, app.id, 'lead', null, { mensaje: dto.mensaje?.slice(0, 500) });
    return { ok: true };
  }

  // ======================================================= lado admin

  async listar(tenantId: string, filtros: {
    callId?: string; status?: string; desde?: string; hasta?: string; utmSource?: string; q?: string;
  }) {
    const where: Prisma.ApplicationWhereInput = { tenantId };
    if (filtros.callId) where.callId = filtros.callId;
    if (filtros.status) where.status = filtros.status as ApplicationStatus;
    if (filtros.desde || filtros.hasta) {
      where.createdAt = {
        ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
        ...(filtros.hasta ? { lte: new Date(filtros.hasta + 'T23:59:59') } : {}),
      };
    }
    if (filtros.q) {
      where.applicant = {
        OR: [
          { firstName: { contains: filtros.q, mode: 'insensitive' } },
          { lastName: { contains: filtros.q, mode: 'insensitive' } },
          { documentNumber: { contains: filtros.q } },
          { email: { contains: filtros.q, mode: 'insensitive' } },
        ],
      };
    }
    if (filtros.utmSource) {
      where.applicant = {
        ...(where.applicant as object),
        utm: { path: ['utm_source'], equals: filtros.utmSource },
      };
    }

    const apps = await this.prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        applicant: { select: { firstName: true, lastName: true, documentType: true, documentNumber: true, email: true, phone: true, utm: true } },
        call: { select: { name: true, slug: true, program: { select: { name: true } } } },
        _count: { select: { documents: true } },
      },
    });
    return apps;
  }

  async detalle(tenantId: string, id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, tenantId },
      include: {
        applicant: true,
        call: { include: { requiredDocuments: true, program: { select: { name: true } } } },
        documents: { include: { requiredDoc: { select: { name: true } } } },
        events: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    return app;
  }

  async revisarDocumento(tenantId: string, docId: string, dto: RevisarDocumentoDto, reviewerId: string, baseUrl: string) {
    const doc = await this.prisma.applicationDocument.findFirst({
      where: { id: docId, tenantId },
      include: {
        application: { include: { applicant: true, call: { select: { applicationFee: true } } } },
        requiredDoc: { select: { name: true } },
      },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    await this.prisma.applicationDocument.update({
      where: { id: doc.id },
      data: { status: dto.status, reviewNote: dto.reviewNote },
    });
    await this.evento(tenantId, doc.applicationId, dto.status === 'APROBADO' ? 'doc_approved' : 'doc_rejected', reviewerId, {
      requisito: doc.requiredDoc?.name,
      nota: dto.reviewNote,
    });

    const app = doc.application;
    if (dto.status === 'RECHAZADO') {
      await this.cambiarEstado(tenantId, app.id, 'DOCUMENTOS_INCOMPLETOS', reviewerId, null);
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
      const token = await this.generarEnlace(app.id);
      await this.mail.correccionSolicitada({
        para: app.applicant.email,
        institucion: tenant?.name ?? '',
        nombre: app.applicant.firstName,
        code: app.code,
        nota: `${doc.requiredDoc?.name ?? 'Documento'}: ${dto.reviewNote ?? 'revisar el archivo adjunto'}`,
        enlaceAcceso: `${baseUrl}/aspirante/acceso?token=${token}`,
      });
    } else if (['ENVIADA', 'PAGADA', 'EN_REVISION', 'DOCUMENTOS_INCOMPLETOS'].includes(app.status)) {
      const pendientes = await this.prisma.applicationDocument.count({
        where: { applicationId: app.id, requiredDocId: { not: null }, status: { not: 'APROBADO' } },
      });
      if (pendientes === 0) {
        const fee = (doc.application as { call?: { applicationFee?: number } | null }).call?.applicationFee ?? 0;
        const siguiente: ApplicationStatus = fee > 0 && !app.paidAt ? 'PAGO_PENDIENTE' : 'EN_REVISION';
        await this.cambiarEstado(tenantId, app.id, siguiente, reviewerId, 'docs_complete');
      }
    }
    return this.detalle(tenantId, app.id);
  }

  async pedirCorreccion(tenantId: string, id: string, dto: PedirCorreccionDto, reviewerId: string, baseUrl: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, tenantId },
      include: { applicant: true },
    });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    await this.cambiarEstado(tenantId, app.id, 'DOCUMENTOS_INCOMPLETOS', reviewerId, 'correction_requested', { nota: dto.nota });
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    const token = await this.generarEnlace(app.id);
    await this.mail.correccionSolicitada({
      para: app.applicant.email,
      institucion: tenant?.name ?? '',
      nombre: app.applicant.firstName,
      code: app.code,
      nota: dto.nota,
      enlaceAcceso: `${baseUrl}/aspirante/acceso?token=${token}`,
    });
    return this.detalle(tenantId, app.id);
  }

  /** Descarga de un documento por el ADMIN del mismo tenant. */
  async streamDocumento(tenantId: string, docId: string) {
    const doc = await this.prisma.applicationDocument.findFirst({
      where: { id: docId, tenantId },
      select: { fileKey: true, originalName: true },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return { ...this.archivos.stream(doc.fileKey), nombre: doc.originalName };
  }

  /** Descarga de SU PROPIO documento por el aspirante con sesión. */
  async streamDocumentoAspirante(tenantId: string, email: string, docId: string) {
    const doc = await this.prisma.applicationDocument.findFirst({
      where: { id: docId, tenantId, application: { applicant: { email } } },
      select: { fileKey: true, originalName: true },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return { ...this.archivos.stream(doc.fileKey), nombre: doc.originalName };
  }

  async convocatoriasDelTenant(tenantId: string) {
    return this.prisma.admissionCall.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, status: true, program: { select: { name: true } } },
    });
  }

  // ======================================== CRUD de convocatorias (Fase 4)

  /** Listado para el admin con cupo usado/total. */
  async convocatoriasDetallado(tenantId: string) {
    const calls = await this.prisma.admissionCall.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        program: { select: { id: true, name: true } },
        academicPeriod: { select: { id: true, code: true } },
        studyPlan: { select: { id: true, version: true } },
        requiredDocuments: true,
        _count: { select: { applications: true } },
      },
    });
    const conCupo = [] as ((typeof calls)[number] & { cupoUsado: number; abierta: boolean })[];
    for (const c of calls) {
      const cupoUsado = await this.prisma.application.count({
        where: { tenantId, callId: c.id, status: { in: OCUPAN_CUPO } },
      });
      conCupo.push({ ...c, cupoUsado, abierta: this.catalogo.llamadaAbierta(c) });
    }
    return conCupo;
  }

  private async validarReferenciasConvocatoria(tenantId: string, dto: {
    programId?: string; academicPeriodId?: string; studyPlanId?: string;
  }) {
    // Ids del cliente: cada uno contra el tenant ANTES de usarse.
    if (dto.programId) {
      const p = await this.prisma.program.findFirst({ where: { id: dto.programId, tenantId }, select: { id: true } });
      if (!p) throw new BadRequestException('El programa no pertenece a la institución');
    }
    if (dto.academicPeriodId) {
      const per = await this.prisma.academicPeriod.findFirst({ where: { id: dto.academicPeriodId, tenantId }, select: { id: true } });
      if (!per) throw new BadRequestException('El periodo no pertenece a la institución');
    }
    if (dto.studyPlanId) {
      const plan = await this.prisma.studyPlan.findFirst({
        where: { id: dto.studyPlanId, tenantId, ...(dto.programId ? { programId: dto.programId } : {}) },
        select: { id: true },
      });
      if (!plan) throw new BadRequestException('El pensum no pertenece al programa de la institución');
    }
  }

  async crearConvocatoria(tenantId: string, dto: {
    programId: string; academicPeriodId: string; studyPlanId: string;
    name: string; slug: string; opensAt: string; closesAt?: string | null;
    rolling?: boolean; startsAt?: string | null; capacity?: number | null;
    schedule?: string | null; modality?: string | null; applicationFee?: number;
    minAge?: number | null; maxAge?: number | null; minEducation?: string | null;
    targetLevels?: { level: number; label: string; capacity?: number }[] | null;
    documentos?: { name: string; required?: boolean }[];
  }) {
    await this.validarReferenciasConvocatoria(tenantId, dto);
    if (!dto.rolling && !dto.closesAt) {
      throw new BadRequestException('Una convocatoria no permanente necesita fecha de cierre');
    }
    const choca = await this.prisma.admissionCall.findFirst({
      where: { tenantId, slug: dto.slug },
      select: { id: true },
    });
    if (choca) throw new ConflictException('Ya existe una convocatoria con ese slug');

    const call = await this.prisma.admissionCall.create({
      data: {
        tenantId,
        programId: dto.programId,
        academicPeriodId: dto.academicPeriodId,
        studyPlanId: dto.studyPlanId,
        name: dto.name,
        slug: dto.slug,
        opensAt: new Date(dto.opensAt),
        closesAt: dto.closesAt ? new Date(dto.closesAt) : null,
        rolling: dto.rolling ?? false,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        capacity: dto.capacity ?? null,
        schedule: dto.schedule ?? null,
        modality: (dto.modality as never) ?? null,
        applicationFee: dto.applicationFee ?? 0,
        paymentMethods: (dto.applicationFee ?? 0) > 0 ? ['MANUAL'] : [],
        minAge: dto.minAge ?? null,
        maxAge: dto.maxAge ?? null,
        minEducation: dto.minEducation ?? null,
        targetLevels: (dto.targetLevels as Prisma.InputJsonValue) ?? undefined,
        requiredDocuments: {
          create: (dto.documentos ?? []).map((d) => ({
            tenantId,
            name: d.name,
            required: d.required ?? true,
            acceptTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          })),
        },
      },
      include: { requiredDocuments: true },
    });
    return call;
  }

  async actualizarConvocatoria(tenantId: string, id: string, dto: Partial<Parameters<AdmissionsService['crearConvocatoria']>[1]> & { status?: string }) {
    const call = await this.prisma.admissionCall.findFirst({ where: { id, tenantId } });
    if (!call) throw new NotFoundException('Convocatoria no encontrada');
    await this.validarReferenciasConvocatoria(tenantId, dto);

    if (dto.slug && dto.slug !== call.slug) {
      const choca = await this.prisma.admissionCall.findFirst({
        where: { tenantId, slug: dto.slug, id: { not: id } },
        select: { id: true },
      });
      if (choca) throw new ConflictException('Ya existe una convocatoria con ese slug');
    }

    const actualizada = await this.prisma.admissionCall.update({
      where: { id: call.id },
      data: {
        name: dto.name,
        slug: dto.slug,
        status: dto.status as never,
        opensAt: dto.opensAt ? new Date(dto.opensAt) : undefined,
        closesAt: dto.closesAt === undefined ? undefined : dto.closesAt ? new Date(dto.closesAt) : null,
        rolling: dto.rolling,
        startsAt: dto.startsAt === undefined ? undefined : dto.startsAt ? new Date(dto.startsAt) : null,
        capacity: dto.capacity === undefined ? undefined : dto.capacity,
        schedule: dto.schedule === undefined ? undefined : dto.schedule,
        applicationFee: dto.applicationFee,
        minAge: dto.minAge === undefined ? undefined : dto.minAge,
        maxAge: dto.maxAge === undefined ? undefined : dto.maxAge,
        minEducation: dto.minEducation === undefined ? undefined : dto.minEducation,
        targetLevels: dto.targetLevels === undefined ? undefined : ((dto.targetLevels as Prisma.InputJsonValue) ?? Prisma.JsonNull),
      },
      include: { requiredDocuments: true },
    });

    // Documentos requeridos: reemplazo completo del conjunto cuando viene.
    if (dto.documentos) {
      await this.prisma.admissionRequiredDocument.deleteMany({ where: { callId: call.id } });
      for (const d of dto.documentos) {
        await this.prisma.admissionRequiredDocument.create({
          data: {
            tenantId, callId: call.id, name: d.name, required: d.required ?? true,
            acceptTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          },
        });
      }
    }
    return actualizada;
  }

  // ================================================ pago manual (Fase 4)

  /**
   * El aspirante sube el comprobante del pago manual (§7): la solicitud pasa
   * a PAGO_EN_VERIFICACION y el admin confirma o rechaza. El comprobante es
   * un ApplicationDocument sin requiredDocId.
   */
  async subirComprobante(
    tenantId: string,
    email: string,
    code: string,
    archivo: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    const app = await this.appDeSesion(tenantId, email, code);
    if (app.status !== 'PAGO_PENDIENTE' && app.status !== 'PAGO_EN_VERIFICACION') {
      throw new BadRequestException('Esta solicitud no tiene un pago pendiente');
    }
    const { fileKey, sizeKb } = await this.archivos.guardarValido(tenantId, app.id, archivo, {
      acceptTypes: [],
      maxSizeMb: 5,
    });
    await this.prisma.applicationDocument.deleteMany({
      where: { applicationId: app.id, requiredDocId: null },
    });
    await this.prisma.applicationDocument.create({
      data: {
        tenantId,
        applicationId: app.id,
        fileKey,
        originalName: archivo.originalname.slice(0, 180),
        mimeType: archivo.mimetype,
        sizeKb,
      },
    });
    await this.cambiarEstado(tenantId, app.id, 'PAGO_EN_VERIFICACION', null, 'payment_submitted');
    return this.estadoBorrador(tenantId, code);
  }

  async confirmarPago(tenantId: string, id: string, ref: string | undefined, reviewerId: string) {
    const app = await this.prisma.application.findFirst({ where: { id, tenantId } });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    if (app.paidAt) throw new BadRequestException('El pago ya estaba confirmado');
    if (!['PAGO_PENDIENTE', 'PAGO_EN_VERIFICACION'].includes(app.status)) {
      throw new BadRequestException('La solicitud no está esperando un pago');
    }
    await this.prisma.application.update({
      where: { id: app.id },
      data: { paidAt: new Date(), paymentMethod: 'MANUAL', paymentRef: ref?.slice(0, 80) },
    });
    await this.cambiarEstado(tenantId, app.id, 'PAGADA', reviewerId, 'payment_confirmed', { ref });
    // Con todos los documentos requeridos aprobados pasa directo a revisión.
    const pendientes = await this.prisma.applicationDocument.count({
      where: { applicationId: app.id, requiredDocId: { not: null }, status: { not: 'APROBADO' } },
    });
    if (pendientes === 0) await this.cambiarEstado(tenantId, app.id, 'EN_REVISION', reviewerId, null);
    return this.detalle(tenantId, app.id);
  }

  async rechazarPago(tenantId: string, id: string, nota: string, reviewerId: string, baseUrl: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, tenantId },
      include: { applicant: true },
    });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    if (app.status !== 'PAGO_EN_VERIFICACION') {
      throw new BadRequestException('No hay un comprobante por verificar');
    }
    await this.cambiarEstado(tenantId, app.id, 'PAGO_PENDIENTE', reviewerId, 'payment_rejected', { nota });
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    const token = await this.generarEnlace(app.id);
    await this.mail.correccionSolicitada({
      para: app.applicant.email,
      institucion: tenant?.name ?? '',
      nombre: app.applicant.firstName,
      code: app.code,
      nota: `Sobre tu pago: ${nota}`,
      enlaceAcceso: `${baseUrl}/aspirante/acceso?token=${token}`,
    });
    return this.detalle(tenantId, app.id);
  }

  // ==================================================== admisión (Fase 4)

  /**
   * Admitir crea (o reutiliza) User STUDENT + Student + ProgramEnrollment con
   * el pensum de la convocatoria, respetando maxStudents del plan (§6.5).
   * Matricular es un paso aparte porque admisión y matrícula pueden ser
   * momentos distintos.
   */
  async admitir(tenantId: string, id: string, notas: string | undefined, reviewerId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, tenantId },
      include: { applicant: true, call: { include: { program: { select: { id: true, name: true } } } } },
    });
    if (!app || !app.call) throw new NotFoundException('Solicitud no encontrada');
    if (!['ENVIADA', 'PAGADA', 'EN_REVISION', 'DOCUMENTOS_INCOMPLETOS'].includes(app.status)) {
      throw new BadRequestException(`No se puede admitir una solicitud en estado ${app.status}`);
    }
    if (app.call.applicationFee > 0 && !app.paidAt) {
      throw new BadRequestException('Confirma el pago de la inscripción antes de admitir');
    }

    const email = app.applicant.email.toLowerCase();
    let user = await this.prisma.user.findFirst({ where: { tenantId, email } });
    let claveTemporal: string | null = null;

    if (user && user.role !== 'STUDENT') {
      throw new ConflictException(
        `El correo ${email} ya pertenece a un usuario ${user.role} de la institución; usa otro correo o resuélvelo con soporte`,
      );
    }

    let student = user
      ? await this.prisma.student.findFirst({ where: { tenantId, userId: user.id } })
      : null;

    if (!student) {
      // Límite del plan: bloqueo CLARO para el admin, nunca en silencio (§6.5).
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, maxStudents: true, currentStudents: true },
      });
      if (tenant && tenant.currentStudents >= tenant.maxStudents) {
        throw new ConflictException(
          `El plan de la institución permite ${tenant.maxStudents} estudiantes y ya están usados. ` +
            'Amplía el plan para admitir más aspirantes.',
        );
      }

      claveTemporal = randomBytes(9).toString('base64url');
      const bcrypt = await import('bcrypt');
      const resultado = await this.prisma.$transaction(async (tx) => {
        const u =
          user ??
          (await tx.user.create({
            data: {
              tenantId,
              email,
              passwordHash: await bcrypt.hash(claveTemporal as string, 10),
              firstName: app.applicant.firstName,
              lastName: app.applicant.lastName,
              role: 'STUDENT',
              isActive: true,
            },
          }));
        const s = await tx.student.create({
          data: {
            tenantId,
            userId: u.id,
            studentCode: `STU${Date.now()}`,
            enrollmentDate: new Date(),
            tipoIdentificacion: app.applicant.documentType,
            numeroIdentificacion: app.applicant.documentNumber,
            fechaNacimiento: app.applicant.birthDate,
            celular: app.applicant.phone,
          },
        });
        await tx.tenant.update({
          where: { id: tenantId },
          data: { currentStudents: { increment: 1 } },
        });
        return { u, s };
      });
      user = resultado.u;
      student = resultado.s;
    }

    // Inscripción al programa con el pensum de la convocatoria. Única por
    // (student, program): si ya existía, se reutiliza.
    const matricula = await this.prisma.programEnrollment.upsert({
      where: { studentId_programId: { studentId: student.id, programId: app.call.program.id } },
      update: {},
      create: {
        tenantId,
        studentId: student.id,
        programId: app.call.program.id,
        studyPlanId: app.call.studyPlanId,
        currentLevel: app.targetLevel && app.targetLevel > 0 ? app.targetLevel : 1,
      },
    });

    await this.prisma.applicant.update({
      where: { id: app.applicantId },
      data: { studentId: student.id },
    });
    await this.prisma.application.update({
      where: { id: app.id },
      data: { decisionNotes: notas, reviewerId },
    });
    await this.cambiarEstado(tenantId, app.id, 'ADMITIDA', reviewerId, 'admitted', {
      studentId: student.id,
      enrollmentId: matricula.id,
    });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    await this.mail.enviar(
      email,
      `¡Fuiste admitido! — ${tenant?.name ?? ''}`,
      [
        `Hola ${app.applicant.firstName},`,
        '',
        `Tu solicitud ${app.code} a ${app.call.program.name} fue ADMITIDA. 🎉`,
        '',
        claveTemporal
          ? `Tu acceso al campus virtual:\n  Usuario: ${email}\n  Clave temporal: ${claveTemporal}\n\nCámbiala al entrar por primera vez (/login).`
          : 'Ya tienes acceso al campus virtual con tu cuenta de siempre (/login).',
      ].join('\n'),
    );

    return this.detalle(tenantId, app.id);
  }

  async noAdmitir(tenantId: string, id: string, nota: string, reviewerId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, tenantId },
      include: { applicant: true },
    });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    await this.prisma.application.update({ where: { id: app.id }, data: { decisionNotes: nota, reviewerId } });
    await this.cambiarEstado(tenantId, app.id, 'NO_ADMITIDA', reviewerId, 'rejected', { nota });
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    await this.mail.enviar(
      app.applicant.email,
      `Resultado de tu solicitud ${app.code} — ${tenant?.name ?? ''}`,
      `Hola ${app.applicant.firstName},\n\nTu solicitud ${app.code} no fue admitida en esta ocasión.\n${nota}\n\nGracias por tu interés.`,
    );
    return this.detalle(tenantId, app.id);
  }

  async marcarDesistio(tenantId: string, id: string, reviewerId: string) {
    const app = await this.prisma.application.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    await this.cambiarEstado(tenantId, app.id, 'DESISTIO', reviewerId, 'withdrew');
    return this.detalle(tenantId, app.id);
  }

  async matricular(tenantId: string, id: string, reviewerId: string) {
    const app = await this.prisma.application.findFirst({ where: { id, tenantId }, select: { id: true, status: true } });
    if (!app) throw new NotFoundException('Solicitud no encontrada');
    if (app.status !== 'ADMITIDA') throw new BadRequestException('Solo se matricula una solicitud ADMITIDA');
    await this.cambiarEstado(tenantId, app.id, 'MATRICULADA', reviewerId, 'enrolled');
    return this.detalle(tenantId, app.id);
  }

  // ====================================================== embudo (Fase 4)

  /**
   * Embudo por convocatoria y por fuente (§5): la institución ve qué campaña
   * le trae MATRICULADOS, no solo clics.
   */
  async embudo(tenantId: string, callId?: string) {
    const where: Prisma.ApplicationWhereInput = { tenantId, ...(callId ? { callId } : {}) };
    const apps = await this.prisma.application.findMany({
      where,
      select: {
        status: true,
        paidAt: true,
        applicant: { select: { utm: true } },
      },
    });

    const ENVIADA_O_MAS: ApplicationStatus[] = [
      'ENVIADA', 'PAGO_PENDIENTE', 'PAGO_EN_VERIFICACION', 'PAGADA', 'EN_REVISION',
      'DOCUMENTOS_INCOMPLETOS', 'ADMITIDA', 'NO_ADMITIDA', 'MATRICULADA',
    ];
    const totales = {
      interesados: apps.filter((a) => a.status === 'INTERESADO' || a.status === 'BORRADOR').length,
      enviadas: apps.filter((a) => ENVIADA_O_MAS.includes(a.status)).length,
      pagadas: apps.filter((a) => a.paidAt).length,
      admitidas: apps.filter((a) => a.status === 'ADMITIDA' || a.status === 'MATRICULADA').length,
      matriculadas: apps.filter((a) => a.status === 'MATRICULADA').length,
    };

    const porFuente = new Map<string, { total: number; enviadas: number; admitidas: number; matriculadas: number }>();
    for (const a of apps) {
      const utm = (a.applicant.utm || {}) as Record<string, string>;
      const fuente = utm.utm_source || (utm.gclid ? 'google-ads' : utm.fbclid ? 'meta' : 'directo');
      if (!porFuente.has(fuente)) porFuente.set(fuente, { total: 0, enviadas: 0, admitidas: 0, matriculadas: 0 });
      const f = porFuente.get(fuente) as { total: number; enviadas: number; admitidas: number; matriculadas: number };
      f.total++;
      if (ENVIADA_O_MAS.includes(a.status)) f.enviadas++;
      if (a.status === 'ADMITIDA' || a.status === 'MATRICULADA') f.admitidas++;
      if (a.status === 'MATRICULADA') f.matriculadas++;
    }

    return {
      totales,
      fuentes: [...porFuente.entries()]
        .map(([fuente, datos]) => ({ fuente, ...datos }))
        .sort((a, b) => b.total - a.total),
    };
  }

  // ======================================================== auxiliares

  private async cambiarEstado(
    tenantId: string,
    applicationId: string,
    status: ApplicationStatus,
    actorUserId: string | null,
    tipoEvento: string | null,
    data?: Record<string, unknown>,
  ) {
    await this.prisma.application.update({ where: { id: applicationId }, data: { status } });
    await this.evento(tenantId, applicationId, tipoEvento ?? `status_${status.toLowerCase()}`, actorUserId, data);
  }

  /** Tipos internos de la línea de tiempo → eventos de dominio del outbox (§9/§13.4). */
  private static EVENTO_DOMINIO: Record<string, string> = {
    created: 'application.created',
    submitted: 'application.submitted',
    doc_rejected: 'application.documents_rejected',
    payment_confirmed: 'payment.confirmed',
    admitted: 'application.admitted',
    rejected: 'application.rejected',
    enrolled: 'application.enrolled',
    lead: 'lead.created',
  };

  private async evento(
    tenantId: string,
    applicationId: string,
    type: string,
    actorUserId: string | null,
    data?: Record<string, unknown>,
  ) {
    const fila = await this.prisma.applicationEvent.create({
      data: { tenantId, applicationId, type, actorUserId, data: (data as Prisma.InputJsonValue) ?? undefined },
    });
    // Outbox: el hito queda disponible para WhatsApp/webhooks sin acoplar el
    // flujo; si fallara el insert, la inscripción no se cae por eso.
    const dominio = AdmissionsService.EVENTO_DOMINIO[type];
    if (dominio) {
      try {
        await this.prisma.outboxEvent.create({
          data: {
            tenantId,
            type: dominio,
            payload: { applicationId, ...(data ?? {}) } as Prisma.InputJsonValue,
          },
        });
      } catch {
        /* nunca tumbar el flujo por telemetría */
      }
    }
    return fila;
  }

  /** La cookie vu_utm que siembra el sitio en la llegada (§3). */
  utmDeCookie(req: Request): Record<string, string> | null {
    const crudo = /(?:^|;\s*)vu_utm=([^;]+)/.exec(req.headers.cookie || '')?.[1];
    if (!crudo) return null;
    try {
      const datos = JSON.parse(decodeURIComponent(crudo));
      return typeof datos === 'object' && datos ? datos : null;
    } catch {
      return null;
    }
  }

  ipDe(req: Request): string {
    const xff = (req.headers['x-forwarded-for'] as string) || '';
    return (xff.split(',')[0] || req.socket?.remoteAddress || '').trim().slice(0, 45) || 'desconocida';
  }

  /** Para el render del formulario: la convocatoria pública con sus reglas. */
  async fichaConvocatoria(tenantId: string, slug: string) {
    const call = await this.convocatoriaPorSlug(tenantId, slug);
    if (!this.catalogo.llamadaAbierta(call)) {
      throw new ForbiddenException('La convocatoria no está abierta');
    }
    return call;
  }
}
