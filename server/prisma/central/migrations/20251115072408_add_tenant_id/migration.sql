/*
  Warnings:

  - A unique constraint covering the columns `[tenantId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_tenantId_key" ON "public"."Tenant"("tenantId");
