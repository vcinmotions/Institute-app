/*
  Warnings:

  - A unique constraint covering the columns `[admissionNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admissionNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "admissionNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."AdmissionNumberConfig" (
    "id" TEXT NOT NULL,
    "prefix" TEXT,
    "suffix" TEXT,
    "numberLength" INTEGER NOT NULL DEFAULT 4,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "clientAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionNumberConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionNumberConfig_clientAdminId_key" ON "public"."AdmissionNumberConfig"("clientAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "public"."Student"("admissionNumber");
