-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('DOCUMENTO', 'VIDEO', 'ENLACE', 'PRESENTACION', 'IMAGEN', 'AUDIO', 'OTRO');

-- CreateEnum
CREATE TYPE "LiveClassStatus" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVO', 'DEVUELTO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDIENTE', 'LISTA', 'CANCELADA', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'EMITIDO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "material_folders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "course_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT NOT NULL DEFAULT 'bg-blue-500',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "folder_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "MaterialType" NOT NULL,
    "url" TEXT NOT NULL,
    "formato" TEXT,
    "tamanio_kb" INTEGER,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "descargas" INTEGER NOT NULL DEFAULT 0,
    "subido_por" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_classes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "enlace" TEXT,
    "plataforma" TEXT,
    "aula" TEXT,
    "estado" "LiveClassStatus" NOT NULL DEFAULT 'PROGRAMADA',
    "grabacion_url" TEXT,
    "duracion_minutos" INTEGER,
    "asistentes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "capacidad_maxima" INTEGER,
    "horario" TEXT,
    "aula" TEXT,
    "color" TEXT NOT NULL DEFAULT 'bg-purple-500',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'miembro',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT,
    "categoria" TEXT NOT NULL,
    "editorial" TEXT,
    "anio" INTEGER,
    "descripcion" TEXT,
    "portada_url" TEXT,
    "ubicacion" TEXT,
    "ejemplares_total" INTEGER NOT NULL DEFAULT 1,
    "ejemplares_disponibles" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_loans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "fecha_prestamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "fecha_devolucion" TIMESTAMP(3),
    "estado" "LoanStatus" NOT NULL DEFAULT 'ACTIVO',
    "renovaciones" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_reservations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "fecha_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "estado" "ReservationStatus" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_topics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "course_id" TEXT,
    "autor_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'general',
    "fijado" BOOLEAN NOT NULL DEFAULT false,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_replies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "es_solucion" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "imagen_url" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'general',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_likes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT,
    "estado" "CertificateStatus" NOT NULL DEFAULT 'PENDIENTE',
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fecha_emision" TIMESTAMP(3),
    "archivo_url" TEXT,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "course_id" TEXT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'clase',
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "aula" TEXT,
    "color" TEXT NOT NULL DEFAULT 'bg-blue-500',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "material_folders_tenant_id_idx" ON "material_folders"("tenant_id");

-- CreateIndex
CREATE INDEX "material_folders_course_id_idx" ON "material_folders"("course_id");

-- CreateIndex
CREATE INDEX "materials_tenant_id_idx" ON "materials"("tenant_id");

-- CreateIndex
CREATE INDEX "materials_course_id_idx" ON "materials"("course_id");

-- CreateIndex
CREATE INDEX "materials_tipo_idx" ON "materials"("tipo");

-- CreateIndex
CREATE INDEX "live_classes_tenant_id_idx" ON "live_classes"("tenant_id");

-- CreateIndex
CREATE INDEX "live_classes_course_id_idx" ON "live_classes"("course_id");

-- CreateIndex
CREATE INDEX "live_classes_estado_idx" ON "live_classes"("estado");

-- CreateIndex
CREATE INDEX "live_classes_fecha_inicio_idx" ON "live_classes"("fecha_inicio");

-- CreateIndex
CREATE INDEX "course_groups_tenant_id_idx" ON "course_groups"("tenant_id");

-- CreateIndex
CREATE INDEX "course_groups_course_id_idx" ON "course_groups"("course_id");

-- CreateIndex
CREATE INDEX "group_members_tenant_id_idx" ON "group_members"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_group_id_student_id_key" ON "group_members"("group_id", "student_id");

-- CreateIndex
CREATE INDEX "books_tenant_id_idx" ON "books"("tenant_id");

-- CreateIndex
CREATE INDEX "books_categoria_idx" ON "books"("categoria");

-- CreateIndex
CREATE INDEX "book_loans_tenant_id_idx" ON "book_loans"("tenant_id");

-- CreateIndex
CREATE INDEX "book_loans_student_id_idx" ON "book_loans"("student_id");

-- CreateIndex
CREATE INDEX "book_loans_estado_idx" ON "book_loans"("estado");

-- CreateIndex
CREATE INDEX "book_reservations_tenant_id_idx" ON "book_reservations"("tenant_id");

-- CreateIndex
CREATE INDEX "book_reservations_student_id_idx" ON "book_reservations"("student_id");

-- CreateIndex
CREATE INDEX "forum_topics_tenant_id_idx" ON "forum_topics"("tenant_id");

-- CreateIndex
CREATE INDEX "forum_topics_course_id_idx" ON "forum_topics"("course_id");

-- CreateIndex
CREATE INDEX "forum_replies_tenant_id_idx" ON "forum_replies"("tenant_id");

-- CreateIndex
CREATE INDEX "forum_replies_topic_id_idx" ON "forum_replies"("topic_id");

-- CreateIndex
CREATE INDEX "community_posts_tenant_id_idx" ON "community_posts"("tenant_id");

-- CreateIndex
CREATE INDEX "community_comments_tenant_id_idx" ON "community_comments"("tenant_id");

-- CreateIndex
CREATE INDEX "community_comments_post_id_idx" ON "community_comments"("post_id");

-- CreateIndex
CREATE INDEX "community_likes_tenant_id_idx" ON "community_likes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_likes_post_id_user_id_key" ON "community_likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "certificate_requests_tenant_id_idx" ON "certificate_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "certificate_requests_student_id_idx" ON "certificate_requests"("student_id");

-- CreateIndex
CREATE INDEX "certificate_requests_estado_idx" ON "certificate_requests"("estado");

-- CreateIndex
CREATE INDEX "schedule_events_tenant_id_idx" ON "schedule_events"("tenant_id");

-- CreateIndex
CREATE INDEX "schedule_events_course_id_idx" ON "schedule_events"("course_id");

-- AddForeignKey
ALTER TABLE "material_folders" ADD CONSTRAINT "material_folders_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "material_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_groups" ADD CONSTRAINT "course_groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "course_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reservations" ADD CONSTRAINT "book_reservations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_reservations" ADD CONSTRAINT "book_reservations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "forum_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

