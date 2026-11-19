/**
 * Primitivas de Pensum.
 *
 * Ninguna recibe `darkMode`, `card`, `text` ni `border` como props: leen los
 * tokens directamente (ver src/index.css). Esa es la diferencia de fondo con
 * teacher/ui/StatsCard y con todo lo que hay hoy.
 */

export { Button, IconButton } from './Button';
export type {
  BotonProps,
  IconButtonProps,
  TamanoBoton,
  VarianteBoton,
} from './Button';

export { Checkbox, Field, Input, Select, Textarea, Toggle } from './Field';
export type {
  CheckboxProps,
  FieldProps,
  InputProps,
  SelectProps,
  TextareaProps,
  ToggleProps,
} from './Field';

export {
  Badge,
  Card,
  CountUp,
  Ring,
  Segmented,
  StatCard,
  StatusPill,
} from './Surface';
export type {
  BadgeProps,
  CardProps,
  CountUpProps,
  OpcionSegmentada,
  RingProps,
  SegmentedProps,
  StatCardProps,
  StatusPillProps,
  TonoBadge,
} from './Surface';

export {
  ConfirmDialog,
  EmptyState,
  Skeleton,
  SkeletonTexto,
  ToastProvider,
} from './Feedback';
export type {
  ConfirmDialogProps,
  EmptyStateProps,
  SkeletonProps,
  SkeletonTextoProps,
} from './Feedback';

export { useToast, avisar, confirmar } from './avisos';
export type { ApiAvisos, OpcionesConfirmar, TonoAviso } from './avisos';

export { Drawer, Modal } from './Modal';
export type { DrawerProps, ModalProps, TamanoModal } from './Modal';

export { DataTable } from './DataTable';
export type { ColumnaTabla, DataTableProps } from './DataTable';

export { cn } from './cn';
export type { ValorClase } from './cn';
