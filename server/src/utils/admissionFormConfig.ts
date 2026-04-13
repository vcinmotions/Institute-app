// export async function generateAdmissionNumber(
//   tenantPrisma: any,
//   clientAdminId: string
// ) {

//   const config = await tenantPrisma.admissionNumberConfig.upsert({
//     where: { clientAdminId },

//     update: {
//       currentNumber: { increment: 1 }
//     },

//     create: {
//       clientAdminId,
//       prefix: "ADM",
//       currentNumber: 1,
//       numberLength: 4
//     }
//   });

//   const paddedNumber = String(config.currentNumber).padStart(
//     config.numberLength,
//     "0"
//   );

//   return `${config.prefix}-${paddedNumber}`;
// }

export async function generateAdmissionNumber(
  prisma: any,
  clientAdminId: string
) {
  let config = await prisma.admissionNumberConfig.findUnique({
    where: { clientAdminId },
  });

  // ✅ FIRST TIME → create default config
  if (!config) {
    config = await prisma.admissionNumberConfig.create({
      data: {
        clientAdminId,
        prefix: "ADM",
        suffix: "",
        separator: "-",
        currentNumber: 1,
        numberLength: 4,
      },
    });
  } else {
    // ✅ Increment only if already exists
    config = await prisma.admissionNumberConfig.update({
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