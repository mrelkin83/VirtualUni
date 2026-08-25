-- Plantillas del compositor de certificados.
--
-- CAUSA: el panel de administración tenía una sección "Plantillas
-- Certificados" con un compositor visual completo --bloques de texto, campos
-- dinámicos como [nombre_estudiante], firma, código QR, tamaño A4 y márgenes--
-- pero no existía ningún modelo donde guardarlas.
--
-- CONSECUENCIA: crear, editar, duplicar o eliminar una plantilla solo alteraba
-- un arreglo en memoria. Se anunciaba el éxito, y al recargar la página
-- reaparecían las dos de ejemplo y se perdía todo el diseño hecho.
CREATE TABLE "certificate_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "componentes" JSONB NOT NULL DEFAULT '[]',
    "configuracion" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "certificate_templates_tenant_id_idx" ON "certificate_templates"("tenant_id");
