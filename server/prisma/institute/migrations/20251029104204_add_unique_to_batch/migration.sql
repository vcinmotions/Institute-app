/*
  Warnings:

  - A unique constraint covering the columns `[labTimeSlotId,clientAdminId]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Batch_labTimeSlotId_clientAdminId_key" ON "public"."Batch"("labTimeSlotId", "clientAdminId");
