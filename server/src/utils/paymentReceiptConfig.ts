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

  const paddedNumber = String(config.currentNumber).padStart(
    config.numberLength,
    "0"
  );

  const parts = [];

  if (config.prefix) parts.push(config.prefix);
  parts.push(paddedNumber);
  if (config.suffix) parts.push(config.suffix);

  return parts.join(config.separator);
}
