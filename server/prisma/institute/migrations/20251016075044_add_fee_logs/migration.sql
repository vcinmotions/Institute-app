-- CreateTable
CREATE TABLE "public"."StudentFeeLog" (
    "id" SERIAL NOT NULL,
    "studentFeeId" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" "public"."PaymentMode" NOT NULL,
    "receiptNo" TEXT NOT NULL,

    CONSTRAINT "StudentFeeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentFeeLog_receiptNo_key" ON "public"."StudentFeeLog"("receiptNo");

-- AddForeignKey
ALTER TABLE "public"."StudentFeeLog" ADD CONSTRAINT "StudentFeeLog_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "public"."StudentFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
