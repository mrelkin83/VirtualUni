# Quick Reference - 3 Módulos Admin

## Estructura Rápida

### Backend Locations
```
backend/src/modules/
├── announcements/  (9 endpoints, 8 métodos)
│   ├── dto/ (4 files)
│   ├── announcements.service.ts
│   ├── announcements.controller.ts
│   ├── announcements.module.ts
│   └── index.ts
├── procedures/     (10 endpoints, 10 métodos)
│   ├── dto/ (5 files)
│   ├── procedures.service.ts
│   ├── procedures.controller.ts
│   ├── procedures.module.ts
│   └── index.ts
└── mass-messages/  (8 endpoints, 10 métodos)
    ├── dto/ (5 files)
    ├── mass-messages.service.ts
    ├── mass-messages.controller.ts
    ├── mass-messages.module.ts
    └── index.ts
```

### Frontend Locations
```
src/
├── components/admin/sections/
│   ├── AnunciosSection.tsx
│   ├── TramitesSection.tsx
│   ├── MensajesMasivosSection.tsx
│   └── index.ts (updated)
└── api/endpoints/
    ├── announcements.ts
    ├── procedures.ts
    └── mass-messages.ts
```

## Endpoints Rápidos

### Announcements
```
POST   /announcements
GET    /announcements
PATCH  /announcements/:id
DELETE /announcements/:id
POST   /announcements/:id/publish
POST   /announcements/:id/archive
GET    /announcements/:id
GET    /announcements/stats
GET    /announcements/priority/:priority
```

### Procedures
```
POST   /procedures
GET    /procedures
PATCH  /procedures/:id
DELETE /procedures/:id
POST   /procedures/:id/assign
POST   /procedures/:id/respond
GET    /procedures/:id
GET    /procedures/stats
GET    /procedures/status/:status
GET    /procedures/priority/:priority
```

### Mass Messages
```
POST   /mass-messages
GET    /mass-messages
PATCH  /mass-messages/:id
DELETE /mass-messages/:id
POST   /mass-messages/:id/send
GET    /mass-messages/:id
GET    /mass-messages/stats
GET    /mass-messages/status/:status
```

## Estado del Proyecto

- Backend: COMPLETADO
- Frontend: COMPLETADO
- Documentación: COMPLETADA
- Integración: app.module.ts actualizado

## Filtrando/Búsqueda

### Announcements
- `search`: Buscar en titulo/contenido
- `prioridad`: ALTA, MEDIA, BAJA
- `estado`: BORRADOR, PUBLICADO, ARCHIVADO
- `page`: Número de página
- `limit`: Items por página

### Procedures
- `search`: Buscar en tipo/descripción
- `estado`: PENDIENTE, EN_PROCESO, COMPLETADO, RECHAZADO
- `prioridad`: ALTA, MEDIA, BAJA
- `tipo`: Filtro por tipo específico
- `solicitanteId`: Filtro por solicitante
- `asignadoA`: Filtro por asignado

### Mass Messages
- `search`: Buscar en asunto/contenido
- `estado`: BORRADOR, PROGRAMADO, ENVIADO, FALLIDO
- `page`: Número de página
- `limit`: Items por página

## DTOs Principales

### Announcement
```typescript
{
  titulo: string (5-200)
  contenido: string (min 10)
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  targetRoles?: string[]
  adjuntos?: string[] (max 5)
  publicar?: boolean
}
```

### Procedure
```typescript
{
  tipo: string (5-100)
  descripcion: string (min 10)
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  adjuntos?: string[] (max 5)
}
```

### Respond Procedure
```typescript
{
  respuesta: string (min 10)
  estado: 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO'
  adjuntosRespuesta?: string[]
}
```

### Mass Message
```typescript
{
  asunto: string (5-200)
  contenido: string (min 10)
  targetRoles?: string[]
  targetUsers?: string[] (max 1000)
  adjuntos?: string[] (max 5)
  programado?: string (ISO datetime)
}
```

## Seguridad

Todos los endpoints requieren:
- JWT Token
- TenantGuard (multi-tenancy)
- RolesGuard (TENANT_ADMIN, SUPER_ADMIN)

## Frontend Features

### AnunciosSection
- Modal de crear/editar
- Tabla con filtros dinámicos
- Acciones: Publicar, Archivar, Eliminar
- Color-coded badges

### TramitesSection
- Modal de crear/editar
- Modal separado para responder
- Tabla con información completa
- Acciones dinámicas por estado

### MensajesMasivosSection
- Modal de crear/editar
- Modal de estadísticas
- Selección de roles (checkboxes)
- Programación de envío
- Estadísticas en tiempo real

## Validaciones Frontend

- Títulos: 5-200 caracteres
- Contenido: Mínimo 10 caracteres
- Adjuntos: Máximo 5 por entidad
- Usuarios: Máximo 1000 para mass messages
- Fechas: Formato ISO 8601

## Estadísticas Disponibles

### Announcements
- Total, Publicados, Borradores, Archivados
- Distribucion por prioridad

### Procedures
- Total, Pendientes, En proceso, Completados, Rechazados
- Distribucion por prioridad
- Tiempo promedio de respuesta (horas)

### Mass Messages
- Total, Borradores, Programados, Enviados, Fallidos
- Promedio de destinatarios

## Testing

Para probar localmente:

```bash
# Backend
npm run build
npm run lint
npm run test

# Frontend
npm run build
npm run type-check
```

## Próximos Pasos

1. [ ] Integrar en navegación admin
2. [ ] Configurar carga de archivos
3. [ ] Implementar WebSockets
4. [ ] Testing de endpoints
5. [ ] Deployment

---

**Documentación completa**: Ver MODULES_SUMMARY.md
**Checklist**: Ver IMPLEMENTATION_CHECKLIST.md
**Archivos creados**: Ver ARCHIVOS_CREADOS.txt
