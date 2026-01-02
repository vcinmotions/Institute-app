/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "paymentId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_paymentId_key" ON "public"."Notification"("paymentId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."StudentFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
