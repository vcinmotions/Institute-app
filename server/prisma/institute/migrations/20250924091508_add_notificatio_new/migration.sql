/*
  Warnings:

  - A unique constraint covering the columns `[followUpId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `followUpId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "followUpId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_followUpId_key" ON "public"."Notification"("followUpId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "public"."FollowUp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
