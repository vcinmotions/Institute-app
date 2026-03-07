// export async function generateAdmissionNumber(tenantPrisma: any, clientAdminId: string) {
//   const config = await tenantPrisma.admissionNumberConfig.update({
//     where: { clientAdminId },
//     data: {
//       currentNumber: { increment: 1 }
//     }
//   });

//   const paddedNumber = String(config.currentNumber).padStart(
//     config.numberLength,
//     "0"
//   );

//   const admissionNumber =
//     (config.prefix || "") + paddedNumber + (config.suffix || "");

//   return admissionNumber;
// }

export async function generateAdmissionNumber(
  tenantPrisma: any,
  clientAdminId: string
) {

  const config = await tenantPrisma.admissionNumberConfig.upsert({
    where: { clientAdminId },

    update: {
      currentNumber: { increment: 1 }
    },

    create: {
      clientAdminId,
      prefix: "ADM",
      currentNumber: 1,
      numberLength: 4
    }
  });

  const paddedNumber = String(config.currentNumber).padStart(
    config.numberLength,
    "0"
  );

  return `${config.prefix}-${paddedNumber}`;
}