/*
  Warnings:

  - A unique constraint covering the columns `[srNo]` on the table `Enquiry` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Enquiry" ADD COLUMN     "srNo" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_srNo_key" ON "public"."Enquiry"("srNo");
