import { Request, Response } from "express";

// export async function getLabController(req: Request, res: Response) {
//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const email = user.email;

//     // 1️⃣ Get client admin
//     // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
//     //   where: { email },
//     // });
//     // if (!clientAdmin) {
//     //   return res.status(404).json({ error: "Client admin not found" });
//     // }

//     const clientAdminId = user.clientAdminId;

//     // 2️⃣ Extract query params for pagination
//     const pageNum = parseInt(req.query.page as string, 10) || 1;
//     const limitNum = parseInt(req.query.limit as string, 10) || 10;
//     const skip = (pageNum - 1) * limitNum;
//     const search = req.query.search as string | undefined;

//     // 3️⃣ Build filter
//     const where: any = { clientAdminId: clientAdminId };
//     if (search) {
//       where.name = { contains: search, mode: "insensitive" };
//     }

//     // 4️⃣ Fetch labs with time slots and allocations
//     const labs = await tenantPrisma.lab.findMany({
//       where,
//       skip,
//       take: limitNum,
//       include: {
//         timeSlots: {
//           include: {
//             allocations: {
//               include: {
//                 student: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     // 5️⃣ Map to calculate allocated and free PCs per time slot
//     const labsWithPcInfo = labs.map((lab) => ({
//       id: lab.id,
//       name: lab.name,
//       location: lab.location,
//       totalPCs: lab.totalPCs,
//       isActive: lab.isActive,
//       timeSlots: lab.timeSlots.map((slot) => ({
//         id: slot.id,
//         day: slot.day,
//         startTime: slot.startTime,
//         endTime: slot.endTime,
//         totalPcs: slot.availablePCs + slot.allocations.length,
//         availablePCs: slot.availablePCs,
//         allocatedPCs: slot.allocations.length,
//         freePCs: slot.availablePCs,
//         allocations: slot.allocations.map((a) => ({
//           studentId: a.student.id,
//           fullName: a.student.fullName,
//           pcNumber: a.pcNumber,
//         })),
//       })),
//     }));

//     // 6️⃣ Total count for pagination
//     const totalCount = await tenantPrisma.lab.count({ where });

//     return res.status(200).json({
//       message: "Labs fetched successfully",
//       labs: labsWithPcInfo,
//       totalPages: Math.ceil(totalCount / limitNum),
//       page: pageNum,
//       limit: limitNum,
//     });
//   } catch (err) {
//     console.error("Error fetching labs:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// controllers/labController.ts

// import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
// import { verifyToken } from "../utils/jwt"; // custom util for JWT
// import { activityLogger } from "../utils/activityLogger"; // optional

export const createLab = async (req: Request, res: Response) => {
  const { name, location, totalPCs, timeSlots } = req.body;

  console.log("GET LAB DATA IN BODY:", req.body);
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ message: "ClientAdmin not found" });
    }

    // ✅ 1. Create the Lab
    const lab = await tenantPrisma.lab.create({
      data: {
        name,
        location,
        totalPCs,
        clientAdminId: clientAdmin.id,
      },
    });

    // ✅ 2. Optionally add default time slots
    let createdSlots: any[] = [];

    // if (Array.isArray(timeSlots) && timeSlots.length > 0) {
    //   createdSlots = await Promise.all(
    //     timeSlots.map((slot) =>
    //       tenantPrisma.labTimeSlot.create({
    //         data: {
    //           ...slot,
    //           labId: lab.id,
    //           availablePCs: totalPCs,
    //           clientAdminId: clientAdmin.id,
    //         },
    //       })
    //     )
    //   );
    // }

    if (Array.isArray(timeSlots) && timeSlots.length > 0) {
      createdSlots = await Promise.all(
        timeSlots.map(async (slot) => {
          // 2a. Create the timeslot
          const newSlot = await tenantPrisma.labTimeSlot.create({
            data: {
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              labId: lab.id,
              availablePCs: totalPCs,
              clientAdminId: clientAdmin.id,
            },
          });

          // 2b. Create a default batch for this timeslot
          await tenantPrisma.batch.create({
            data: {
              name: `${name} ${slot.day} ${slot.startTime} - ${slot.endTime}`,
              labTimeSlotId: newSlot.id,
              clientAdminId: clientAdmin.id,
            },
          });

          return newSlot;
        })
      );
    }

    console.log("GET LAB DATA AFTER CREATION:", lab);

    console.log("GET LAB DATA AFTER CRETAION:", lab);

    // ✅ 3. Log activity
    await logActivity({
      clientAdminId: clientAdminId,
      entity: "LAB",
      entityId: lab.id.toString(),
      action: "CREATE",
      message: `Lab Created: ${lab.id}`,
      dbUrl: user.dbUrl,
    });

    res.status(201).json({
      message: "Lab created successfully",
      lab,
      timeSlots: createdSlots,
    });
  } catch (error: any) {
    console.error("❌ Error creating lab:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Helper: check if batch has students assigned
async function batchHasStudents(tenantPrisma: any, batchId: number) {
  const studentCount = await tenantPrisma.studentCourse.count({
    where: { batchId },
  });
  return studentCount > 0;
}

export async function updateLabController(req: Request, res: Response) {
  const { id } = req.params;
  const { name, location, totalPCs, timeSlots } = req.body;

  console.log("GET LAB DATA IN BODY FOR UPDATING:", req.body);
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ message: "ClientAdmin not found" });
    }

    const existingLab = await tenantPrisma.lab.findUnique({
      where: {
        id: Number(id),
      },
    });

    console.log("GET EXISTING LAB DATA:", existingLab);

    const existingLabTimeSlot = await tenantPrisma.labTimeSlot.findMany({
      where: {
        labId: Number(id),
      },
      include: {
        batches: {
          include: {
            studentCourses: true,
          },
        },
      },
    });

    const existingSlots = await tenantPrisma.labTimeSlot.findMany({
      where: { labId: Number(id) },
      include: {
        batches: {
          include: {
            studentCourses: true,
          },
        },
      },
    });

    console.log("GET EXISTING LAB TIME SLOTS DATA:", existingLabTimeSlot);

    const timeSlotIds = existingLabTimeSlot.map((slot) => slot.id);

    const existingBatches = await tenantPrisma.batch.findMany({
      where: {
        labTimeSlotId: {
          in: timeSlotIds,
        },
      },
    });

    console.log(
      "GET EXISTING ALL BATCHES FOR LAB AND TIMESLOTS DATA:",
      existingBatches
    );

    // Identify slots that have students
    const protectedSlotIds = existingSlots
      .filter((slot) => slot.batches.some((b) => b.studentCourses.length > 0))
      .map((slot) => slot.id);

      // 🔴 DELETE REMOVED TIMESLOTS (IMPORTANT FIX)

      // 1️⃣ Get IDs sent from frontend
      const incomingSlotIds = timeSlots
        .filter((slot: any) => slot.id)
        .map((slot: any) => slot.id);

      // 2️⃣ Find DB slots that were removed in UI
      const slotsToDelete = existingSlots.filter(
        (slot) => !incomingSlotIds.includes(slot.id)
      );

      // 3️⃣ Delete safely
      for (const slot of slotsToDelete) {
        // ❌ Do not allow delete if students are assigned
        if (protectedSlotIds.includes(slot.id)) {
          return res.status(400).json({
            error: `Cannot delete timeslot ${slot.startTime}-${slot.endTime} because students are assigned.`,
          });
        }

        // ✅ Delete related batches first
        await tenantPrisma.batch.deleteMany({
          where: { labTimeSlotId: slot.id },
        });

        // ✅ Delete timeslot
        await tenantPrisma.labTimeSlot.delete({
          where: { id: slot.id },
        });

        console.log("🗑️ Deleted timeslot:", slot.id);
      }

    // 3️⃣ Update lab info
    await tenantPrisma.lab.update({
      where: { id: Number(id) },
      data: { name, location, totalPCs },
    });

    // 4️⃣ Process each timeslot
    for (const slot of timeSlots) {
      if (slot.id) {
        // Existing slot → update only if no students
        if (protectedSlotIds.includes(slot.id)) {
          // Cannot edit time/day for slots with students
          const oldSlot = existingSlots.find((s) => s.id === slot.id);
          if (
            oldSlot &&
            (oldSlot.day !== slot.day ||
              oldSlot.startTime !== slot.startTime ||
              oldSlot.endTime !== slot.endTime)
          ) {
            return res.status(400).json({
              error: `Cannot update timeslot ${slot.id} because students are assigned.`,
            });
          }
        } else {
          // Safe to update slot
          await tenantPrisma.labTimeSlot.update({
            where: { id: slot.id },
            data: {
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              availablePCs: totalPCs, // reset available PCs if needed
            },
          });

          // Update batch names if exist
          await tenantPrisma.batch.updateMany({
            where: { labTimeSlotId: slot.id },
            data: {
              name: `${name} ${slot.day} ${slot.startTime} - ${slot.endTime}`,
            },
          });
        }
      } else {
        // New slot → create
        const newSlot = await tenantPrisma.labTimeSlot.create({
          data: {
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            labId: Number(id),
            clientAdminId,
            availablePCs: totalPCs,
          },
        });

        // Optional: create default batch for new slot
        await tenantPrisma.batch.create({
          data: {
            name: `${name} ${slot.day} ${slot.startTime} - ${slot.endTime}`,
            labTimeSlotId: newSlot.id,
            clientAdminId,
          },
        });
      }
    }

    res.json({
      message: "Lab updated successfully with student safety rules.",
    });
  } catch (error) {
    console.error("❌ Error Updating labs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getLabController(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;

    // 📄 Pagination & Search
    const pageNum = parseInt(req.query.page as string, 10) || 1;
    const limitNum = parseInt(req.query.limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const search = req.query.search as string | undefined;

    // 🔍 Build filters
    const where: any = { clientAdminId };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // 🧩 Fetch labs with relations
    const labs = await tenantPrisma.lab.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        timeSlots: {
          include: {
            allocations: {
              include: {
                student: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    // 🧮 Compute per-lab and per-timeslot counts
    const labsWithPcInfo = labs.map((lab) => {
      let totalAllocated = 0;
      let totalAvailable = 0;

      const timeSlots = lab.timeSlots.map((slot) => {
        const allocatedPCs = slot.allocations.length;
        const totalPCs = lab.totalPCs; // Each timeslot uses same lab PCs
        const availablePCs = Math.max(totalPCs - allocatedPCs, 0);

        totalAllocated += allocatedPCs;
        totalAvailable += availablePCs;

        return {
          id: slot.id,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalPCs,
          allocatedPCs,
          availablePCs,
          allocations: slot.allocations.map((a) => ({
            studentId: a.student.id,
            fullName: a.student.fullName,
            pcNumber: a.pcNumber,
          })),
        };
      });

      return {
        id: lab.id,
        name: lab.name,
        location: lab.location,
        isActive: lab.isActive,
        totalPCs: lab.totalPCs,
        totalAllocated,
        totalAvailable,
        usedPercent:
          lab.totalPCs > 0
            ? Math.round(
                (totalAllocated / (lab.totalPCs * timeSlots.length)) * 100
              )
            : 0,
        timeSlots,
      };
    });

    // 🌍 Overall stats (useful for dashboard/export)
    const totalCount = await tenantPrisma.lab.count({ where });

    const overall = labsWithPcInfo.reduce(
      (acc, lab) => {
        acc.totalPCs += lab.totalPCs * lab.timeSlots.length;
        acc.totalAllocated += lab.totalAllocated;
        acc.totalAvailable += lab.totalAvailable;
        return acc;
      },
      { totalPCs: 0, totalAllocated: 0, totalAvailable: 0 }
    );

    console.log(
      "GET LAB DATA:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      labsWithPcInfo
    );
    console.log(
      "GET Availbale PC DATA:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      overall
    );
    console.log(
      "GET TOTAL PC AVAILABILITY::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::",
      overall.totalPCs,
      overall.totalAllocated,
      overall.totalAvailable
    );
    // 🧾 Response
    return res.status(200).json({
      message: "Labs fetched successfully",
      labs: labsWithPcInfo,
      overallStats: {
        totalPCs: overall.totalPCs,
        totalAllocated: overall.totalAllocated,
        totalAvailable: overall.totalAvailable,
      },
      pagination: {
        totalLabs: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
      totalPages: Math.ceil(totalCount / limitNum),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error("❌ Error fetching labs:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
function activityLogger(arg0: {
  clientAdminId: string;
  entity: string;
  entityId: string;
  action: string;
  message: string;
}) {
  throw new Error("Function not implemented.");
}
