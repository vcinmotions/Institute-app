-- AlterTable
ALTER TABLE "PortalSubscription" ADD COLUMN "maxUsers" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "PortalPayment" ADD COLUMN "maxUsers" INTEGER NOT NULL DEFAULT 1;
-- Existing customers keep working: do not drop them to a single login.
UPDATE "PortalSubscription" SET "maxUsers" = 30;
