/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ClientAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ClientAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ClientAdmin" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClientAdmin_slug_key" ON "public"."ClientAdmin"("slug");
