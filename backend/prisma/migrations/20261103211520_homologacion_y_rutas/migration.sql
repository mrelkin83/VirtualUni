-- CreateEnum
CREATE TYPE "RecordOrigin" AS ENUM ('CURSADA', 'RECONOCIMIENTO_INTERNO', 'HOMOLOGACION_EQUIVALENCIA', 'RECONOCIMIENTO_EXTERNO', 'VALIDACION_SUFICIENCIA');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('VIGENTE', 'ANULADO');

-- CreateEnum
CREATE TYPE "HomologationType" AS ENUM ('EQUIVALENCIA_INTERNA', 'EXTERNA', 'VALIDACION_SUFICIENCIA');

-- CreateEnum
CREATE TYPE "HomologationStatus" AS ENUM ('SOLICITADA', 'EN_REVISION', 'APROBADA', 'APROBADA_PARCIAL', 'RECHAZADA');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "grades_closed_at" TIMESTAMP(3),
ADD COLUMN     "grades_closed_by_id" TEXT;

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "grade_scale_max" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
ADD COLUMN     "hours_per_credit" INTEGER NOT NULL DEFAULT 48,
ADD COLUMN     "max_recognition_pct" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "min_recognition_grade" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
ADD COLUMN     "passing_grade" DOUBLE PRECISION NOT NULL DEFAULT 3.0;

-- AlterTable
ALTER TABLE "study_plan_subjects" ADD COLUMN     "block_id" TEXT,
ADD COLUMN     "practical_hours" INTEGER,
ADD COLUMN     "theoretical_hours" INTEGER;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "practical_hours" INTEGER,
ADD COLUMN     "theoretical_hours" INTEGER;

-- CreateTable
CREATE TABLE "student_subject_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "course_id" TEXT,
    "academic_period_id" TEXT,
    "origin" "RecordOrigin" NOT NULL,
    "final_grade" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL,
    "credits_snapshot" INTEGER,
    "hours_snapshot" INTEGER,
    "status" "RecordStatus" NOT NULL DEFAULT 'VIGENTE',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "source_record_id" TEXT,
    "source_request_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_subject_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_equivalences" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "source_subject_id" TEXT NOT NULL,
    "target_subject_id" TEXT NOT NULL,
    "bidirectional" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "subject_equivalences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homologation_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "program_enrollment_id" TEXT NOT NULL,
    "type" "HomologationType" NOT NULL,
    "status" "HomologationStatus" NOT NULL DEFAULT 'SOLICITADA',
    "origin_institution" TEXT,
    "support_files" TEXT[],
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "decision_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homologation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homologation_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "target_subject_id" TEXT NOT NULL,
    "origin_name" TEXT,
    "origin_hours" INTEGER,
    "origin_grade" DOUBLE PRECISION,
    "decision" TEXT,
    "decision_notes" TEXT,

    CONSTRAINT "homologation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plan_blocks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "study_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "certifiable" BOOLEAN NOT NULL DEFAULT true,
    "certificate_template_id" TEXT,
    "competency_standard_code" TEXT,

    CONSTRAINT "study_plan_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_subject_records_tenant_id_idx" ON "student_subject_records"("tenant_id");

-- CreateIndex
CREATE INDEX "student_subject_records_student_id_subject_id_idx" ON "student_subject_records"("student_id", "subject_id");

-- CreateIndex
CREATE INDEX "student_subject_records_course_id_idx" ON "student_subject_records"("course_id");

-- CreateIndex
CREATE INDEX "subject_equivalences_tenant_id_idx" ON "subject_equivalences"("tenant_id");

-- CreateIndex
CREATE INDEX "subject_equivalences_target_subject_id_idx" ON "subject_equivalences"("target_subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_equivalences_source_subject_id_target_subject_id_key" ON "subject_equivalences"("source_subject_id", "target_subject_id");

-- CreateIndex
CREATE INDEX "homologation_requests_tenant_id_idx" ON "homologation_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "homologation_requests_student_id_idx" ON "homologation_requests"("student_id");

-- CreateIndex
CREATE INDEX "homologation_items_tenant_id_idx" ON "homologation_items"("tenant_id");

-- CreateIndex
CREATE INDEX "homologation_items_request_id_idx" ON "homologation_items"("request_id");

-- CreateIndex
CREATE INDEX "study_plan_blocks_tenant_id_idx" ON "study_plan_blocks"("tenant_id");

-- CreateIndex
CREATE INDEX "study_plan_blocks_study_plan_id_idx" ON "study_plan_blocks"("study_plan_id");

-- CreateIndex
CREATE INDEX "study_plan_subjects_block_id_idx" ON "study_plan_subjects"("block_id");

-- AddForeignKey
ALTER TABLE "study_plan_subjects" ADD CONSTRAINT "study_plan_subjects_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "study_plan_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject_records" ADD CONSTRAINT "student_subject_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject_records" ADD CONSTRAINT "student_subject_records_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject_records" ADD CONSTRAINT "student_subject_records_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject_records" ADD CONSTRAINT "student_subject_records_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_equivalences" ADD CONSTRAINT "subject_equivalences_source_subject_id_fkey" FOREIGN KEY ("source_subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_equivalences" ADD CONSTRAINT "subject_equivalences_target_subject_id_fkey" FOREIGN KEY ("target_subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homologation_requests" ADD CONSTRAINT "homologation_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homologation_requests" ADD CONSTRAINT "homologation_requests_program_enrollment_id_fkey" FOREIGN KEY ("program_enrollment_id") REFERENCES "program_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homologation_items" ADD CONSTRAINT "homologation_items_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "homologation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homologation_items" ADD CONSTRAINT "homologation_items_target_subject_id_fkey" FOREIGN KEY ("target_subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_blocks" ADD CONSTRAINT "study_plan_blocks_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_blocks" ADD CONSTRAINT "study_plan_blocks_certificate_template_id_fkey" FOREIGN KEY ("certificate_template_id") REFERENCES "certificate_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
