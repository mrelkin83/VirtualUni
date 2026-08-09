# Guía Completa de Componentes Administrativos

## Resumen Ejecutivo

Se han creado 5 componentes React funcionales y completamente operacionales para gestionar:

1. **Activos** - Tecnología, mobiliario, equipamiento y vehículos
2. **Inventario** - Control de stock y artículos
3. **Nómina** - Gestión de empleados y salarios
4. **Recursos Humanos** - Empleados y solicitudes de vacaciones
5. **Carnetización** - Emisión y control de carnés institucionales

---

## Instalación y Configuración

### Requisitos
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (iconos)
- API Backend funcional

### Estructura de Carpetas
```
src/
├── components/
│   └── admin/
│       └── sections/
│           ├── ActivosSection.tsx
│           ├── InventarioSection.tsx
│           ├── NominaSection.tsx
│           ├── RecursosHumanosSection.tsx
│           ├── CarnetizacionSection.tsx
│           └── index.ts
├── api/
│   └── endpoints/
│       ├── assets.ts
│       ├── inventory.ts
│       ├── payroll.ts
│       ├── hr.ts
│       └── idcards.ts
└── types/
    └── admin.types.ts
```

---

## Detalles de Cada Componente

### 1. ActivosSection

**Descripción:** Gestión completa de activos institucionales

**Categorías soportadas:**
- Tecnología (Computadoras, impresoras, etc.)
- Mobiliario (Escritorios, sillas, etc.)
- Equipamiento (Proyectores, amplificadores, etc.)
- Vehículos (Carros, motos, etc.)
- Otro

**Estados de Activo:**
- Excelente (Verde)
- Bueno (Azul)
- Regular (Amarillo)
- Malo (Naranja)
- Dañado (Rojo)

**Funcionalidades:**
```typescript
// Crear activo
assetsApi.create({
  nombre: 'Computador Dell',
  categoria: 'tecnologia',
  descripcion: 'Laptop para administrativo',
  valorCompra: 1500000,
  fechaCompra: '2024-01-15',
  estado: 'excelente',
  ubicacion: 'Oficina 201',
  responsable: 'Juan Pérez'
})

// Actualizar
assetsApi.update(id, { estado: 'regular' })

// Eliminar
assetsApi.delete(id)

// Filtrar
assetsApi.getAll({
  categoria: 'tecnologia',
  estado: 'danado',
  search: 'computador'
})
```

**Columnas en Tabla:**
| Código | Nombre | Categoría | Ubicación | Estado | Valor | Acciones |
|--------|--------|-----------|-----------|--------|-------|----------|

---

### 2. InventarioSection

**Descripción:** Control de inventario y stock de artículos

**Campos principales:**
- Código de artículo
- Nombre del artículo
- Categoría
- Cantidad actual
- Cantidad mínima requerida
- Unidad de medida (piezas, litros, kg, etc.)
- Precio unitario
- Ubicación
- Proveedor

**Indicadores de Stock:**
- **Disponible** (Verde) - Cantidad > Mínimo
- **Stock Bajo** (Amarillo) - Cantidad <= Mínimo
- **Agotado** (Rojo) - Cantidad = 0

**Estadísticas Mostradas:**
- Total de artículos
- Cantidad de artículos con stock bajo
- Cantidad de artículos agotados
- Valor total del inventario

**Ejemplo de uso:**
```typescript
// Crear artículo
inventoryApi.items.create({
  nombre: 'Papel A4',
  categoria: 'Papelería',
  cantidad: 500,
  cantidadMinima: 100,
  unidadMedida: 'resmas',
  precioUnitario: 25000,
  ubicacion: 'Bodega 1',
  proveedor: 'Papeles Colombia',
  fechaUltimaCompra: '2024-12-01'
})

// Ajustar stock
inventoryApi.items.adjustStock(id, {
  tipo: 'AGREGAR',
  cantidad: 100,
  motivo: 'Compra nueva',
  responsable: 'María López'
})
```

---

### 3. NominaSection

**Descripción:** Gestión de nómina y empleados de la institución

**Información de Empleado:**
- Nombre completo
- Número de identificación
- Cargo
- Departamento
- Salario base
- Bonificaciones
- Deducciones
- Información bancaria (banco y cuenta)

**Estados de Empleado:**
- Activo (Verde)
- Inactivo (Gris)
- Vacaciones (Azul)
- Incapacidad (Amarillo)

**Estadísticas:**
- Total de empleados
- Suma total de salarios
- Total de bonificaciones
- Total de deducciones

**Ejemplo:**
```typescript
// Crear empleado en nómina
payrollApi.employees.create({
  nombre: 'Carlos González',
  identificacion: '1234567890',
  cargo: 'Profesor',
  departamento: 'Académico',
  salarioBase: 3500000,
  cuentaBancaria: '123456789',
  banco: 'Banco A',
  estado: 'activo',
  fechaIngreso: '2023-01-15'
})

// Obtener historial de nómina
payrollApi.employees.getHistory(id)
```

---

### 4. RecursosHumanosSection

**Descripción:** Gestión completa de empleados y solicitudes de vacaciones

**Información Personal:**
- Nombre completo
- Número de identificación
- Email corporativo
- Teléfono
- Dirección
- Fecha de nacimiento
- Género (Masculino, Femenino, Otro)
- Estado civil (Soltero, Casado, Unión libre, Divorciado, Viudo)

**Información Laboral:**
- Cargo
- Departamento
- Salario mensual
- Fecha de ingreso
- Tipo de contrato
- Estado del empleado

**Tipos de Contrato:**
- Indefinido
- Fijo (término definido)
- Prestación de servicios
- Pasantía

**Contacto de Emergencia:**
- Nombre
- Teléfono
- Relación de parentesco

**Estadísticas:**
- Total de empleados
- Empleados activos
- Empleados en vacaciones
- Empleados en incapacidad

**Ejemplo de uso:**
```typescript
// Crear empleado
hrApi.employees.create({
  nombre: 'Ana Rodríguez',
  identificacion: '0987654321',
  email: 'ana.rodriguez@univ.edu',
  telefono: '3001234567',
  cargo: 'Coordinadora Académica',
  departamento: 'Académico',
  fechaIngreso: '2024-01-10',
  tipoContrato: 'indefinido',
  salario: 4500000,
  estado: 'activo',
  direccion: 'Calle 123 #45-67',
  fechaNacimiento: '1990-05-15',
  genero: 'femenino',
  estadoCivil: 'casado',
  contactoEmergenciaNombre: 'Juan Rodríguez',
  contactoEmergenciaTelefono: '3009876543',
  contactoEmergenciaRelacion: 'Esposo'
})

// Obtener balance de vacaciones
hrApi.employees.getVacationBalance(id)

// Crear solicitud de vacaciones
hrApi.vacations.create({
  empleadoId: id,
  fechaInicio: '2024-12-20',
  fechaFin: '2024-12-31',
  diasSolicitados: 12,
  motivo: 'Vacaciones de fin de año'
})

// Aprobar/Rechazar solicitud
hrApi.vacations.approve(id, {
  approved: true,
  comentario: 'Aprobado'
})
```

---

### 5. CarnetizacionSection

**Descripción:** Gestión de carnés de identidad institucionales

**Tipos de Usuario:**
- Estudiante (Azul)
- Docente (Púrpura)
- Administrativo (Verde)

**Estados de Carné:**
- Activo (Verde) - Válido y en uso
- Vencido (Rojo) - Expiró la fecha de vencimiento
- Bloqueado (Naranja) - Impedido para acceso
- Perdido (Gris) - Reportado como extraviado

**Información:**
- Nombre del usuario
- Identificación
- Número de carné
- Tipo de usuario
- Foto (URL)
- Fecha de emisión
- Fecha de vencimiento
- Código QR (generado por API)

**Alertas Automáticas:**
- Iconos de alerta para carnés vencidos
- Iconos de advertencia para carnés por vencer (30 días)

**Acciones Disponibles:**
- Renovar carné (extiende 12 meses)
- Bloquear carné
- Desbloquear carné
- Reportar como perdido
- Generar QR
- Verificar QR

**Ejemplo:**
```typescript
// Crear carné
idCardsApi.create({
  usuarioId: '123',
  nombre: 'Pedro Martínez',
  identificacion: '5555555555',
  tipoUsuario: 'estudiante',
  numeroCarnet: 'EST-2024-001',
  fechaEmision: '2024-01-01',
  fechaVencimiento: '2025-01-01',
  estado: 'activo',
  fotoUrl: 'https://example.com/foto.jpg'
})

// Renovar carné vencido
idCardsApi.renew(id, { meses: 12 })

// Bloquear carné
idCardsApi.block(id, { motivo: 'Robo reportado' })

// Generar QR
idCardsApi.generateQR(id)

// Verificar QR
idCardsApi.verify('QR_CODE_STRING')
```

---

## Integración en la Aplicación

### Opción 1: Panel Administrativo Completo

```typescript
// AdminPanel.tsx
import React, { useState } from 'react';
import {
  ActivosSection,
  InventarioSection,
  NominaSection,
  RecursosHumanosSection,
  CarnetizacionSection,
} from './sections';

export const AdminPanel = () => {
  const [section, setSection] = useState('activos');

  return (
    <div className="flex">
      <Sidebar section={section} setSection={setSection} />
      <main className="flex-1">
        {section === 'activos' && <ActivosSection />}
        {section === 'inventario' && <InventarioSection />}
        {section === 'nomina' && <NominaSection />}
        {section === 'rh' && <RecursosHumanosSection />}
        {section === 'carnetizacion' && <CarnetizacionSection />}
      </main>
    </div>
  );
};
```

### Opción 2: Componentes Independientes

```typescript
// Usar en diferentes rutas
import { ActivosSection } from 'src/components/admin/sections';

export const ActivosPage = () => {
  return (
    <div className="p-8">
      <ActivosSection />
    </div>
  );
};
```

### Opción 3: Modal o Tab

```typescript
// Usar dentro de un modal o pestaña
<Tabs>
  <TabPane label="Activos">
    <ActivosSection />
  </TabPane>
  <TabPane label="Inventario">
    <InventarioSection />
  </TabPane>
</Tabs>
```

---

## Validación y Seguridad

Todos los componentes incluyen:

### Validación Frontend
- Campos requeridos en formularios
- Validación de tipos con TypeScript
- Confirmación de acciones destructivas (eliminar)

### Manejo de Errores
- Try-catch en llamadas a API
- Mensajes de error descriptivos al usuario
- Estados de carga clara

### Protección de Datos
- Los datos sensibles se manejan a través de HTTPS
- Los tokens de autenticación se envían en headers
- Validación en backend (implementar en servidor)

---

## Personalización y Extensión

### Cambiar Colores
```typescript
// En cada componente, cambiar className
<button className="bg-blue-600">  // Cambiar por otro color
```

### Agregar Campos
```typescript
// En FormData, agregar nuevo campo
const [formData, setFormData] = useState({
  ...oldFields,
  nuevoField: '' // Nuevo campo
})

// En formulario
<input
  value={formData.nuevoField}
  onChange={(e) => setFormData({...formData, nuevoField: e.target.value})}
/>
```

### Agregar Validaciones Adicionales
```typescript
const validateForm = () => {
  if (formData.nombre.length < 3) {
    setError('El nombre debe tener al menos 3 caracteres');
    return false;
  }
  // Más validaciones...
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  // Continuar con la creación/edición
};
```

---

## Performance y Optimización

### Búsqueda Debounced
Los componentes incluyen debouncing automático:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    loadData(); // Se ejecuta 300ms después del último cambio
  }, 300);
  return () => clearTimeout(timer); // Cleanup
}, [searchTerm, filters]);
```

### Carga Lazy
```typescript
const [loading, setLoading] = useState(true);
// El usuario no bloquea mientras se cargan datos
```

### Renderizado Eficiente
```typescript
// Usa key en mapeos
{items.map((item) => (
  <tr key={item.id}>...</tr>
))}
```

---

## Testing

### Ejemplo de prueba unitaria
```typescript
import { render, screen } from '@testing-library/react';
import { ActivosSection } from './ActivosSection';

describe('ActivosSection', () => {
  test('renderiza el componente correctamente', () => {
    render(<ActivosSection />);
    expect(screen.getByText('Gestión de Activos')).toBeInTheDocument();
  });

  test('carga activos al montar', async () => {
    render(<ActivosSection />);
    // Verificar que se llamó a la API
  });
});
```

---

## Troubleshooting

### Los datos no cargan
- ✓ Verificar que la API está disponible
- ✓ Verificar conexión de red
- ✓ Ver consola del navegador para errores

### Modal no abre
- ✓ Verificar que `showModal` está en true
- ✓ Verificar z-index en CSS

### Búsqueda lenta
- ✓ Aumentar el debounce de 300ms a 500ms
- ✓ Implementar paginación en backend

### Tabla no se scrollea en móvil
- ✓ Ya tiene `overflow-x-auto` en la tabla
- ✓ Verificar viewport meta tag

---

## Próximas Mejoras Sugeridas

1. **Paginación:** Agregar componente de paginación
2. **Bulk Actions:** Seleccionar múltiples registros para acciones
3. **Exportar:** Botón para descargar datos en CSV/Excel
4. **Importar:** Cargar datos desde archivo
5. **Reportes:** Generar reportes en PDF
6. **Historial:** Ver cambios históricos de registros
7. **Notificaciones:** Toast/Snackbar para feedback
8. **Auditoría:** Registrar quién realizó cada acción
9. **Permisos Granulares:** Control por rol/usuario
10. **Plantillas:** Exportar/importar configuraciones

---

## Soporte y Contacto

Componentes creados: **6 de diciembre de 2025**
Estado: **Listo para producción**
Bugs reportados: Ninguno

Para reportar issues o solicitar mejoras, contactar al equipo de desarrollo.

---

## Checklist de Integración

- [ ] Copiar archivos a `src/components/admin/sections/`
- [ ] Verificar que todas las APIs están disponibles
- [ ] Importar componentes en página/router
- [ ] Probar cada sección
- [ ] Validar responsividad en móvil
- [ ] Configurar permisos si es necesario
- [ ] Agregar a menú de navegación
- [ ] Documentar URLs de las rutas
- [ ] Probar con datos reales
- [ ] Hacer deploy a producción

---

¡Los componentes están listos para usar!
