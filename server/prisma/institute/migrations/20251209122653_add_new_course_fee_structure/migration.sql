/*
  Warnings:

  - You are about to drop the column `PaymentStructureTypeId` on the `InstallmentDetail` table. All the data in the column will be lost.
  - Added the required column `CourseFeeStructureId` to the `InstallmentDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."InstallmentDetail" DROP CONSTRAINT "InstallmentDetail_PaymentStructureTypeId_fkey";

-- AlterTable
ALTER TABLE "public"."InstallmentDetail" DROP COLUMN "PaymentStructureTypeId",
ADD COLUMN     "CourseFeeStructureId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."InstallmentDetail" ADD CONSTRAINT "InstallmentDetail_CourseFeeStructureId_fkey" FOREIGN KEY ("CourseFeeStructureId") REFERENCES "public"."CourseFeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
