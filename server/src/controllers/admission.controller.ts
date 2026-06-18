// controllers/studentController.ts
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import { studentCreateSchema, studentEditSchema, studentOpeningBalanceSchema, studentQuerySchema } from "../validators/student.query";
import { createStudentOpeningBalanceService, createStudentService, editStudentService, getStudents } from "../services/student.service";

export async function addStudentControllerNew(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string")
      return res.status(401).json({ error: "Unauthorized request" });


    console.log("STUDENTADMISSION:", req.body);
    console.log("STUDENTADMISSION FILE:", req.file);
      // ✅ Validate input
      const data = studentCreateSchema.parse({
      ...req.body,

       idCard: req.body.idCard === "true",
       bag: req.body.bag === "true",

      photoUrl: req.file ? `/uploads/students/${req.file.filename}` : null,
      courseData: (typeof req.body.courseData === "string" 
        ? JSON.parse(req.body.courseData) 
        : req.body.courseData
      ).map((c: any) => ({
        ...c,
        courseId: Number(c.courseId),
        batchId: Number(c.batchId),
        feeAmount: Number(c.feeAmount),
        installmentTypeId: c.installmentTypeId ? Number(c.installmentTypeId) : undefined,
      })),
      advancePayments: req.body.advancePayments ? 
        (typeof req.body.advancePayments === "string" 
          ? JSON.parse(req.body.advancePayments) 
          : req.body.advancePayments
        ).map((p: any) => ({
          ...p,
          courseId: Number(p.courseId),
          advanceAmount: Number(p.advanceAmount),
        })) : undefined,
    });

    console.log("PARSED DATA:", data);

    // ✅ Call Service Layer
    const result = await createStudentService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    // ✅ Update enquiry if student is converted
    if (data.id) {
      await prisma.enquiry.update({
        where: { id: data.id },
        data: { studentId: result.student.id, isConverted: true },
      });
    }

    // ✅ Log Activity
    await logActivity({
      clientAdminId: user.clientAdminId,
      entity: "Student",
      entityId: result.student.id.toString(),
      action: "CREATE",
      message: `New student admitted: ${result.student.fullName}`,
      dbUrl: user.dbUrl,
    });

    return res.status(201).json({
      message: "Student admitted successfully",
      ...result,
    });
  } catch (err: any) {
    console.error("FULL ERROR:", err);

  if (err.name === "ZodError") {
    console.log(JSON.stringify(err.errors, null, 2));

    return res.status(400).json({
      error: err.errors,
    });
  }
    console.error("❌ Admission Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createstudentOpeningBalanceController(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string")
      return res.status(401).json({ error: "Unauthorized request" });


    console.log("STUDENTADMISSION:", req.body);
      // ✅ Validate input
      const data = studentOpeningBalanceSchema.parse({ ...req.body });

      console.log("SUCCESSSSSSSS")

    // ✅ Call Service Layer
    const result = await createStudentOpeningBalanceService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    console.log("RESULT FOR OPENING BALANCE:", result);

    // ✅ Log Activity
    await logActivity({
      clientAdminId: user.clientAdminId,  
      entity: "Student Opening Balance",
      entityId: result.id.toString(),
      action: "CREATE",
      message: `New student create with Opening Balance: ${result.fullName}`,
      dbUrl: user.dbUrl,
    });

    return res.status(201).json({
      message: "Student Opening Balance Successfully Created",
      ...result,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("❌ Admission Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function upsertAdmissionConfig(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    const { prefix, suffix, separator, numberLength } = req.body;

    const config = await prisma.admissionNumberConfig.upsert({
      where: { clientAdminId: user.clientAdminId },

      update: {
        prefix,
        suffix,
        separator,
        numberLength: Number(numberLength),
      },

      create: {
        clientAdminId: user.clientAdminId,
        prefix,
        suffix,
        separator,
        numberLength: Number(numberLength),
        currentNumber: 1,
      },
    });

    return res.json({
      message: "Admission config saved",
      config,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save config" });
  }
}

export async function getAdmissionConfig(req: any, res: any) {
  try {
    console.log("USER:", req.user);
    console.log("PRISMA:", !!req.tenantPrisma);

    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const config = await prisma.admissionNumberConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    return res.json(config);
  } catch (err) {
    console.error("GET CONFIG ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function editStudentController(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string")
      return res.status(401).json({ error: "Unauthorized request" });


    console.log("editStudentController editStudentController editStudentController editStudentController:", req.body, req.params);
      // ✅ Validate input
      const data = studentEditSchema.parse({
        id: Number(req.params.id),
      ...req.body
    });

    // ✅ Call Service Layer
    const result = await editStudentService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    // ✅ Log Activity with changeReason
    await logActivity({
      clientAdminId: user.clientAdminId,
      entity: "Student",
      entityId: result.student.id.toString(),
      action: "UPDATE",
      message: `Student updated: ${data.changeReason || "No reason provided"}`,
      dbUrl: user.dbUrl,
    });

    return res.status(200).json({
      message: "Student Updated successfully",
      ...result,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("❌ Admission Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function addStudentController(req: Request, res: Response) {
//   const { id, name, contact, course, email } = req.body;

//   if (!id || !name || !contact || !course || !email) {
//     return res.status(400).json({ error: 'Missing tenant id or student details' });
//   }

//   console.log("Student data", id, name, contact, course, email);

//   console.log("Student data in addAdmission Controller", req.body);

//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user from middlerware", user);

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     // For Role Base Validation
//     // if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
//     //   return res.status(403).json({ error: 'Forbidden: insufficient role' });
//     // }

//     const email = user.email;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: 'Client admin not found' });
//     }

//     // 3. Create student under that admin

//     console.log("Student Created Successfully");

//     return res.status(201).json({ message: 'Student created successfully' });
//   } catch (err) {
//     console.error('Error creating student:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// export async function getStudentController(req: Request, res: Response) {
//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;
//     const tenant = req.tenantInfo;

//     console.log("Get tenant user in getEnquiryController", user);

//     console.log("Get tenant Info in getEnquiryController", tenant);

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const email = user.email;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
//       where: { email: email },
//     });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     console.log("🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂get ClientAdmin in getEnquiryController:", clientAdmin);

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
//     if (!allClientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     const clientAdminId = user.clientAdminId;

//     console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

//     // 2.1 ✅ Extract query params
//     const {
//       page,
//       limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder, // default descending
//       courseId,
//       admissionDate
//     } = req.query;

//     console.log("get ALl Params in get student:", page, limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder, 
//       courseId);

//     const pageNum = parseInt(page as string, 10);
//     const limitNum = parseInt(limit as string, 10);
//     const skip = (pageNum - 1) * limitNum;

//      // ✅ Build search filter
//     const where = {
//       clientAdminId,
//       ...(search
//         ? {
//             OR: [
//               { fullName: { contains: search as string } },
//               { email: { contains: search as string } },
//               { studentCode: { contains: search as string } },
//               { contact: { contains: search as string } },
//             ],
//           }
//         : {}),
//         // ✅ Apply optional filters
//         // ...(courseId && { courseId: courseId }),
//       ...(courseId
//         ? {
//             studentCourses: {
//               some: {
//                 courseId: Number(courseId),
//               },
//             },
//           }
//         : {}),
//          // ...(createDate && { createdAt: { gte: new Date(createDate as string) } }),
//         ...(admissionDate && (() => {
//           const start = new Date(admissionDate as string);
//           start.setHours(0, 0, 0, 0);

//           const end = new Date(admissionDate as string);
//           end.setHours(23, 59, 59, 999);

//           return {
//             admissionDate: {
//               gte: start,
//               lte: end,
//             },
//           };
//         })()),
//     };

//     // ✅ Fetch paginated, sorted, and filtered enquiries
//     const student = await tenantPrisma.student.findMany({
//       where,
//       orderBy: {
//         [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
//       },
//       // orderBy:
//       // sortField && sortField !== "leadStatus"
//       //   ? { [sortField as string]: sortOrder === "asc" ? "asc" : "desc" }
//       //   : undefined,
//       skip,
//       take: limitNum,
//       include: {
//         labAllocations: true,
//         studentCourses: true,
//       },
//     });

//     // ✅ Total count (for frontend pagination)
//     //const totalPages = await tenantPrisma.student.count({ where });

//     const totalCount = await tenantPrisma.student.count({ where });
//     const totalPages = Math.ceil(totalCount / limitNum);

//     console.log(
//       "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 Students Fetched Successfully",
//       student,
//       totalCount,
//       totalPages,
//       pageNum,
//       limitNum
//     );

//     return res.status(200).json({
//       message: "Students fetched successfully",
//       student,
//       totalPages,
//       totalCount,
//       page: pageNum,
//       limit: limitNum,
//     });

//     //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
//   } catch (err) {
//     console.error("Error Fetched Enquiry:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function getStudentController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = studentQuerySchema.parse(req.query);

    console.log("STUDENT QUERY IN GET STUDETM CONTROLLER:", query);

    const result = await getStudents({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    console.log("STUDENT DATA IN GET STUDETM CONTROLLER:", result);

    return res.status(200).json({
      message: "Students fetched successfully",
      ...result,
      page: query.page,
      limit: query.limit,
    });

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error(err);
    console.error("FULL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

// export async function getStudentController(req: Request, res: Response) {

//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user from middlerware", user);

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     const email = user.email;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: 'Client admin not found' });
//     }

//     // 3. Create student under that admin
//     const student = await tenantPrisma.student.findMany({
//     });

//     console.log("Student Fetched Successfully", student);

//     return res.status(201).json({ message: 'Student Fetched successfully', student });
//   } catch (err) {
//     console.error('Error Fetched student:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// Student data in addAdmission Controller {
//   name: 'demo',
//   email: 'demo@gmail.com',
//   contact: '+919898989898',
//   course: 'Java',
//   idProofType: 'aadhar card',
//   idProofNumber: '9876543210',
//   admissionDate: '2025-10-07T14:14',
//   feeAmount: '10000',
//   paymentType: 'INSTALLMENT',
//   gender: 'Female',
//   residentialAddress: 'ggegtrthbrhbygnjhygfynjmnkhgtfrdesfghbyn',
//   permenantAddress: 'thumnmyumjhyumyujmyumyuyhttgfdrsfgrthynjmhgtf',
//   parentsContact: '9898989898',
//   fatherName: 'demo',
//   motherName: 'demo',
//   dob: '00-00-0000',
//   religion: 'Hindu',
//   profilePicture: {
//     path: './tanjiro-kamado-3840x2160-22691.jpg',
//     relativePath: './tanjiro-kamado-3840x2160-22691.jpg'
//   }
// }

export async function getStudentCourseController(req: Request, res: Response) {
  const { id } = req.params;

  console.log("Get Stiudent Id in GetStudentCourseControlle:", id);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;
    const tenant = req.tenantInfo;

    console.log("Get tenant user in getEnquiryController", user);

    console.log("Get tenant Info in getEnquiryController", tenant);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    const studentCourses = await tenantPrisma.studentCourse.findMany({
      where: { studentId: parseInt(id) },
      include: {
        course: true,
      },
    });

    const detailedCourses = await Promise.all(
      studentCourses.map(async (sc) => {
        const feeStructure = await tenantPrisma.feeStructure.findUnique({
          where: {
            studentId_courseId: {
              studentId: sc.studentId,
              courseId: sc.courseId,
            },
          },
        });

        const feeRecords = await tenantPrisma.studentFee.findMany({
          where: {
            studentId: sc.studentId,
            courseId: sc.courseId,
          },
        });

        return {
          studentCourse: sc,
          feeStructure,
          feeRecords,
        };
      })
    );

    return res.status(200).json({
      message: "Students Course fetched successfully",
      detailedCourses,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createAdmissionNumberConfigController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { prefix, suffix, numberLength } = req.body;

    // Check if config already exists
    const existingConfig = await prisma.admissionNumberConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    if (existingConfig) {
      return res.status(400).json({
        error: "Admission number configuration already exists",
      });
    }

    // const config = await prisma.admissionNumberConfig.create({
    //   data: {
    //     prefix: prefix || null,
    //     suffix: suffix || null,
        
    //     numberLength: numberLength ? Number(numberLength) : 4,
    //     clientAdminId: user.clientAdminId,
    //   },
    // });

    return res.status(201).json({
      message: "Admission number configuration created successfully",
    
    });

  } catch (err) {
    console.error("❌ Create Admission Config Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateAdmissionNumberConfigController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { prefix, suffix, numberLength, currentNumber } = req.body;

    const existingConfig = await prisma.admissionNumberConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    if (!existingConfig) {
      return res.status(404).json({
        error: "Admission number configuration not found",
      });
    }

    const updatedConfig = await prisma.admissionNumberConfig.update({
      where: { clientAdminId: user.clientAdminId },
      data: {
        prefix: prefix ?? existingConfig.prefix,
        suffix: suffix ?? existingConfig.suffix,
        numberLength: numberLength
          ? Number(numberLength)
          : existingConfig.numberLength,
        currentNumber: currentNumber
          ? Number(currentNumber)
          : existingConfig.currentNumber,
      },
    });

    return res.status(200).json({
      message: "Admission number configuration updated successfully",
      config: updatedConfig,
    });

  } catch (err) {
    console.error("❌ Update Admission Config Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}