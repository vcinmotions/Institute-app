/*
  Warnings:

  - You are about to drop the column `facultyId` on the `BatchCourse` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `LabTimeSlot` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `StudentCourse` table. All the data in the column will be lost.
  - You are about to drop the column `pcNumber` on the `StudentCourse` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BatchCourse" DROP CONSTRAINT "BatchCourse_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabTimeSlot" DROP CONSTRAINT "LabTimeSlot_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentCourse" DROP CONSTRAINT "StudentCourse_facultyId_fkey";

-- AlterTable
ALTER TABLE "public"."BatchCourse" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "public"."LabTimeSlot" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "public"."StudentCourse" DROP COLUMN "facultyId",
DROP COLUMN "pcNumber";
