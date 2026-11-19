-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_events_tenant_id_created_at_idx" ON "outbox_events"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_delivered_at_idx" ON "outbox_events"("delivered_at");
