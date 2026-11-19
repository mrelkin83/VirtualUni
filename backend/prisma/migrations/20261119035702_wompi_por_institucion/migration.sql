-- CreateTable
CREATE TABLE "tenant_payment_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "public_key" TEXT,
    "integrity_key_enc" TEXT,
    "events_key_enc" TEXT,
    "test_mode" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_payment_configs_tenant_id_key" ON "tenant_payment_configs"("tenant_id");
