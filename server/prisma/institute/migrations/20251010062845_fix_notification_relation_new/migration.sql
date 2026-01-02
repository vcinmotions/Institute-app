-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_followUpId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_paymentId_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "followUpId" DROP NOT NULL,
ALTER COLUMN "paymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "public"."FollowUp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."StudentFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
