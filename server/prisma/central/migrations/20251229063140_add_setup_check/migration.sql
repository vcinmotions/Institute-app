-- AlterTable
ALTER TABLE "public"."SuperAdmin" ADD COLUMN     "addressComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "basicComplete" BOOLEAN NOT NULL DEFAULT false;
