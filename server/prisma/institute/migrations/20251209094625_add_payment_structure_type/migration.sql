-- CreateTable
CREATE TABLE "public"."PaymentStructureType" (
    "id" SERIAL NOT NULL,
    "name" "public"."PaymentType" NOT NULL,
    "installmentCount" INTEGER,

    CONSTRAINT "PaymentStructureType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstallmentDetail" (
    "id" SERIAL NOT NULL,
    "PaymentStructureTypeId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InstallmentDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InstallmentDetail" ADD CONSTRAINT "InstallmentDetail_PaymentStructureTypeId_fkey" FOREIGN KEY ("PaymentStructureTypeId") REFERENCES "public"."PaymentStructureType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
