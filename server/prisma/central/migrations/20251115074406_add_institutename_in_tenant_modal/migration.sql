/*
  Warnings:

  - A unique constraint covering the columns `[instituteName]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `instituteName` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "instituteName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_instituteName_key" ON "public"."Tenant"("instituteName");
