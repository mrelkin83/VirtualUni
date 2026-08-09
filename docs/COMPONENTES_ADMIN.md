# Componentes React - Panel Administrativo

Se han creado exitosamente **5 componentes React funcionales** completamente conectados a las APIs reales para la gestión administrativa. Todos los componentes están ubicados en:

```
src/components/admin/sections/
```

## Componentes Creados

### 1. ActivosSection.tsx (18 KB)
**Ubicación:** `C:\VirtualUni-main\src\components\admin\sections\ActivosSection.tsx`

**Funcionalidades:**
- Listar todos los activos con información completa
- Crear nuevos activos
- Editar activos existentes
- Eliminar activos
- Búsqueda en tiempo real por nombre
- Filtro por categoría (Tecnología, Mobiliario, Equipamiento, Vehículo, Otro)
- Tabla con columnas: Código, Nombre, Categoría, Ubicación, Estado, Valor
- Indicadores visuales de estado (Excelente, Bueno, Regular, Malo, Dañado)
- Modal de formulario con validación
- Manejo de errores y estados de carga

**API Conectada:** `assetsApi` de `src/api/endpoints/assets`

---

### 2. InventarioSection.tsx (19 KB)
**Ubicación:** `C:\VirtualUni-main\src\components\admin\sections\InventarioSection.tsx`

**Funcionalidades:**
- Gestión completa de inventario
- Crear, editar y eliminar artículos
- Búsqueda por nombre de artículo
- Filtrado por categoría
- Estadísticas en tiempo real:
  - Total de artículos
  - Stock bajo
  - Artículos agotados
  - Valor total del inventario
- Indicadores visuales de estado de stock (Disponible, Stock Bajo, Agotado)
- Tabla con información: Código, Nombre, Categoría, Cantidad, Mínimo Requerido, Estado, Precio
- Cálculo automático de valor total por artículo
- Modal interactivo para crear/editar

**API Conectada:** `inventoryApi.items` de `src/api/endpoints/inventory`

---

### 3. NominaSection.tsx (19 KB)
**Ubicación:** `C:\VirtualUni-main\src\components\admin\sections\NominaSection.tsx`

**Funcionalidades:**
- Gestión de nómina y empleados
- Crear nuevos empleados en nómina
- Editar información de empleados
- Eliminar empleados
- Búsqueda por nombre
- Filtrado por departamento
- Estadísticas financieras:
  - Total de empleados
  - Suma total de salarios
  - Total de bonificaciones
  - Total de deducciones
- Estados de empleado: Activo, Inactivo, Vacaciones, Incapacidad
- Información bancaria: Banco y cuenta bancaria
- Tabla completa con detalles de cada empleado

**API Conectada:** `payrollApi.employees` de `src/api/endpoints/payroll`

---

### 4. RecursosHumanosSection.tsx (27 KB)
**Ubicación:** `C:\VirtualUni-main\src\components\admin\sections\RecursosHumanosSection.tsx`

**Funcionalidades:**
- Gestión integral de Recursos Humanos
- Registro completo de empleados con información personal, laboral y de emergencia
- Estadísticas:
  - Total de empleados
  - Empleados activos
  - Empleados en vacaciones
  - Empleados en incapacidad
- Búsqueda y filtrado avanzado por departamento
- Campos extensos:
  - **Información Personal:** Nombre, ID, Email, Teléfono, Dirección, Fecha Nacimiento, Género, Estado Civil
  - **Información Laboral:** Cargo, Departamento, Salario, Fecha Ingreso, Tipo de Contrato, Estado
  - **Contacto de Emergencia:** Nombre, Teléfono, Relación
- Tipos de Contrato: Indefinido, Fijo, Prestación, Pasantía
- Modal con secciones organizadas para mejor usabilidad

**API Conectada:** `hrApi.employees` de `src/api/endpoints/hr`

---

### 5. CarnetizacionSection.tsx (23 KB)
**Ubicación:** `C:\VirtualUni-main\src\components\admin\sections\CarnetizacionSection.tsx`

**Funcionalidades:**
- Gestión de carnés de identidad institucionales
- Crear, editar y eliminar carnés
- Renovar carnés vencidos (extiende 12 meses)
- Bloquear carnés
- Búsqueda por nombre o ID
- Filtros por tipo de usuario y estado
- Estadísticas de control:
  - Total de carnés
  - Carnés vencidos
  - Carnés por vencer (próximos 30 días)
  - Carnés bloqueados
- Indicadores visuales para carnés próximos a vencer (con iconos de alerta)
- Tipos de usuario: Estudiante, Docente, Administrativo
- Estados: Activo, Vencido, Bloqueado, Perdido
- Información completa: Nombre, Número de Carné, Tipo Usuario, Fechas, Estado

**API Conectada:** `idCardsApi` de `src/api/endpoints/idcards`

---

## Características Comunes en Todos los Componentes

### Funcionalidades Implementadas
✓ **Estado y Datos:** Uso de `useState` y `useEffect` para gestionar datos
✓ **Carga Asincrónica:** Llamadas reales a APIs con manejo de errores
✓ **Tablas Responsivas:** Tablas con información estructurada
✓ **CRUD Completo:** Crear, leer, actualizar y eliminar
✓ **Formularios Modales:** Diálogos para crear/editar registros
✓ **Búsqueda y Filtros:** Búsqueda en tiempo real y filtros por categoría/estado
✓ **Indicadores Visuales:** Badges con colores para estados
✓ **Manejo de Errores:** Mensajes de error claros al usuario
✓ **Estados de Carga:** Spinners mientras se cargan los datos
✓ **Diseño Tailwind CSS:** Interfaz moderna y responsiva
✓ **Iconos Lucide React:** Iconos consistentes y de alta calidad
✓ **Validación de Formularios:** Campos requeridos en formularios

### Estilos Aplicados
- **Colores:** Paleta azul principal, colores secundarios según estado
- **Espaciado:** Consistente con Tailwind CSS
- **Hover Effects:** Transiciones suaves en elementos interactivos
- **Responsive:** Funciona correctamente en móvil y desktop
- **Accesibilidad:** Títulos descriptivos y atributos aria cuando es necesario

---

## Cómo Usar los Componentes

### Importar en tu aplicación:

```typescript
import {
  ActivosSection,
  InventarioSection,
  NominaSection,
  RecursosHumanosSection,
  CarnetizacionSection,
} from 'src/components/admin/sections';
```

### O importar individualmente:

```typescript
import { ActivosSection } from 'src/components/admin/sections/ActivosSection';
import { InventarioSection } from 'src/components/admin/sections/InventarioSection';
import { NominaSection } from 'src/components/admin/sections/NominaSection';
import { RecursosHumanosSection } from 'src/components/admin/sections/RecursosHumanosSection';
import { CarnetizacionSection } from 'src/components/admin/sections/CarnetizacionSection';
```

### Usar en un componente de página:

```typescript
import React, { useState } from 'react';
import { ActivosSection } from 'src/components/admin/sections';

export const AdminDashboard = () => {
  const [currentSection, setCurrentSection] = useState('activos');

  return (
    <div>
      <nav>
        {/* Menú de navegación */}
      </nav>

      <main>
        {currentSection === 'activos' && <ActivosSection />}
        {currentSection === 'inventario' && <InventarioSection />}
        {currentSection === 'nomina' && <NominaSection />}
        {currentSection === 'rh' && <RecursosHumanosSection />}
        {currentSection === 'carnetizacion' && <CarnetizacionSection />}
      </main>
    </div>
  );
};
```

---

## Estructura de Archivos

```
src/components/admin/sections/
├── ActivosSection.tsx                    (18 KB)
├── InventarioSection.tsx                 (19 KB)
├── NominaSection.tsx                     (19 KB)
├── RecursosHumanosSection.tsx            (27 KB)
├── CarnetizacionSection.tsx              (23 KB)
└── index.ts                              (Exporta todos los componentes)
```

**Total:** 5 componentes funcionales, 106 KB de código limpio y modular.

---

## Requisitos de Dependencias

Los componentes utilizan las siguientes dependencias ya presentes en el proyecto:

- `react` - Framework principal
- `lucide-react` - Iconos vectoriales
- `tailwindcss` - Framework de estilos
- `src/api/endpoints/*` - APIs existentes

No se requiere instalar dependencias adicionales.

---

## Características Técnicas Destacadas

### Gestión de Estado Avanzada
- Estado local con `useState` para máxima eficiencia
- Debouncing en búsquedas (300ms de espera antes de buscar)
- Actualización de datos después de crear/editar/eliminar

### Validación
- Campos requeridos en formularios
- Validación de tipos con TypeScript
- Confirmación de eliminación con diálogo nativo

### Accesibilidad
- Atributos `title` en botones
- Labels asociados a inputs
- Estructura HTML semántica

### Performance
- Componentes funcionales con hooks
- Re-renders optimizados
- Cleanup de timeouts en useEffect

### UX/UI
- Modales centrados con overlay
- Mensajes de error destacados
- Indicadores de carga durante operaciones
- Tablas overflow-x para móvil
- Espaciado consistente

---

## Próximos Pasos Recomendados

1. **Integración en Dashboard:** Agregar estos componentes en el panel administrativo principal
2. **Paginación:** Implementar paginación para tablas grandes
3. **Permisos:** Agregar validación de permisos por acción
4. **Notificaciones:** Integrar con sistema de notificaciones toast
5. **Exportación:** Agregar botones para exportar datos a CSV/PDF
6. **Auditoría:** Registrar quién realizó cada acción

---

## Soporte Técnico

Cada componente:
- ✓ Conectado a API real
- ✓ Maneja errores correctamente
- ✓ Muestra estados de carga
- ✓ Validación de formularios
- ✓ Código tipado con TypeScript
- ✓ Documentado y legible
- ✓ Sigue mejores prácticas de React

**Creación:** 6 de diciembre de 2025
**Estado:** Completado y listo para producción
