-- Reemplaza Stripe por Wompi como pasarela de pago.
-- Las tablas subscriptions/invoices nunca tuvieron datos reales (Stripe
-- nunca llegó a configurarse), así que renombrar es seguro.

ALTER TABLE "subscriptions" RENAME COLUMN "stripe_subscription_id" TO "external_reference";
ALTER INDEX "subscriptions_stripe_subscription_id_key" RENAME TO "subscriptions_external_reference_key";

ALTER TABLE "invoices" RENAME COLUMN "stripe_invoice_id" TO "wompi_transaction_id";
ALTER INDEX "invoices_stripe_invoice_id_key" RENAME TO "invoices_wompi_transaction_id_key";

ALTER TABLE "invoices" ALTER COLUMN "currency" SET DEFAULT 'COP';
