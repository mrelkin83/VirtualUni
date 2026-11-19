import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Correo transaccional de admisiones. Con SMTP_HOST configurado usa SMTP
 * real; sin él, deja el correo en el log (desarrollo y demos). El contenido
 * es texto plano a propósito: llega igual en cualquier cliente y no abre
 * superficie de inyección de HTML.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    }
  }

  private get remitente(): string {
    return process.env.SMTP_FROM || 'no-reply@virtualuni.local';
  }

  async enviar(para: string, asunto: string, texto: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[sin SMTP] Para: ${para} | Asunto: ${asunto}\n${texto}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.remitente, to: para, subject: asunto, text: texto });
    } catch (e) {
      // El correo nunca tumba la inscripción: se registra y se sigue.
      this.logger.error(`Fallo enviando correo a ${para}: ${(e as Error).message}`);
    }
  }

  async confirmacionEnvio(opts: {
    para: string;
    institucion: string;
    nombre: string;
    code: string;
    programa: string;
    enlaceAcceso: string;
    requierePago: boolean;
  }) {
    const lineas = [
      `Hola ${opts.nombre},`,
      '',
      `Recibimos tu solicitud de inscripción a ${opts.programa} en ${opts.institucion}.`,
      `Tu código de solicitud es: ${opts.code}`,
      '',
      opts.requierePago
        ? 'Para continuar, realiza el pago de la inscripción desde el enlace de abajo.'
        : 'Nuestro equipo revisará tus documentos y te contactará.',
      '',
      `Consulta el estado y continúa tu proceso aquí (enlace válido por 30 minutos):`,
      opts.enlaceAcceso,
      '',
      'Si el enlace venció, pide uno nuevo con tu documento y correo en la página "Consulta tu solicitud".',
    ];
    await this.enviar(opts.para, `Solicitud ${opts.code} recibida — ${opts.institucion}`, lineas.join('\n'));
  }

  async correccionSolicitada(opts: {
    para: string;
    institucion: string;
    nombre: string;
    code: string;
    nota: string;
    enlaceAcceso: string;
  }) {
    const lineas = [
      `Hola ${opts.nombre},`,
      '',
      `Tu solicitud ${opts.code} en ${opts.institucion} necesita una corrección:`,
      '',
      opts.nota,
      '',
      'Entra aquí para corregirla (enlace válido por 30 minutos):',
      opts.enlaceAcceso,
    ];
    await this.enviar(opts.para, `Tu solicitud ${opts.code} necesita una corrección`, lineas.join('\n'));
  }

  async enlaceAcceso(opts: { para: string; institucion: string; enlace: string }) {
    const lineas = [
      'Hola,',
      '',
      `Pediste entrar a consultar tu solicitud en ${opts.institucion}.`,
      'Este enlace es de un solo uso y vence en 30 minutos:',
      opts.enlace,
      '',
      'Si no fuiste tú, ignora este correo.',
    ];
    await this.enviar(opts.para, `Tu acceso a ${opts.institucion}`, lineas.join('\n'));
  }
}
