-- CreateEnum
CREATE TYPE "public"."RecordType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "public"."FinancialRecord" (
    "id" TEXT NOT NULL,
    "clientAdminId" TEXT NOT NULL,
    "recordType" "public"."RecordType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" "public"."PaymentMode",
    "studentId" INTEGER,
    "courseId" INTEGER,
    "facultyId" INTEGER,
    "labId" INTEGER,

    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FinancialRecord" ADD CONSTRAINT "FinancialRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialRecord" ADD CONSTRAINT "FinancialRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialRecord" ADD CONSTRAINT "FinancialRecord_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialRecord" ADD CONSTRAINT "FinancialRecord_labId_fkey" FOREIGN KEY ("labId") REFERENCES "public"."Lab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialRecord" ADD CONSTRAINT "FinancialRecord_clientAdminId_fkey" FOREIGN KEY ("clientAdminId") REFERENCES "public"."ClientAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
