-- DropForeignKey
ALTER TABLE "public"."Batch" DROP CONSTRAINT "Batch_facultyId_fkey";

-- AlterTable
ALTER TABLE "public"."Batch" ALTER COLUMN "facultyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
