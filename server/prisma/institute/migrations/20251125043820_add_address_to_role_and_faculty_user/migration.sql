/*
  Warnings:

  - Added the required column `city` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `RoleUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Faculty" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."RoleUser" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
