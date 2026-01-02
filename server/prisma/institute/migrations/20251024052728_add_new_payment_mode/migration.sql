/*
  Warnings:

  - The values [OTHER] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentMode_new" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE');
ALTER TABLE "public"."StudentFeeLog" ALTER COLUMN "paymentMode" TYPE "public"."PaymentMode_new" USING ("paymentMode"::text::"public"."PaymentMode_new");
ALTER TABLE "public"."StudentFee" ALTER COLUMN "paymentMode" TYPE "public"."PaymentMode_new" USING ("paymentMode"::text::"public"."PaymentMode_new");
ALTER TYPE "public"."PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "public"."PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "public"."PaymentMode_old";
COMMIT;
