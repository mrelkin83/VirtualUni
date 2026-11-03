-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('TECNICO_PROFESIONAL', 'TECNOLOGICO', 'PROFESIONAL_UNIVERSITARIO', 'ESPECIALIZACION', 'MAESTRIA', 'DOCTORADO', 'TECNICO_LABORAL', 'CONOCIMIENTOS_ACADEMICOS', 'PREESCOLAR', 'BASICA_PRIMARIA', 'BASICA_SECUNDARIA', 'MEDIA_BACHILLERATO', 'BACHILLERATO_POR_CICLOS', 'DIPLOMADO', 'CURSO_LIBRE', 'TALLER', 'SEMINARIO', 'OTRO');

-- CreateEnum
CREATE TYPE "PeriodStructure" AS ENUM ('SEMESTRAL', 'CUATRIMESTRAL', 'TRIMESTRAL', 'ANUAL', 'POR_CICLOS', 'MODULAR', 'UNICO');

-- CreateEnum
CREATE TYPE "AcademicUnit" AS ENUM ('CREDITOS', 'HORAS', 'INTENSIDAD_HORARIA_SEMANAL');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('PRESENCIAL', 'VIRTUAL', 'HIBRIDA', 'DISTANCIA');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('OBLIGATORIA', 'ELECTIVA', 'OPTATIVA', 'PRACTICA', 'TRABAJO_DE_GRADO');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('BORRADOR', 'ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "StudyPlanStatus" AS ENUM ('BORRADOR', 'VIGENTE', 'CERRADO');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('PLANEADO', 'EN_CURSO', 'CERRADO');

-- CreateEnum
CREATE TYPE "ProgramEnrollmentStatus" AS ENUM ('ACTIVO', 'APLAZADO', 'RETIRADO', 'GRADUADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "academic_period_id" TEXT,
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "group_code" TEXT,
ADD COLUMN     "modality" "Modality",
ADD COLUMN     "subject_id" TEXT;

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "education_level" "EducationLevel" NOT NULL,
    "modality" "Modality" NOT NULL,
    "period_structure" "PeriodStructure" NOT NULL,
    "academic_unit" "AcademicUnit" NOT NULL,
    "duration_periods" INTEGER,
    "total_credits" INTEGER,
    "total_hours" INTEGER,
    "degree_title" TEXT,
    "official_code" TEXT,
    "approval_act" TEXT,
    "status" "ProgramStatus" NOT NULL DEFAULT 'BORRADOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "StudyPlanStatus" NOT NULL DEFAULT 'BORRADOR',
    "valid_from" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "area" TEXT,
    "credits" INTEGER,
    "hours" INTEGER,
    "weekly_hours" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plan_subjects" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "study_plan_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "subject_type" "SubjectType" NOT NULL DEFAULT 'OBLIGATORIA',
    "credits" INTEGER,
    "hours" INTEGER,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "study_plan_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plan_prerequisites" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "required_id" TEXT NOT NULL,

    CONSTRAINT "study_plan_prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'PLANEADO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "study_plan_id" TEXT NOT NULL,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "status" "ProgramEnrollmentStatus" NOT NULL DEFAULT 'ACTIVO',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programs_tenant_id_idx" ON "programs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "programs_tenant_id_code_key" ON "programs"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "study_plans_tenant_id_idx" ON "study_plans"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_plans_program_id_version_key" ON "study_plans"("program_id", "version");

-- CreateIndex
CREATE INDEX "subjects_tenant_id_idx" ON "subjects"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_tenant_id_code_key" ON "subjects"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "study_plan_subjects_tenant_id_idx" ON "study_plan_subjects"("tenant_id");

-- CreateIndex
CREATE INDEX "study_plan_subjects_subject_id_idx" ON "study_plan_subjects"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_plan_subjects_study_plan_id_subject_id_key" ON "study_plan_subjects"("study_plan_id", "subject_id");

-- CreateIndex
CREATE INDEX "study_plan_prerequisites_required_id_idx" ON "study_plan_prerequisites"("required_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_plan_prerequisites_entry_id_required_id_key" ON "study_plan_prerequisites"("entry_id", "required_id");

-- CreateIndex
CREATE INDEX "academic_periods_tenant_id_idx" ON "academic_periods"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_periods_tenant_id_code_key" ON "academic_periods"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "program_enrollments_tenant_id_idx" ON "program_enrollments"("tenant_id");

-- CreateIndex
CREATE INDEX "program_enrollments_program_id_idx" ON "program_enrollments"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_enrollments_student_id_program_id_key" ON "program_enrollments"("student_id", "program_id");

-- CreateIndex
CREATE INDEX "courses_subject_id_idx" ON "courses"("subject_id");

-- CreateIndex
CREATE INDEX "courses_academic_period_id_idx" ON "courses"("academic_period_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_subjects" ADD CONSTRAINT "study_plan_subjects_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_subjects" ADD CONSTRAINT "study_plan_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_prerequisites" ADD CONSTRAINT "study_plan_prerequisites_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "study_plan_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_prerequisites" ADD CONSTRAINT "study_plan_prerequisites_required_id_fkey" FOREIGN KEY ("required_id") REFERENCES "study_plan_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "study_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
