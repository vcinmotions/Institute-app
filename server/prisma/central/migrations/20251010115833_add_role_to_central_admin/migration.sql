-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MASTER_ADMIN');

-- AlterTable
ALTER TABLE "public"."SuperAdmin" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'MASTER_ADMIN';
