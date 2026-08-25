-- CreateIndex
CREATE INDEX "messages_recipient_id_tenant_id_idx" ON "messages"("recipient_id", "tenant_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_tenant_id_idx" ON "messages"("sender_id", "tenant_id");
