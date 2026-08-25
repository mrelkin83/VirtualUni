-- AlterTable
ALTER TABLE "student_invoices" ADD COLUMN     "student_id" TEXT;

-- CreateIndex
CREATE INDEX "student_invoices_student_id_idx" ON "student_invoices"("student_id");

-- AddForeignKey
ALTER TABLE "student_invoices" ADD CONSTRAINT "student_invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

