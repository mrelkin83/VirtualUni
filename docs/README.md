# VirtualUni - Plataforma Educativa SaaS Multi-Tenant

[![CI/CD](https://github.com/your-org/virtualuni/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/your-org/virtualuni/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Una plataforma educativa virtual completa y escalable con arquitectura multi-tenant, diseñada para instituciones educativas que buscan digitalizar sus procesos académicos y administrativos.

---

## ✨ Características Principales

### Paneles Diferenciados

- 🎓 **Panel de Estudiante**: Cursos, tareas, exámenes, mensajería, trámites y perfil
- 👨‍🏫 **Panel de Docente**: Gestión de cursos, calificaciones, asistencia, materiales y analytics
- 🔧 **Panel de Administrador**: Control completo con 19+ módulos administrativos

### Módulos Administrativos

- 📊 **Analytics y Reportes**: Estadísticas en tiempo real, gráficos interactivos y exportación (PDF/Excel)
- 💰 **Finanzas y Contabilidad**: Transacciones, presupuestos, cuentas y reportes financieros
- 👥 **Recursos Humanos**: Gestión de empleados, nómina, vacaciones e incapacidades
- 📦 **Activos e Inventario**: Control de activos institucionales y gestión de inventarios
- 🎫 **Carnetización**: Sistema completo de generación de carnets con plantillas personalizables
- 📢 **Anuncios y Comunicaciones**: Anuncios institucionales y mensajes masivos
- 📝 **Gestión de Trámites**: Sistema de solicitudes y seguimiento
- 📚 **Biblioteca**: Catálogo de libros, préstamos y control de devoluciones

### Características Técnicas

- 🏢 **Multi-Tenant**: Soporte para múltiples instituciones con aislamiento de datos
- 🔐 **Seguridad**: JWT Authentication, roles granulares, guards de seguridad
- 🚀 **Performance**: Redis cache, queries optimizadas, lazy loading
- 📱 **Responsive**: Diseño mobile-first con Tailwind CSS
- 📈 **Escalable**: Arquitectura preparada para alta carga
- 🔔 **Notificaciones**: Sistema de notificaciones en tiempo real
- 📊 **Reportes**: Exportación a PDF, Excel y JSON

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: NestJS 10
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5
- **ORM**: Prisma 5
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: Passport + JWT
- **Validation**: class-validator
- **API Docs**: Swagger/OpenAPI
- **Payments**: Stripe

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx
- **Monitoring**: Health checks integrados

---

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local

#### Requisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (opcional pero recomendado)

#### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/your-org/virtualuni.git
cd virtualuni

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 5. Generar Prisma Client
npx prisma generate

# 6. Ejecutar migraciones
npx prisma migrate deploy

# 7. (Opcional) Seed de datos
npx prisma db seed

# 8. Volver a raíz
cd ..

# 9. Iniciar frontend (terminal 1)
npm run dev

# 10. Iniciar backend (terminal 2)
cd backend && npm run start:dev
```

Acceder a:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

### Opción 2: Docker (Producción)

#### Requisitos
- Docker 20.10+
- Docker Compose 2.0+

#### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/your-org/virtualuni.git
cd virtualuni

# 2. Configurar variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
# Editar archivos .env con valores de producción

# 3. Iniciar con Docker Compose
docker-compose up -d

# 4. Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# 5. (Opcional) Seed de datos
docker-compose exec backend npx prisma db seed

# 6. Verificar servicios
docker-compose ps
```

Acceder a:
- Frontend: http://localhost:80
- Backend: http://localhost:3001
- Prisma Studio: http://localhost:5555 (requiere: `docker-compose --profile tools up -d`)

---

## 📖 Documentación

- [Plan de Corrección y Estado Actual](PLAN_CORRECCION_2026-07-19.md) - **Auditoría completa, correcciones aplicadas y roadmap vigente** ⭐
- [API de Exámenes y Asistencia](API_EXAMENES_ASISTENCIA.md) - Referencia técnica de los módulos exams/attendance
- [Guía de Despliegue](DEPLOYMENT.md) - Instrucciones detalladas para producción
- [Estado del Desarrollo](ESTADO_DESARROLLO.md) - Estado actual y módulos implementados
- [Nuevas Funcionalidades](NUEVAS_FUNCIONALIDADES.md) - Changelog y nuevas features
- [Progreso del Desarrollo](PROGRESO_DESARROLLO.md) - Historial de desarrollo

---

## 🗂️ Estructura del Proyecto

```
virtualuni/
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── admin/           # 19 módulos administrativos
│   │   │   ├── student/         # Componentes de estudiantes
│   │   │   └── teacher/         # Componentes de docentes
│   │   ├── pages/               # Páginas principales
│   │   ├── api/                 # Clientes API
│   │   ├── types/               # TypeScript types
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Utilidades
│   ├── public/                  # Assets estáticos
│   ├── Dockerfile               # Docker frontend
│   ├── nginx.conf               # Configuración Nginx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── modules/             # 25 módulos NestJS
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── tenants/
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   ├── courses/
│   │   │   ├── analytics/
│   │   │   ├── finance/
│   │   │   └── ...
│   │   ├── common/              # Guards, decorators, filters
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma        # Schema de base de datos
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── Dockerfile               # Docker backend
│   └── package.json
│
├── scripts/
│   ├── setup.sh                 # Script de configuración
│   ├── deploy.sh                # Script de despliegue
│   ├── backup.sh                # Script de backup
│   └── restore.sh               # Script de restauración
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI Pipeline
│       └── deploy.yml           # Deployment Pipeline
│
├── docker-compose.yml           # Orquestación de servicios
├── .env.example                 # Variables de entorno ejemplo
├── DEPLOYMENT.md                # Guía de despliegue
└── README.md                    # Este archivo
```

---

## 📊 Módulos y Funcionalidades

### Core Académico
- ✅ Gestión de Usuarios (Multi-tenant)
- ✅ Gestión de Estudiantes
- ✅ Gestión de Docentes
- ✅ Cursos y Materias
- ✅ Tareas y Entregas
- ✅ Sistema de Calificaciones
- ✅ Mensajería Interna
- ✅ Notificaciones

### Módulos Administrativos
- ✅ Analytics y Reportes
- ✅ Finanzas y Contabilidad
- ✅ Recursos Humanos
- ✅ Nómina
- ✅ Gestión de Activos
- ✅ Inventario
- ✅ Carnetización
- ✅ Anuncios Institucionales
- ✅ Gestión de Trámites
- ✅ Mensajes Masivos
- ✅ Biblioteca

### Funcionalidades Transversales
- ✅ Multi-tenancy
- ✅ Autenticación y Autorización
- ✅ Sistema de Roles
- ✅ Exportación de Datos (PDF/Excel)
- ✅ Búsqueda y Filtros Avanzados
- ✅ Paginación
- ✅ Cache con Redis
- ✅ Health Checks
- ✅ API Documentation (Swagger)

---

## 🔧 Scripts Disponibles

### Frontend

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build para producción
npm run preview       # Preview del build
npm run lint          # Linter
```

### Backend

```bash
npm run start         # Iniciar servidor
npm run start:dev     # Servidor con hot-reload
npm run start:prod    # Servidor de producción
npm run build         # Compilar TypeScript
npm run lint          # Linter

# Prisma
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:seed      # Seed de datos
```

### Docker

```bash
docker-compose up -d              # Iniciar servicios
docker-compose down               # Detener servicios
docker-compose logs -f            # Ver logs
docker-compose ps                 # Estado de servicios
docker-compose restart backend    # Reiniciar servicio
docker-compose build              # Reconstruir imágenes
```

---

## 🔐 Configuración de Seguridad

### Variables de Entorno Críticas

Asegúrate de cambiar estos valores en producción:

```env
# JWT (mínimo 32 caracteres)
JWT_SECRET="tu-secret-muy-largo-y-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-muy-largo-y-seguro"

# Database
POSTGRES_PASSWORD="contraseña-segura"
DATABASE_URL="postgresql://user:password@host:5432/db"

# Redis
REDIS_PASSWORD="contraseña-redis-segura"

# Stripe (usar claves live en producción)
STRIPE_SECRET_KEY="sk_live_tu_clave"
```

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Usar HTTPS/SSL en producción
- [ ] Configurar CORS correctamente
- [ ] Habilitar rate limiting
- [ ] Configurar firewall
- [ ] Mantener dependencias actualizadas
- [ ] Revisar logs regularmente
- [ ] Configurar backups automáticos

---

## 📈 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/refresh` - Refresh token

### Usuarios
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/:id` - Obtener usuario
- `PATCH /api/v1/users/:id` - Actualizar usuario

### Analytics
- `GET /api/v1/analytics/dashboard` - Estadísticas del dashboard
- `GET /api/v1/analytics/students` - Analytics de estudiantes
- `GET /api/v1/analytics/financial` - Analytics financieras
- `GET /api/v1/analytics/trends` - Tendencias mensuales

Ver documentación completa en: `http://localhost:3001/api`

---

## 🧪 Testing

```bash
# Frontend
npm run test

# Backend
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage
```

---

## 📦 Deployment

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas.

### Opciones de Despliegue

1. **Docker Compose** (Recomendado)
   - Fácil de configurar
   - Todos los servicios incluidos
   - Ideal para VPS/Servidores dedicados

2. **Cloud Providers**
   - AWS (EC2 + RDS)
   - Google Cloud Platform
   - DigitalOcean
   - Azure

3. **Kubernetes** (Para escala empresarial)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

- **Documentación**: Ver carpeta `docs/`
- **Issues**: [GitHub Issues](https://github.com/your-org/virtualuni/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/your-org/virtualuni/discussions)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

Desarrollado con:
- React + TypeScript
- NestJS + Prisma
- PostgreSQL + Redis
- Docker + Nginx
- Y muchas otras increíbles tecnologías open source

---

## 📊 Estado del Proyecto

- ✅ **Backend**: 100% completo (25 módulos, 127+ endpoints)
- ✅ **Frontend**: 95% completo (62+ componentes)
- ✅ **Docker**: 100% configurado
- ✅ **CI/CD**: 100% configurado
- ✅ **Documentación**: 100% completa
- ⚠️ **Tests**: 30% (en desarrollo)

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0
**Estado**: ✅ Listo para Producción

---

© 2025 VirtualUni - Educación Virtual de Calidad
