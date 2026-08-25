-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('TECNOLOGIA', 'MOBILIARIO', 'EQUIPAMIENTO', 'VEHICULO', 'OTRO');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'DANADO');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('DISPONIBLE', 'AGOTADO', 'BAJO', 'DESCONTINUADO');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVO', 'INACTIVO', 'VACACIONES', 'INCAPACIDAD');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('BORRADOR', 'PROCESADO', 'PAGADO');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INDEFINIDO', 'FIJO', 'PRESTACION', 'PASANTIA');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('SOLTERO', 'CASADO', 'UNION_LIBRE', 'DIVORCIADO', 'VIUDO');

-- CreateEnum
CREATE TYPE "VacationStatus" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "UserCardType" AS ENUM ('ESTUDIANTE', 'DOCENTE', 'ADMINISTRATIVO');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVO', 'VENCIDO', 'BLOQUEADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "IssuanceType" AS ENUM ('NUEVA_EMISION', 'RENOVACION', 'REEMPLAZO', 'MASIVA');

-- CreateEnum
CREATE TYPE "IssuanceStatus" AS ENUM ('PROCESANDO', 'COMPLETADO', 'COMPLETADO_CON_ERRORES', 'FALLIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('BORRADOR', 'PUBLICADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('BORRADOR', 'PROGRAMADO', 'ENVIADO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "AccountCategory" AS ENUM ('EFECTIVO', 'BANCO', 'CUENTAS_POR_COBRAR', 'CUENTAS_POR_PAGAR', 'MATRICULAS', 'CERTIFICADOS', 'NOMINA', 'SERVICIOS', 'INFRAESTRUCTURA', 'OTROS');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('ACTIVO', 'COMPLETADO', 'EXCEDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StudentInvoiceStatus" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'CANCELADA', 'PARCIAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'PSE', 'OTRO');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "AssetCategory" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valor_compra" DOUBLE PRECISION NOT NULL,
    "valor_actual" DOUBLE PRECISION NOT NULL,
    "fecha_compra" TIMESTAMP(3) NOT NULL,
    "estado" "AssetStatus" NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "imagen_url" TEXT,
    "numero_serie" TEXT,
    "proveedor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidad_minima" INTEGER NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "fecha_ultima_compra" TIMESTAMP(3) NOT NULL,
    "estado" "InventoryStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "tipo" "MovementType" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_employees" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "salario_base" DOUBLE PRECISION NOT NULL,
    "cuenta_bancaria" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "estado" "EmployeeStatus" NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "empleado_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "salario_base" DOUBLE PRECISION NOT NULL,
    "bonificaciones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deducciones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salario_neto" DOUBLE PRECISION NOT NULL,
    "estado" "PayrollStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL,
    "tipo_contrato" "ContractType" NOT NULL,
    "salario" DOUBLE PRECISION NOT NULL,
    "estado" "EmployeeStatus" NOT NULL,
    "direccion" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "genero" "Gender" NOT NULL,
    "estado_civil" "CivilStatus" NOT NULL,
    "contacto_emergencia_nombre" TEXT NOT NULL,
    "contacto_emergencia_telefono" TEXT NOT NULL,
    "contacto_emergencia_relacion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "empleado_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "dias_solicitados" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "VacationStatus" NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_cards" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "tipo_usuario" "UserCardType" NOT NULL,
    "numero_carnet" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "CardStatus" NOT NULL,
    "foto_url" TEXT NOT NULL,
    "qr_code" TEXT,
    "template_id" TEXT,
    "issuance_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipos_usuario" TEXT[],
    "layout_config" JSONB NOT NULL,
    "campos" JSONB NOT NULL,
    "ancho" DOUBLE PRECISION NOT NULL DEFAULT 85.6,
    "alto" DOUBLE PRECISION NOT NULL DEFAULT 53.98,
    "orientacion" TEXT NOT NULL DEFAULT 'horizontal',
    "color_primario" TEXT NOT NULL DEFAULT '#3B82F6',
    "color_secundario" TEXT NOT NULL DEFAULT '#1E40AF',
    "color_texto" TEXT NOT NULL DEFAULT '#FFFFFF',
    "fuente_principal" TEXT NOT NULL DEFAULT 'Arial',
    "fuente_secundaria" TEXT NOT NULL DEFAULT 'Arial',
    "logo_url" TEXT,
    "fondo_frontal_url" TEXT,
    "fondo_posterior_url" TEXT,
    "es_activa" BOOLEAN NOT NULL DEFAULT true,
    "es_predeterminada" BOOLEAN NOT NULL DEFAULT false,
    "incluir_qr" BOOLEAN NOT NULL DEFAULT true,
    "incluir_codigo_barras" BOOLEAN NOT NULL DEFAULT false,
    "dobles_cara" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "creado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_issuances" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "template_id" TEXT,
    "lote" TEXT NOT NULL,
    "tipo_expedicion" "IssuanceType" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidad_exitosa" INTEGER NOT NULL DEFAULT 0,
    "cantidad_fallida" INTEGER NOT NULL DEFAULT 0,
    "expedido_por" TEXT NOT NULL,
    "expedido_por_nombre" TEXT NOT NULL,
    "motivo" TEXT,
    "observaciones" TEXT,
    "estado" "IssuanceStatus" NOT NULL DEFAULT 'PROCESANDO',
    "pdf_url" TEXT,
    "archivo_zip_url" TEXT,
    "carnets_generados" TEXT[],
    "errores" JSONB,
    "fecha_expedicion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_completado" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_issuances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "prioridad" "AnnouncementPriority" NOT NULL,
    "estado" "AnnouncementStatus" NOT NULL,
    "adjuntos" TEXT[],
    "target_roles" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "solicitante_id" TEXT NOT NULL,
    "solicitante" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "ProcedureStatus" NOT NULL,
    "prioridad" "Priority" NOT NULL,
    "asignado_a" TEXT,
    "adjuntos" TEXT[],
    "respuesta" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mass_messages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "remitente" TEXT NOT NULL,
    "target_roles" TEXT[],
    "target_users" TEXT[],
    "adjuntos" TEXT[],
    "estado" "MessageStatus" NOT NULL,
    "programado" TIMESTAMP(3),
    "enviado_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mass_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TransactionType" NOT NULL,
    "categoria" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "metodo_pago" TEXT,
    "referencia" TEXT,
    "estudiante" TEXT,
    "descripcion" TEXT,
    "comprobante" TEXT,
    "estado" "TransactionStatus" NOT NULL,
    "creado_por" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "AccountType" NOT NULL,
    "categoria" "AccountCategory" NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "gastado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "periodo" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" "BudgetStatus" NOT NULL,
    "descripcion" TEXT,
    "alerta_en" INTEGER NOT NULL DEFAULT 80,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "estudiante" TEXT NOT NULL,
    "conceptos" TEXT[],
    "subtotal" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impuestos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "StudentInvoiceStatus" NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodo_pago" "PaymentMethod" NOT NULL,
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "comprobante" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assets_tenant_id_idx" ON "assets"("tenant_id");

-- CreateIndex
CREATE INDEX "assets_categoria_idx" ON "assets"("categoria");

-- CreateIndex
CREATE INDEX "assets_estado_idx" ON "assets"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "assets_tenant_id_codigo_key" ON "assets"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "inventory_items_tenant_id_idx" ON "inventory_items"("tenant_id");

-- CreateIndex
CREATE INDEX "inventory_items_categoria_idx" ON "inventory_items"("categoria");

-- CreateIndex
CREATE INDEX "inventory_items_estado_idx" ON "inventory_items"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_tenant_id_codigo_key" ON "inventory_items"("tenant_id", "codigo");

-- CreateIndex
CREATE INDEX "inventory_movements_tenant_id_idx" ON "inventory_movements"("tenant_id");

-- CreateIndex
CREATE INDEX "inventory_movements_item_id_idx" ON "inventory_movements"("item_id");

-- CreateIndex
CREATE INDEX "payroll_employees_tenant_id_idx" ON "payroll_employees"("tenant_id");

-- CreateIndex
CREATE INDEX "payroll_employees_estado_idx" ON "payroll_employees"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_employees_tenant_id_identificacion_key" ON "payroll_employees"("tenant_id", "identificacion");

-- CreateIndex
CREATE INDEX "payroll_records_tenant_id_idx" ON "payroll_records"("tenant_id");

-- CreateIndex
CREATE INDEX "payroll_records_empleado_id_idx" ON "payroll_records"("empleado_id");

-- CreateIndex
CREATE INDEX "payroll_records_periodo_idx" ON "payroll_records"("periodo");

-- CreateIndex
CREATE INDEX "employees_tenant_id_idx" ON "employees"("tenant_id");

-- CreateIndex
CREATE INDEX "employees_departamento_idx" ON "employees"("departamento");

-- CreateIndex
CREATE INDEX "employees_estado_idx" ON "employees"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_identificacion_key" ON "employees"("tenant_id", "identificacion");

-- CreateIndex
CREATE INDEX "vacation_requests_tenant_id_idx" ON "vacation_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "vacation_requests_empleado_id_idx" ON "vacation_requests"("empleado_id");

-- CreateIndex
CREATE INDEX "vacation_requests_estado_idx" ON "vacation_requests"("estado");

-- CreateIndex
CREATE INDEX "id_cards_tenant_id_idx" ON "id_cards"("tenant_id");

-- CreateIndex
CREATE INDEX "id_cards_usuario_id_idx" ON "id_cards"("usuario_id");

-- CreateIndex
CREATE INDEX "id_cards_estado_idx" ON "id_cards"("estado");

-- CreateIndex
CREATE INDEX "id_cards_template_id_idx" ON "id_cards"("template_id");

-- CreateIndex
CREATE INDEX "id_cards_issuance_id_idx" ON "id_cards"("issuance_id");

-- CreateIndex
CREATE UNIQUE INDEX "id_cards_tenant_id_numero_carnet_key" ON "id_cards"("tenant_id", "numero_carnet");

-- CreateIndex
CREATE INDEX "card_templates_tenant_id_idx" ON "card_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "card_templates_es_activa_idx" ON "card_templates"("es_activa");

-- CreateIndex
CREATE INDEX "card_templates_es_predeterminada_idx" ON "card_templates"("es_predeterminada");

-- CreateIndex
CREATE INDEX "card_issuances_tenant_id_idx" ON "card_issuances"("tenant_id");

-- CreateIndex
CREATE INDEX "card_issuances_lote_idx" ON "card_issuances"("lote");

-- CreateIndex
CREATE INDEX "card_issuances_estado_idx" ON "card_issuances"("estado");

-- CreateIndex
CREATE INDEX "card_issuances_tipo_expedicion_idx" ON "card_issuances"("tipo_expedicion");

-- CreateIndex
CREATE INDEX "card_issuances_fecha_expedicion_idx" ON "card_issuances"("fecha_expedicion");

-- CreateIndex
CREATE INDEX "card_issuances_expedido_por_idx" ON "card_issuances"("expedido_por");

-- CreateIndex
CREATE INDEX "announcements_tenant_id_idx" ON "announcements"("tenant_id");

-- CreateIndex
CREATE INDEX "announcements_estado_idx" ON "announcements"("estado");

-- CreateIndex
CREATE INDEX "announcements_prioridad_idx" ON "announcements"("prioridad");

-- CreateIndex
CREATE INDEX "procedures_tenant_id_idx" ON "procedures"("tenant_id");

-- CreateIndex
CREATE INDEX "procedures_estado_idx" ON "procedures"("estado");

-- CreateIndex
CREATE INDEX "procedures_solicitante_id_idx" ON "procedures"("solicitante_id");

-- CreateIndex
CREATE INDEX "mass_messages_tenant_id_idx" ON "mass_messages"("tenant_id");

-- CreateIndex
CREATE INDEX "mass_messages_estado_idx" ON "mass_messages"("estado");

-- CreateIndex
CREATE INDEX "transactions_tenant_id_idx" ON "transactions"("tenant_id");

-- CreateIndex
CREATE INDEX "transactions_tipo_idx" ON "transactions"("tipo");

-- CreateIndex
CREATE INDEX "transactions_estado_idx" ON "transactions"("estado");

-- CreateIndex
CREATE INDEX "transactions_fecha_idx" ON "transactions"("fecha");

-- CreateIndex
CREATE INDEX "accounts_tenant_id_idx" ON "accounts"("tenant_id");

-- CreateIndex
CREATE INDEX "accounts_tipo_idx" ON "accounts"("tipo");

-- CreateIndex
CREATE INDEX "accounts_activa_idx" ON "accounts"("activa");

-- CreateIndex
CREATE INDEX "budgets_tenant_id_idx" ON "budgets"("tenant_id");

-- CreateIndex
CREATE INDEX "budgets_estado_idx" ON "budgets"("estado");

-- CreateIndex
CREATE INDEX "budgets_periodo_idx" ON "budgets"("periodo");

-- CreateIndex
CREATE INDEX "student_invoices_tenant_id_idx" ON "student_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "student_invoices_estado_idx" ON "student_invoices"("estado");

-- CreateIndex
CREATE INDEX "student_invoices_estudiante_idx" ON "student_invoices"("estudiante");

-- CreateIndex
CREATE INDEX "student_payments_tenant_id_idx" ON "student_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "student_payments_invoice_id_idx" ON "student_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "student_payments_metodo_pago_idx" ON "student_payments"("metodo_pago");

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "payroll_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_requests" ADD CONSTRAINT "vacation_requests_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "card_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "id_cards" ADD CONSTRAINT "id_cards_issuance_id_fkey" FOREIGN KEY ("issuance_id") REFERENCES "card_issuances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_issuances" ADD CONSTRAINT "card_issuances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "card_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "student_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

