-- AlterTable
ALTER TABLE "tenant_sites" ADD COLUMN     "announcement" JSONB;

-- CreateTable
CREATE TABLE "site_pages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "menu_group" TEXT NOT NULL DEFAULT 'Institucional',
    "order" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_pages_tenant_id_is_published_idx" ON "site_pages"("tenant_id", "is_published");

-- CreateIndex
CREATE UNIQUE INDEX "site_pages_tenant_id_slug_key" ON "site_pages"("tenant_id", "slug");
