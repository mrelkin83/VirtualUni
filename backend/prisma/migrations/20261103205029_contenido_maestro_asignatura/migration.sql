-- AlterTable
ALTER TABLE "course_topics" ADD COLUMN     "subject_id" TEXT,
ALTER COLUMN "course_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "material_folders" ADD COLUMN     "subject_id" TEXT;

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "subject_id" TEXT,
ALTER COLUMN "course_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "question_bank" ADD COLUMN     "subject_id" TEXT;

-- CreateTable
CREATE TABLE "subject_editors" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_editors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_editors_tenant_id_idx" ON "subject_editors"("tenant_id");

-- CreateIndex
CREATE INDEX "subject_editors_teacher_id_idx" ON "subject_editors"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_editors_subject_id_teacher_id_key" ON "subject_editors"("subject_id", "teacher_id");

-- CreateIndex
CREATE INDEX "course_topics_subject_id_idx" ON "course_topics"("subject_id");

-- CreateIndex
CREATE INDEX "material_folders_subject_id_idx" ON "material_folders"("subject_id");

-- CreateIndex
CREATE INDEX "materials_subject_id_idx" ON "materials"("subject_id");

-- CreateIndex
CREATE INDEX "question_bank_subject_id_idx" ON "question_bank"("subject_id");

-- AddForeignKey
ALTER TABLE "course_topics" ADD CONSTRAINT "course_topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_folders" ADD CONSTRAINT "material_folders_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_editors" ADD CONSTRAINT "subject_editors_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_editors" ADD CONSTRAINT "subject_editors_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
