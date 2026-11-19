/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,slug]` on the table `programs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('COLEGIO', 'ETDH', 'TECNICA_PROFESIONAL', 'TECNOLOGICA', 'UNIVERSITARIA', 'UNIVERSIDAD', 'MIXTA');

-- CreateEnum
CREATE TYPE "SiteMode" AS ENUM ('FULL', 'ADMISSIONS_ONLY', 'OFF');

-- CreateEnum
CREATE TYPE "AdmissionCallStatus" AS ENUM ('BORRADOR', 'ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('INTERESADO', 'BORRADOR', 'ENVIADA', 'PAGO_PENDIENTE', 'PAGO_EN_VERIFICACION', 'PAGADA', 'EN_REVISION', 'DOCUMENTOS_INCOMPLETOS', 'ADMITIDA', 'NO_ADMITIDA', 'MATRICULADA', 'DESISTIO');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "area" TEXT,
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "graduate_profile" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_new_until" TIMESTAMP(3),
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occupational_profile" TEXT,
ADD COLUMN     "public_description" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tuition_display" TEXT;

-- CreateTable
CREATE TABLE "tenant_sites" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "institution_type" "InstitutionType" NOT NULL DEFAULT 'MIXTA',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "site_mode" "SiteMode" NOT NULL DEFAULT 'FULL',
    "external_website_url" TEXT,
    "hero_slides" JSONB NOT NULL,
    "show_hero_search" BOOLEAN NOT NULL DEFAULT true,
    "sections" JSONB NOT NULL,
    "benefits" JSONB,
    "stats" JSONB,
    "featured_program_ids" TEXT[],
    "level_labels" JSONB,
    "contact" JSONB,
    "whatsapp_number" TEXT,
    "whatsapp_message" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "analytics" JSONB,
    "privacy_policy" TEXT,
    "privacy_policy_url" TEXT,
    "privacy_version" TEXT NOT NULL DEFAULT '1',
    "data_controller_name" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_calls" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "academic_period_id" TEXT NOT NULL,
    "study_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "opens_at" TIMESTAMP(3) NOT NULL,
    "closes_at" TIMESTAMP(3),
    "capacity" INTEGER,
    "schedule" TEXT,
    "modality" "Modality",
    "application_fee" INTEGER NOT NULL DEFAULT 0,
    "payment_methods" TEXT[],
    "status" "AdmissionCallStatus" NOT NULL DEFAULT 'BORRADOR',
    "rolling" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMP(3),
    "target_levels" JSONB,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "min_education" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_required_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "accept_types" TEXT[],
    "max_size_mb" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "admission_required_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birth_date" DATE,
    "city" TEXT,
    "previous_education" TEXT,
    "guardian" JSONB,
    "consent_at" TIMESTAMP(3) NOT NULL,
    "consent_ip" TEXT NOT NULL,
    "consent_version" TEXT NOT NULL,
    "guardian_consent" BOOLEAN NOT NULL DEFAULT false,
    "utm" JSONB,
    "student_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "call_id" TEXT,
    "target_level" INTEGER,
    "submitted_by_guardian" BOOLEAN NOT NULL DEFAULT false,
    "code" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'BORRADOR',
    "payment_method" TEXT,
    "payment_ref" TEXT,
    "paid_at" TIMESTAMP(3),
    "reviewer_id" TEXT,
    "decision_notes" TEXT,
    "access_token_hash" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "required_doc_id" TEXT,
    "file_key" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_kb" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "review_note" TEXT,

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_sites_tenant_id_key" ON "tenant_sites"("tenant_id");

-- CreateIndex
CREATE INDEX "admission_calls_tenant_id_idx" ON "admission_calls"("tenant_id");

-- CreateIndex
CREATE INDEX "admission_calls_program_id_idx" ON "admission_calls"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_calls_tenant_id_slug_key" ON "admission_calls"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "admission_required_documents_call_id_idx" ON "admission_required_documents"("call_id");

-- CreateIndex
CREATE INDEX "applicants_tenant_id_idx" ON "applicants"("tenant_id");

-- CreateIndex
CREATE INDEX "applicants_tenant_id_email_idx" ON "applicants"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_tenant_id_document_type_document_number_key" ON "applicants"("tenant_id", "document_type", "document_number");

-- CreateIndex
CREATE INDEX "applications_tenant_id_status_idx" ON "applications"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_tenant_id_code_key" ON "applications"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicant_id_call_id_key" ON "applications"("applicant_id", "call_id");

-- CreateIndex
CREATE INDEX "application_documents_application_id_idx" ON "application_documents"("application_id");

-- CreateIndex
CREATE INDEX "application_events_application_id_idx" ON "application_events"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "programs_tenant_id_slug_key" ON "programs"("tenant_id", "slug");

-- AddForeignKey
ALTER TABLE "admission_calls" ADD CONSTRAINT "admission_calls_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_calls" ADD CONSTRAINT "admission_calls_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_calls" ADD CONSTRAINT "admission_calls_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "study_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_required_documents" ADD CONSTRAINT "admission_required_documents_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "admission_calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "admission_calls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_required_doc_id_fkey" FOREIGN KEY ("required_doc_id") REFERENCES "admission_required_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
