/*
  Warnings:

  - The `paymentType` column on the `CourseFeeStructure` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."CourseFeeStructure" DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" TEXT[];
