import { getTenantPrisma } from "../prisma-client/tenant-client";
import dayjs from "dayjs";
import { io } from "../utils/socket"; // Reference to your Socket.IO server

// export async function processDueFollowUps(dbUrl: string) {
//   const tenantPrisma = getTenantPrisma(dbUrl);
//   console.log(`get dburl in followup: ${dbUrl}`);

//   const dueFollowUps = await tenantPrisma.followUp.findMany({
//     where: {
//       doneAt: null,
//       followUpStatus: {
//         in: ["PENDING", "MISSED"],
//       },
//     },
//     include: {
//       enquiry: true,
//     },
//   });

//   console.log("get DueFoolowUp", dueFollowUps);

//   for (const followUp of dueFollowUps) {
//     try {
//       const notificationMessage = `${followUp.remark} follow-up due for ${followUp.enquiry.name} (${followUp.enquiry.contact})`;

//       console.log("notificationMessage", notificationMessage);

//       io.to(followUp.enquiry.clientAdminId).emit("followup-notification", {
//         notificationMessage,
//         createdAt: new Date().toISOString(),
//       });

//       const existingNotification = await tenantPrisma.notification.findUnique({
//         where: { followUpId: followUp.id },
//       });

//       if (existingNotification) {
//         console.log(
//           `⚠️ Notification already exists for follow-up ${followUp.id}`
//         );
//         console.log("🧪 Youll ALWAYS see this log"); // this line never runs
//         continue;
//         console.log("🧪 Youll NEVER see this log"); // this line never runs
//       }

//       const message = `${followUp.remark} follow-up due for ${followUp.enquiry.name} (${followUp.enquiry.contact})`;

//       const notification = await tenantPrisma.notification.create({
//         data: {
//           message,
//           clientAdminId: followUp.enquiry.clientAdminId,
//           followUpId: followUp.id,
//         },
//       });

//       console.log("Notification Created", notification);

//       io.to(followUp.enquiry.clientAdminId).emit("new-followup-notification", {
//         message,
//         createdAt: new Date().toISOString(),
//       });

//       if (dayjs(followUp.scheduledAt).isBefore(dayjs().subtract(1, "day"))) {
//         await tenantPrisma.followUp.update({
//           where: { id: followUp.id },
//           data: {
//             followUpStatus: "MISSED",
//           },
//         });
//         console.log(
//           `❌ Marked follow-up as MISSED for ${followUp.enquiry.name}`
//         );
//       }
//     } catch (err) {
//       console.error(`Error processing follow-up ${followUp.id}:`, err);
//     }
//   }
// }

export async function processDueFollowUps(dbUrl: string) {
  const prisma = getTenantPrisma(dbUrl);

  const now = dayjs();
  const reminderEnd = now.add(2, "day").endOf("day").toDate();

  const followUps = await prisma.followUp.findMany({
    where: {
      doneAt: null,
      followUpStatus: { in: ["PENDING", "MISSED"] },
      // scheduledAt: {
      //   lte: reminderEnd, // 🔥 near or overdue
      // },
    },
    include: {
      enquiry: true,
    },
  });

  console.log("ALL FOLLOW_UPS PENDING AND MISSED:", followUps);

  for (const followUp of followUps) {
    const exists = await prisma.notification.findUnique({
      where: { followUpId: followUp.id },
    });

    if (exists) continue;

    const message = `Follow-up due for ${followUp.enquiry.name}
    Remark: ${followUp.remark}
    Scheduled: ${dayjs(followUp.scheduledAt).format("DD MMM")}`;

    await prisma.notification.create({
      data: {
        message,
        clientAdminId: followUp.enquiry.clientAdminId,
        followUpId: followUp.id,
      },
    });

    io.to(followUp.enquiry.clientAdminId).emit("followup-notification", {
      message,
      createdAt: new Date().toISOString(),
    });

    // 🔥 Mark missed if overdue
    if (dayjs(followUp.scheduledAt).isBefore(now)) {
      await prisma.followUp.update({
        where: { id: followUp.id },
        data: { followUpStatus: "MISSED" },
      });
    }
  }
}


// export async function processDueFollowUps(dbUrl: string) {
//   const tenantPrisma = getTenantPrisma(dbUrl);

//   const now = dayjs();
//   const reminderWindowEnd = now.add(1, "day").endOf("day").toDate();

//   const dueFollowUps = await tenantPrisma.followUp.findMany({
//     where: {
//       doneAt: null,
//       scheduledAt: {
//         lte: reminderWindowEnd, // 🔥 ONLY close or overdue
//       },
//       followUpStatus: {
//         in: ["PENDING", "MISSED"],
//       },
//     },
//     include: {
//       enquiry: true,
//     },
//   });

//   for (const followUp of dueFollowUps) {
//     try {
//       // ✅ Prevent duplicate notifications
//       const existingNotification = await tenantPrisma.notification.findUnique({
//         where: { followUpId: followUp.id },
//       });
//       if (existingNotification) continue;

//       const message = `${followUp.remark} follow-up due for ${followUp.enquiry.name} (${followUp.enquiry.contact})`;

//       await tenantPrisma.notification.create({
//         data: {
//           message,
//           clientAdminId: followUp.enquiry.clientAdminId,
//           followUpId: followUp.id,
//         },
//       });

//       io.to(followUp.enquiry.clientAdminId).emit(
//         "new-followup-notification",
//         {
//           message,
//           createdAt: new Date().toISOString(),
//         }
//       );

//       // 🔴 Mark MISSED if overdue by 1 day
//       if (
//         followUp.scheduledAt &&
//         dayjs(followUp.scheduledAt).isBefore(now.subtract(1, "day"))
//       ) {
//         await tenantPrisma.followUp.update({
//           where: { id: followUp.id },
//           data: { followUpStatus: "MISSED" },
//         });
//       }
//     } catch (err) {
//       console.error(`❌ Error processing follow-up ${followUp.id}`, err);
//     }
//   }
// }
