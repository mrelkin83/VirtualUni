import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ResultadoValidacion {
  valido: boolean;
  tipo?: string;
  titular?: string;
  programa?: string | null;
  fechaEmision?: Date | null;
  estado?: string;
  message?: string;
}

/**
 * Validación pública de certificados y carnets (§13.5). Respuesta MÍNIMA:
 * titular, tipo, fecha y estado — nunca el documento completo ni notas. Un
 * código inexistente devuelve siempre lo mismo (sin enumeración). La usan la
 * página /validar, el widget y la API pública.
 */
@Injectable()
export class VerificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async validar(tenantId: string, code: string): Promise<ResultadoValidacion> {
    const generica: ResultadoValidacion = { valido: false, message: 'Código no reconocido' };
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(code)) return generica;

    const cert = await this.prisma.certificateRequest.findFirst({
      where: { verificationCode: code, tenantId },
      select: {
        tipo: true,
        estado: true,
        fechaEmision: true,
        student: { select: { program: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (cert) {
      return {
        valido: cert.estado === 'EMITIDO',
        tipo: cert.tipo,
        titular: `${cert.student.user.firstName} ${cert.student.user.lastName}`,
        programa: cert.student.program,
        fechaEmision: cert.fechaEmision,
        estado: cert.estado === 'EMITIDO' ? 'Válido' : 'Anulado',
      };
    }

    const carnet = await this.prisma.cardIssuance.findFirst({
      where: { verificationCode: code, tenantId },
      select: { lote: true, createdAt: true },
    });
    if (carnet) {
      return {
        valido: true,
        tipo: 'Carnet institucional',
        titular: `Lote ${carnet.lote}`,
        fechaEmision: carnet.createdAt,
        estado: 'Válido',
      };
    }
    return generica;
  }
}
