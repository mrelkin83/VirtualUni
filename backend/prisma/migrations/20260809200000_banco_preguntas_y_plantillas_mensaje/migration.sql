-- Banco de preguntas y plantillas de mensaje.
--
-- CAUSA: ambos existían como editores completos en el panel del docente, pero
-- sin modelo donde guardarlos. Las preguntas solo viven en la base atadas a un
-- examen concreto (exam_questions), de modo que un banco reutilizable no tenía
-- dónde persistir, y las plantillas de mensaje tampoco.
--
-- CONSECUENCIA: crear, editar o borrar una pregunta del banco o una plantilla
-- anunciaba éxito y se perdía al recargar la página.
CREATE TABLE "question_bank" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'multiple',
    "pregunta" TEXT NOT NULL,
    "opciones" TEXT[],
    "respuesta_correcta" INTEGER,
    "puntos" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "categoria" TEXT NOT NULL DEFAULT 'General',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "question_bank_tenant_id_idx" ON "question_bank"("tenant_id");

CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "autor_id" TEXT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'general',
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "message_templates_tenant_id_idx" ON "message_templates"("tenant_id");
