async function generateAdmissionNumber(tenantPrisma: any, clientAdminId: string) {
  const config = await tenantPrisma.admissionNumberConfig.update({
    where: { clientAdminId },
    data: {
      currentNumber: { increment: 1 }
    }
  });

  const paddedNumber = String(config.currentNumber).padStart(
    config.numberLength,
    "0"
  );

  const admissionNumber =
    (config.prefix || "") + paddedNumber + (config.suffix || "");

  return admissionNumber;
}