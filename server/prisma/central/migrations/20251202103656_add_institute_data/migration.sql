/*
  Warnings:

  - You are about to drop the column `customDomain` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `fullAddress` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "customDomain",
ADD COLUMN     "certificateName" TEXT,
ADD COLUMN     "fullAddress" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT NOT NULL,
ADD COLUMN     "sign" TEXT,
ADD COLUMN     "stamp" TEXT;
