import { getTenantPrisma } from "../prisma-client/tenant-client";
import dayjs from "dayjs";
import { io } from "../utils/socket"; // Reference to your Socket.IO server

// export async function processDuePayments(dbUrl: string) {
//   const tenantPrisma = getTenantPrisma(dbUrl);
//   console.log(`get dburl in Payments: ${dbUrl}`);

//   const now = dayjs();
//   const reminderWindowEnd = now.add(1, "day").endOf("day").toDate();

//   const duePayments = await tenantPrisma.studentFee.findMany({
//     where: {
//       paymentDate: null,
//       paymentStatus: {
//         in: ["PENDING"],
//       },
    
//     },
//     include: {
//       student: true,
//       course: true,
//     },
//   });

//   console.log("get Due Payments", duePayments);

//   for (const payment of duePayments) {
//     try {
//       const notificationMessage = `${payment.student.fullName} Payments due for course ${payment.course.name} amount (${payment.amountDue}) (${payment.student.contact})`;

//       console.log("notificationMessage", notificationMessage);

//       io.to(payment.student.clientAdminId).emit("payments-notification", {
//         notificationMessage,
//         createdAt: new Date().toISOString(),
//       });

//       const existingNotification = await tenantPrisma.notification.findUnique({
//         where: { paymentId: payment.id },
//       });

//       if (existingNotification) {
//         console.log(
//           `⚠️ Notification already exists for Payments ${payment.id}`
//         );
//         console.log("🧪 Youll ALWAYS see this log"); // this line always runs
//         continue;
//         console.log("🧪 Youll NEVER see this log"); // this line never runs
//       }

//       const message = `${payment.student.fullName} Payments due for course ${payment.course.name} amount (${payment.amountDue}) (${payment.student.contact})`;

//       const notification = await tenantPrisma.notification.create({
//         data: {
//           message,
//           clientAdminId: payment.student.clientAdminId,
//           paymentId: payment.id,
//         },
//       });

//       console.log("Notification Created", notification);

//       io.to(payment.student.clientAdminId).emit("new-payment-notification", {
//         message,
//         createdAt: new Date().toISOString(),
//       });
//     } catch (err) {
//       console.error(`Error processing Payments ${payment.id}:`, err);
//     }
//   }
// }

// export async function processDuePayments(dbUrl: string) {
//   const prisma = getTenantPrisma(dbUrl);

//   const now = dayjs();
//   const reminderEnd = now.add(21, "day").endOf("day").toDate();

//   const duePayments = await prisma.studentFee.findMany({
//     where: {
//       paymentStatus: { in: ["PENDING", "FAILED"] },
//       // dueDate: {
//       //   lte: reminderEnd, // 🔥 within next 2 days OR overdue
//       // },
//     },
//     include: {
//       student: true,
//       course: true,
//     },
//   });


//   for (const payment of duePayments) {
//     const exists = await prisma.notification.findUnique({
//       where: { paymentId: payment.id },
//     });

//     if (exists) continue;

//     const message = `Payment due for ${payment.student.fullName}
//     Course: ${payment.course.name}
//     Amount: ₹${payment.amountDue}
//     Due Date: ${dayjs(payment.dueDate).format("DD MMM")}`;

//     await prisma.notification.create({
//       data: {
//         message,
//         clientAdminId: payment.clientAdminId,
//         paymentId: payment.id,
//       },
//     });

//     io.to(payment.clientAdminId).emit("payment-notification", {
//       message,
//       createdAt: new Date().toISOString(),
//     });
//   }
// }


export async function processDuePayments(dbUrl: string) {
  const prisma = getTenantPrisma(dbUrl);

  const now = dayjs();

  // 🔥 Only consider payments that are 21 days overdue
  const overdueThreshold = now.subtract(21, "day").startOf("day").toDate();

  const duePayments = await prisma.studentFee.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "FAILED"] },
      dueDate: { lte: overdueThreshold }, // Payment due date is 21+ days ago
    },
    include: {
      student: true,
      course: true,
    },
  });

  for (const payment of duePayments) {
    // ✅ Skip if notification already exists
    const exists = await prisma.notification.findUnique({
      where: { paymentId: payment.id },
    });
    if (exists) continue;

    const message = `Payment overdue for ${payment.student.fullName}
Course: ${payment.course.name}
Amount: ₹${payment.amountDue}
Due Date: ${dayjs(payment.dueDate).format("DD MMM YYYY")}
Overdue by: ${dayjs().diff(dayjs(payment.dueDate), "day")} days`;

    // 🔥 Create notification
    await prisma.notification.create({
      data: {
        message,
        clientAdminId: payment.clientAdminId,
        paymentId: payment.id,
      },
    });

    // 🔔 Emit via Socket.IO
    io.to(payment.clientAdminId).emit("payment-notification", {
      message,
      createdAt: new Date().toISOString(),
    });

    console.log(`Notification sent for overdue payment: ${payment.id}`);
  }
}

// export async function processDuePayments(dbUrl: string) {
//   const tenantPrisma = getTenantPrisma(dbUrl);

//   const now = dayjs();
//   const reminderWindowEnd = now.add(1, "day").endOf("day").toDate();

//   const duePayments = await tenantPrisma.studentFee.findMany({
//     where: {
//       paymentDate: null,
//       paymentStatus: "PENDING",
//       dueDate: {
//         lte: reminderWindowEnd, // 🔥 ONLY close or overdue
//       },
//     },
//     include: {
//       student: true,
//       course: true,
//     },
//   });

//   for (const payment of duePayments) {
//     try {
//       const existingNotification = await tenantPrisma.notification.findUnique({
//         where: { paymentId: payment.id },
//       });
//       if (existingNotification) continue;

//       const message = `${payment.student.fullName} payment due for ${payment.course.name} amount (${payment.amountDue}) (${payment.student.contact})`;

//       await tenantPrisma.notification.create({
//         data: {
//           message,
//           clientAdminId: payment.student.clientAdminId,
//           paymentId: payment.id,
//         },
//       });

//       io.to(payment.student.clientAdminId).emit(
//         "new-payment-notification",
//         {
//           message,
//           createdAt: new Date().toISOString(),
//         }
//       );
//     } catch (err) {
//       console.error(`❌ Error processing payment ${payment.id}`, err);
//     }
//   }
// }
