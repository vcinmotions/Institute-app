/*
  Warnings:

  - A unique constraint covering the columns `[enquiryId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "enquiryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_enquiryId_key" ON "public"."Notification"("enquiryId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "public"."Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
