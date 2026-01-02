-- AlterTable
ALTER TABLE "public"."FeeStructure" ADD COLUMN     "installmentTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."FeeStructure" ADD CONSTRAINT "FeeStructure_installmentTypeId_fkey" FOREIGN KEY ("installmentTypeId") REFERENCES "public"."InstallmentDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
