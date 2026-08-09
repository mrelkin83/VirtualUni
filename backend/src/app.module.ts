import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';

// Entity Modules
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';

// Feature Modules
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { GradesModule } from './modules/grades/grades.module';
import { MessagesModule } from './modules/messages/messages.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Admin Modules
import { AssetsModule } from './modules/assets/assets.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HrModule } from './modules/hr/hr.module';
import { IdCardsModule } from './modules/idcards/idcards.module';
import { CardTemplatesModule } from './modules/card-templates/card-templates.module';
import { CardIssuancesModule } from './modules/card-issuances/card-issuances.module';
import { CardGeneratorModule } from './modules/card-generator/card-generator.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { MassMessagesModule } from './modules/mass-messages/mass-messages.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ExamsModule } from './modules/exams/exams.module';
import { AttendanceModule } from './modules/attendance/attendance.module';

// Modulos academicos (docente y estudiante)
import { MaterialsModule } from './modules/materials/materials.module';
import { LiveClassesModule } from './modules/live-classes/live-classes.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LibraryModule } from './modules/library/library.module';
import { ForumsModule } from './modules/forums/forums.module';
import { CommunityModule } from './modules/community/community.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { MessageTemplatesModule } from './modules/message-templates/message-templates.module';
import { CourseTopicsModule } from './modules/course-topics/course-topics.module';
import { CertificateTemplatesModule } from './modules/certificate-templates/certificate-templates.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Limite de tasa. RATE_LIMIT_TTL y RATE_LIMIT_MAX ya figuraban en
    // .env.production.example, pero el paquete no estaba ni instalado: quien
    // desplegara con esa plantilla creia tener proteccion contra fuerza bruta
    // y no tenia ninguna. Se registra aqui, pero NO como guard global: solo lo
    // aplican los endpoints publicos con @UseGuards(ThrottlerGuard), para no
    // alterar el comportamiento de las 317 rutas de golpe.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('RATE_LIMIT_TTL') ?? 60) * 1000,
          limit: Number(config.get('RATE_LIMIT_MAX') ?? 100),
        },
      ],
    }),

    // Database
    PrismaModule,

    // Cache
    CacheModule,

    // Core Modules
    AuthModule,
    TenantsModule,
    UsersModule,

    // Entity Modules
    StudentsModule,
    TeachersModule,
    CoursesModule,

    // Feature Modules
    AssignmentsModule,
    GradesModule,
    MessagesModule,
    BillingModule,
    NotificationsModule,

    // Admin Modules
    AssetsModule,
    PayrollModule,
    InventoryModule,
    HrModule,
    IdCardsModule,
    CardTemplatesModule,
    CardIssuancesModule,
    CardGeneratorModule,
    AnnouncementsModule,
    ProceduresModule,
    FinanceModule,
    MassMessagesModule,
    AnalyticsModule,
    AlertsModule,
    ExamsModule,
    AttendanceModule,

    // Modulos academicos
    MaterialsModule,
    LiveClassesModule,
    GroupsModule,
    LibraryModule,
    ForumsModule,
    CommunityModule,
    CertificatesModule,
    ScheduleModule,
    UploadsModule,
    CertificateTemplatesModule,
    CourseTopicsModule,
    QuestionBankModule,
    MessageTemplatesModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant middleware to all routes except auth and webhooks
    consumer
      .apply(TenantMiddleware)
      .exclude('auth/(.*)', 'billing/webhook')
      .forRoutes('*');
  }
}
