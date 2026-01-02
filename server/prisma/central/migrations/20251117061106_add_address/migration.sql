/*
  Warnings:

  - Added the required column `city` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SuperAdmin" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
