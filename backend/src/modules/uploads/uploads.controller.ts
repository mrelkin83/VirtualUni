import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UploadsService, TAMANIO_MAXIMO_BYTES } from './uploads.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // Se recibe en memoria y el servicio decide dónde escribirlo: así el
      // nombre y la ruta nunca dependen de lo que envíe el cliente.
      storage: memoryStorage(),
      limits: { fileSize: TAMANIO_MAXIMO_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir un archivo',
    description:
      'Almacena el archivo bajo el tenant actual y devuelve la URL para referenciarlo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        carpeta: {
          type: 'string',
          enum: ['materiales', 'avatares', 'adjuntos', 'portadas'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido' })
  @ApiResponse({ status: 400, description: 'Tipo o tamaño no permitido' })
  subir(
    @UploadedFile() file: Express.Multer.File,
    @Body('carpeta') carpeta: string,
    @CurrentTenant() tenantId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo en el campo "file"');
    }

    return this.uploadsService.guardar(tenantId, file, carpeta);
  }

  @Delete()
  @Roles('TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar un archivo subido' })
  eliminar(@Query('url') url: string, @CurrentTenant() tenantId: string) {
    return this.uploadsService.eliminar(tenantId, url);
  }

  /**
   * Antes los archivos se servían con `useStaticAssets` fuera del pipeline de
   * guards de Nest (ver backend/src/main.ts): cualquiera con la URL, sin
   * sesión, podía descargar certificados, carnés o adjuntos de RRHH/nómina.
   * Ahora la descarga exige la misma sesión y tenant que el resto del API.
   */
  @Get('file/:tenantId/:carpeta/:nombre')
  @ApiParam({ name: 'tenantId' })
  @ApiParam({ name: 'carpeta' })
  @ApiParam({ name: 'nombre' })
  @ApiOperation({ summary: 'Descargar un archivo subido' })
  @ApiResponse({ status: 200, description: 'Contenido del archivo' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  descargar(
    @Param('tenantId') tenantIdSolicitado: string,
    @Param('carpeta') carpeta: string,
    @Param('nombre') nombre: string,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    if (tenantIdSolicitado !== tenantId) {
      // Mismo mensaje que un 404 real: no confirmamos ni negamos la
      // existencia del archivo de un tenant ajeno.
      throw new NotFoundException('Archivo no encontrado');
    }

    const ruta = this.uploadsService.resolverRutaAbsoluta(tenantIdSolicitado, carpeta, nombre);
    return res.sendFile(ruta);
  }
}
