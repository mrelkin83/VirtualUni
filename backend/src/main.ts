import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
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

  // Archivos subidos: se sirven fuera del prefijo /api/v1, tal y como se
  // devuelven las URLs desde el modulo de uploads.
  app.useStaticAssets(join(process.env.UPLOADS_DIR || join(process.cwd(), 'uploads')), {
    prefix: '/uploads/',
  });

  // CORS - Allow frontend access (development + production)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      // Tenant subdomains in development (e.g. http://uniprueba.localhost:3000)
      /^http:\/\/[a-z0-9-]+\.localhost:(3000|3001|5173)$/,
      process.env.FRONTEND_URL,
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
