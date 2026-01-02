/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serialNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "serialNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_serialNumber_key" ON "public"."Student"("serialNumber");
