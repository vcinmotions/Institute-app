/*
  Warnings:

  - Added the required column `totalQuantity` to the `StationeryItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "public"."StationeryItem" ADD COLUMN     "totalQuantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "status" "public"."TaskStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "public"."Test" ADD COLUMN     "status" "public"."TestStatus" NOT NULL DEFAULT 'DRAFT';
