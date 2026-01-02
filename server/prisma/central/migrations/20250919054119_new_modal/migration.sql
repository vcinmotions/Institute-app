/*
  Warnings:

  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Tenant_email_key";

-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "email",
DROP COLUMN "password";
