-- DropForeignKey
ALTER TABLE "public"."StudentFee" DROP CONSTRAINT "StudentFee_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentFee" DROP CONSTRAINT "StudentFee_studentId_courseId_fkey";

-- DropIndex
DROP INDEX "public"."StudentFee_receiptNo_key";

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "admissionDate" DROP NOT NULL,
ALTER COLUMN "fatherName" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "motherName" DROP NOT NULL,
ALTER COLUMN "parentsContact" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."StudentFee" ADD COLUMN     "isOpeningBalance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceType" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL,
ALTER COLUMN "amountPaid" SET DEFAULT 0,
ALTER COLUMN "paymentMode" DROP NOT NULL,
ALTER COLUMN "receiptNo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."StudentFee" ADD CONSTRAINT "StudentFee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
