import { formatSequenceNumber } from "./sequenceNumber";
export async function generatePaymentReceiptNumber(
  prisma: any,
  clientAdminId: string
) {
  let config = await prisma.paymentReceiptConfig.findUnique({
    where: { clientAdminId },
  });

  // ✅ FIRST TIME → create default config
  if (!config) {
    config = await prisma.paymentReceiptConfig.create({
      data: {
        clientAdminId,
        prefix: "RCP",
        suffix: "",
        separator: "-",
        currentNumber: 1,
        numberLength: 4,
      },
    });
  } else {
    // ✅ Increment only if already exists
    config = await prisma.paymentReceiptConfig.update({
      where: { clientAdminId },
      data: {
        currentNumber: { increment: 1 },
      },
    });
  }

  return formatSequenceNumber(config);
}
