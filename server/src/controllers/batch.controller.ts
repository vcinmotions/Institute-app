import { Request, Response } from "express";
import { batchQuerySchema } from "../validators/batch.query";
import { getBatches } from "../services/batch.service";

export async function addBatchController(req: Request, res: Response) {
  const { name, labTimeSlotId, facultyId } = req.body;

  if (!name || !labTimeSlotId) {
    return res.status(400).json({ error: "name & labTimeSlotId are required" });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { email: user.email },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // ✅ Check existing batch for same timeslot
    const existing = await tenantPrisma.batch.findFirst({
      where: {
        labTimeSlotId,
        clientAdminId: clientAdmin.id,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Batch already exists for this lab and time slot ❌",
      });
    }

    const batch = await tenantPrisma.batch.create({
      data: {
        name,
        labTimeSlot: { connect: { id: labTimeSlotId } },
        faculty: facultyId ? { connect: { id: facultyId } } : undefined,
        clientAdmin: { connect: { id: clientAdmin.id } },
      },
      include: {
        labTimeSlot: true,
        faculty: true,
        batchCourses: {
          include: {
            course: true,
            batch: true,
          },
        },
      },
    });

    

    return res.status(201).json({
      message: "Batch created successfully ✅",
      batch,
    });
  } catch (err: any) {
    console.error("Error creating batch:", err);

    // ✅ Prisma unique constraint error friendly response
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Batch already exists for this lab and time slot ❌",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function getBatchController(req: Request, res: Response) {
//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user in getFacultyController", user);

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const email = user.email;
//     const clientAdminId = user.clientAdminId;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
//     // if (!clientAdmin) {
//     //   return res.status(404).json({ error: 'Client admin not found' });
//     // }

//     // console.log("get ClientAdmin in getFacultyController:", clientAdmin);

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
//     if (!allClientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     console.log("get allClientAdmin in getFacultyController:", allClientAdmin);

//     // 2.1 ✅ Extract query params
//     const {
//       page,
//       limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder, // default descending
//       leadStatus, // 👈 Add this
//     } = req.query;

//     console.log("get ALl Params:", sortField, sortOrder);

//     // const pageNum = parseInt(page as string, 10);
//     // const limitNum = parseInt(limit as string, 10);
//     // const skip = (pageNum - 1) * limitNum;

//     const pageNum = parseInt(page as string, 10) || 1;
//     const limitNum = parseInt(limit as string, 10) || 10;
//     const skip = (pageNum - 1) * limitNum;

//     // ✅ Build search filter
//     // const where: any = {};
//     // if (search) {
//     //   where.OR = [
//     //     { name: { contains: search } },
//     //     // Add more searchable fields as needed
//     //   ];
//     // }

//     const where = {
//       clientAdminId,
//       ...(search
//         ? {
//             OR: [
//               { name: { contains: search as string } },
//             ],
//           }
//         : {}),
//     };

//     // 3. Create student under that admin
//     // const enquiry = await tenantPrisma.enquiry.findMany({
//     // });

//     // ✅ Fetch paginated, sorted, and filtered enquiries
//     const batch = await tenantPrisma.batch.findMany({
//       where,
//       // orderBy: {
//       //   [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
//       // },
//       skip,
//       take: limitNum,
//       include: {
//         faculty: true,
//         studentCourses: {
//           include: {
//             student: true,
//             course: true,
//           },
//         },
//         batchCourses: {
//           include: {
//             course: true,
//             batch: true,
//           },
//         },
//         labTimeSlot: {
//           include: {
//             lab: true
//           }
//         },
//       },
//     });

//     // ✅ Total count (for frontend pagination)
//     const totalCount = await tenantPrisma.batch.count({ where });
//     const totalPages = Math.ceil(totalCount / limitNum);

//     console.log("GET BATCH DATA IN GET BATCH CONTROLLER:", batch);

//     console.log(
//       "Faculty Fetched Successfully",
//       batch,
//       totalPages,
//       totalCount,
//       pageNum,
//       limitNum
//     );

//     return res.status(200).json({
//       message: "Faculty fetched successfully",
//       batch,
//       totalPages,
//       totalCount,
//       page: pageNum,
//       limit: limitNum,
//     });

//     //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
//   } catch (err) {
//     console.error("Error Fetched Faculty:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function getBatchController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = batchQuerySchema.parse(req.query);

    const result = await getBatches({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    return res.json({
      message: "Bathces fetched successfully",
      ...result,
      page: query.page,
      limit: query.limit,
    });

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllBatchController(req: Request, res: Response) {
  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user in BATCHES", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

     const onlyAvailable = req.params.onlyAvailable === "true"; // path param as boolean

     console.log("available pc query ONLYYYYYYYYYYYYYYYYYYYYYYYYYYYYY:", onlyAvailable);

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // console.log("get ClientAdmin in getFacultyController:", clientAdmin);

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    console.log("get allClientAdmin in BATCHES:", allClientAdmin);
  
    // ✅ Fetch paginated, sorted, and filtered enquiries
    // const batch = await tenantPrisma.batch.findMany({
    //   include: {
    //     faculty: true,
    //     studentCourses: {
    //       include: {
    //         student: true,
    //         course: true,
    //       },
    //     },
    //     batchCourses: {
    //       include: {
    //         course: true,
    //         batch: true,
    //       },
    //     },
    //     labTimeSlot: true,
    //   },
    // });

    // Fetch all batches
    const batches = await tenantPrisma.batch.findMany({
      include: {
        faculty: true,
        studentCourses: {
          include: {
            student: true,
            course: true,
          },
        },
        batchCourses: {
          include: {
            course: true,
            batch: true,
          },
        },
        labTimeSlot: {
          include: {
            lab: true
          }
        },
      },
    });

    console.log("AL BATCHED ADAT:", batches);

      const responseBatches = onlyAvailable
      ? batches.filter((batch) => {
          if (!batch.labTimeSlot) return false;

          const totalPCs = batch.labTimeSlot.lab.totalPCs || 0;
          const enrolled = batch.studentCourses?.length || 0;
          const remainingPCs = totalPCs - enrolled;

          return totalPCs > 0;
        })
      : batches;


      console.log("BATHCEDSSSSSSSSSSSSSSSSSSSSSSS:", responseBatches);
    return res.status(200).json({
      message: "BATCHES fetched successfully",
      batch: responseBatches,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched BATCHES:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}