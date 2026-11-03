import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { asegurarEntornoValido } from './common/config/validate-env';

async function bootstrap() {
  // Falla rápido si la configuración sensible no es apta para el entorno.
  asegurarEntornoValido();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhooks
  });

  // Los archivos subidos NO se sirven como estáticos públicos: se descargan
  // por GET /api/v1/uploads/file/:tenantId/:carpeta/:nombre (uploads.controller.ts),
  // detrás de JwtAuthGuard + TenantGuard, igual que el resto del API.

  // CORS - Allow frontend access (development + production)
  //
  // CORS_ORIGINS se inyectaba desde docker-compose pero nadie lo leia: solo
  // contaba FRONTEND_URL, asi que al separar el API a otro dominio los
  // subdominios de tenant quedaban bloqueados y la variable configurada no
  // hacia nada. Ahora se leen ambos, y del dominio de FRONTEND_URL se deriva
  // un regex que admite cualquier subdominio de tenant (<slug>.dominio) —
  // esta plataforma es multi-tenant por subdominio, no un origen unico.
  const origenesConfigurados = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const origenesTenant: RegExp[] = [];
  if (process.env.FRONTEND_URL) {
    try {
      const { hostname } = new URL(process.env.FRONTEND_URL);
      const base = hostname
        .replace(/^www\./, '')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      origenesTenant.push(new RegExp(`^https://([a-z0-9-]+\\.)?${base}$`));
    } catch {
      // FRONTEND_URL malformada: se ignora el regex y quedan los literales.
    }
  }

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      // Tenant subdomains in development (e.g. http://uniprueba.localhost:3000)
      /^http:\/\/[a-z0-9-]+\.localhost:(3000|3001|5173)$/,
      process.env.FRONTEND_URL,
      ...origenesConfigurados,
      ...origenesTenant,
    ].filter(Boolean),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('VirtualUni API')
    .setDescription('Multi-Tenant SaaS Platform for Educational Institutions')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tenants', 'Tenant management')
    .addTag('users', 'User management')
    .addTag('students', 'Student management')
    .addTag('teachers', 'Teacher management')
    .addTag('courses', 'Course management')
    .addTag('assignments', 'Assignment management')
    .addTag('grades', 'Grade management')
    .addTag('messages', 'Messaging system')
    .addTag('billing', 'Subscription and billing')
    .addTag('exams', 'Exams, questions and student attempts')
    .addTag('attendance', 'Course attendance tracking')
    .addTag('uploads', 'File uploads')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`
  🚀 VirtualUni API is running on: http://localhost:${port}
  📚 API Documentation: http://localhost:${port}/api/docs
  `);
}

bootstrap();
