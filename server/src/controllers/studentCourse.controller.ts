// controllers/studentController.ts
import { Request, Response } from 'express';
import { studentCourseQuerySchema } from '../validators/student.course.query';
import { getStudentsCourses } from '../services/student.course.service';

export async function addStudentCourseController(req: Request, res: Response) {
  const {
    id,
    name,
    contact,
    email,
    residentialAddress,
    permenantAddress,
    idProofType,
    idProofNumber,
    admissionDate,
    course, // <-- course name as string
    feeAmount,         // 💵 New
    paymentType,       // e.g., 'ONE_TIME' or 'INSTALLMENT'
    religion,
    fatherName,
    motherName,
    dob,
    gender,
    parentsContact,
  } = req.body;

  console.log("Student data in addStudentCourseController", req.body);

  if (!name || !contact || !admissionDate || !course || !fatherName || !dob || !gender) {
    return res.status(400).json({ error: 'Missing required student information' });
  }

  if (!feeAmount || !paymentType) {
    return res.status(400).json({ error: 'Fee amount and payment type are required' });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
    //   where: { email: user.email },
    // });

    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    const clientAdminId = user.clientAdminId;

    // const clientAdminId = clientAdmin.id;

    // 🔍 1. Check if course with the given name exists
    let courseRecord = await tenantPrisma.course.findFirst({
      where: {
        name: course,
      },
    });

    // ➕ 2. If not, create the course
    if (!courseRecord) {
      courseRecord = await tenantPrisma.course.create({
        data: {
          name: course,
          durationWeeks: 12, // default duration — change if needed
          description: `${course} course`,
          clientAdminId,
        },
      });

      console.log(`🆕 Created new course: ${courseRecord.name}`);
    }

    const courseId = courseRecord.id;

    // 🎓 3. Generate unique student code
    // const lastStudent = await tenantPrisma.student.findFirst({
    //   orderBy: { id: 'desc' },
    //   select: { studentCode: true },
    // });

    // let studentCode = 'SD001';
    // if (lastStudent?.studentCode) {
    //   const num = parseInt(lastStudent.studentCode.slice(2)) + 1;
    //   studentCode = `SD${num.toString().padStart(3, '0')}`;
    // }

    // 🎓 3. Generate unique student code
    const lastStudent = await tenantPrisma.student.findFirst({
      orderBy: { id: 'desc' },
      select: { studentCode: true, serialNumber: true },
    });

    let studentCode = 'SD001';
    let serialNumber = 1;

    if (lastStudent?.studentCode) {
      const num = parseInt(lastStudent.studentCode.slice(2)) + 1;
      studentCode = `SD${num.toString().padStart(3, '0')}`;
    }

    if (lastStudent?.serialNumber) {
      serialNumber = lastStudent.serialNumber + 1;
    }

    // 👤 4. Create student
    // 👤 4. Create student
    const student = await tenantPrisma.student.create({
      data: {
        serialNumber, // ✅ Include this
        studentCode,
        fullName: name,
        contact: contact,
        email,
        residentialAddress,
        permenantAddress,
        idProofType,
        idProofNumber,
        admissionDate: new Date(admissionDate),
        clientAdminId,

        // ✅ Add the missing required fields
        religion: req.body.religion,
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        parentsContact: req.body.parentsContact,
        dob: req.body.dob,              // Make sure this is a valid string (e.g., '2003-05-25')
        gender: req.body.gender,
      },
    });


    // 🔗 5. Attach student to course
    const studentCourse = await tenantPrisma.studentCourse.create({
      data: {
        studentId: student.id,
        courseId,
        studentCode: student.studentCode,
        startDate: new Date(admissionDate),
        endDate: new Date(admissionDate), // can adjust using course duration later
        status: 'ACTIVE',
        clientAdminId,
      },
    });

    // 💰 6. Create FeeStructure
    const feeStructure = await tenantPrisma.feeStructure.create({
      data: {
        studentId: student.id,
        courseId,
        totalAmount: parseFloat(feeAmount),      // from req.body
        paymentType,                             // from req.body ('ONE_TIME' or 'INSTALLMENT')
        clientAdminId,
      },
    });

    // 💳 7. Create StudentFee
    const studentFee = await tenantPrisma.studentFee.create({
      data: {
        studentId: student.id,
        courseId,
        dueDate: new Date(admissionDate),
        amountDue: feeStructure.totalAmount,
        amountPaid: 0,
        paymentMode: 'CASH',
        receiptNo: `RCP${Date.now()}`,
        paymentStatus: 'PENDING',
        clientAdminId,
      },
    });

    if (id) {
      await tenantPrisma.enquiry.update({
        where: { id: id },
        data: {
          studentId: student.id,
          isConverted: true,
        },
      });
    }

    const getAllStudent = await tenantPrisma.student.findMany();

    console.log('✅ Student, course and fee created successfully.');

    return res.status(201).json({
      message: 'Student admission created successfully',
      student,
      studentCourse,
      studentFee,
      getAllStudent,
    });
  } catch (err) {
    console.error('❌ Error creating student:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// export async function getStudentCourseController(req: Request, res: Response) {

//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;
//     const tenant = req.tenantInfo;

//     console.log("Get tenant user in getEnquiryController", user);

//     console.log("Get tenant Info in getEnquiryController", tenant);

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     const email = user.email;   

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: 'Client admin not found' });
//     }

//     console.log("get ClientAdmin in getEnquiryController:", clientAdmin);

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
//     if (!allClientAdmin) {
//       return res.status(404).json({ error: 'Client admin not found' });
//     }

//     console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

//     // 2.1 ✅ Extract query params
//     const {
//       page,
//       limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder,       // default descending
//     } = req.query;

//     console.log("get ALl Params:", sortField, sortOrder);

//     const pageNum = parseInt(page as string, 10);
//     const limitNum = parseInt(limit as string, 10);
//     const skip = (pageNum - 1) * limitNum;

//     // ✅ Build search filter
//     // const where: any = {};
//     // if (search) {
//     //   where.OR = [
//     //     { fullName: { contains: search, mode: "insensitive" } },
//     //     { email: { contains: search, mode: "insensitive" } },
//     //     { studentCode: { contains: search, mode: "insensitive" } },
//     //     { contact: { contains: search, mode: "insensitive" } },
//     //     // Add more searchable fields as needed
//     //   ];
//     // }

//    const where: any = {
//     ...(search && {
//         OR: [
//         {
//             student: {
//             OR: [
//                 { fullName: { contains: search, mode: "insensitive" } },
//                 { email: { contains: search, mode: "insensitive" } },
//                 { studentCode: { contains: search, mode: "insensitive" } },
//                 { contact: { contains: search, mode: "insensitive" } },
//             ],
//             },
//         },
//         {
//             course: {
//             OR: [
//                 { name: { contains: search, mode: "insensitive" } },
//                 { description: { contains: search, mode: "insensitive" } },
//             ],
//             },
//         },
//         ],
//     }),
//     };

//     // 3. Create student under that admin
//     // const enquiry = await tenantPrisma.enquiry.findMany({
//     // });

//     // ✅ Fetch paginated, sorted, and filtered enquiries
//     const studentCourse = await tenantPrisma.studentCourse.findMany({
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
//         student: true,      // 👈 includes related Student
//         course: true,       // 👈 includes related Course     // (optional)
//         batch: {
//           include: {
//             faculty: true,
//           }
//         },        // (optional)
        
//       },
//     });

//     // ✅ Total count (for frontend pagination)
//     const totalPages = await tenantPrisma.studentCourse.count({ where });

//     if(!studentCourse) {
//       return res.status(404).json({ error: 'studentCourse not found' });
//     }

//     const detailedCourses = await Promise.all(studentCourse.map(async (sc) => {
        
//       const feeStructure = await tenantPrisma.feeStructure.findUnique({
//         where: {
//           studentId_courseId: {
//             studentId: sc.studentId,
//             courseId: sc.courseId
//           }
//         }
//       });

//       const feeRecords = await tenantPrisma.studentFee.findMany({
//         where: {
//           studentId: sc.studentId,
//           courseId: sc.courseId,
//         }
//       });

//       return {
//         studentCourse: sc,
//         feeStructure,
//         feeRecords,
//       };
//     }));

//     console.log("Student Course Fetched Successfully", studentCourse, detailedCourses, totalPages, pageNum, limitNum);

//     return res.status(200).json({
//       message: "Student Course fetched successfully",
//       studentCourse,
//       detailedCourses,
//       totalPages,
//       page: pageNum,
//       limit: limitNum,
//     });

//     //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
//   } catch (err) {
//     console.error('Error Fetched Enquiry:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// export async function getStudentCourseController(req: Request, res: Response) {
//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     const clientAdminId = user.clientAdminId;

//     // ✅ Extract query params
//     const {
//       page = '1',
//       limit = '10',
//       search,
//       sortField = 'startDate',
//       sortOrder = 'desc',
//       courseId,
//       batchId,
//       facultyId, // 👈 New filters
//     } = req.query;

//     const pageNum = parseInt(page as string, 10);
//     const limitNum = parseInt(limit as string, 10);
//     const skip = (pageNum - 1) * limitNum;

//     // Build where clause
//     const where: any = {
//       clientAdminId,
//       ...(search && {
//         OR: [
//           {
//             student: {
//               OR: [
//                 { fullName: { contains: search } },
//                 { email: { contains: search } },
//                 { studentCode: { contains: search } },
//                 { contact: { contains: search } },
//               ],
//             },
//           },
//           {
//             course: {
//               OR: [
//                 { name: { contains: search } },
//                 { description: { contains: search } },
//               ],
//             },
//           },
//         ],
//       }),
//       ...(courseId ? { courseId: Number(courseId) } : {}),
//       ...(batchId ? { batchId: Number(batchId) } : {}),
//       ...(facultyId
//         ? {
//             batch: {
//               facultyId: Number(facultyId),
//             },
//           }
//         : {}),
//     };
    
//     const validSortFields = ["startDate", "endDate"];
//     const orderByField = validSortFields.includes(sortField as string)
//       ? (sortField as string)
//       : "startDate"; // fallback if user sends invalid sortField

//     // ✅ Fetch paginated data
//     const studentCourse = await tenantPrisma.studentCourse.findMany({
//       where,
//       orderBy: { [orderByField as string]: sortOrder === "asc" ? "asc" : "desc" },
//       skip,
//       take: limitNum,
//       include: {
//         student: {
//           include: {
//             attendance: {
//               include: {
//                 course: true,
//                 markedBy: true,
//               }
//             }
//           }
//         },
//         course: true,
//         certificate: true,
//         completions: true,
//         batch: {
//           include: {
            
//             faculty: true,
//             labTimeSlot: true,
//           },
//         },
//       },
//     });

//     // ✅ Total count for pagination
//     const totalPages = await tenantPrisma.studentCourse.count({ where });

//     // ✅ Add fee details
//     const detailedCourses = await Promise.all(
//       studentCourse.map(async (sc) => {
//         const feeStructure = await tenantPrisma.feeStructure.findUnique({
//           where: {
//             studentId_courseId: {
//               studentId: sc.studentId,
//               courseId: sc.courseId,
//             },
//           },
//         });

//         const feeRecords = await tenantPrisma.studentFee.findMany({
//           where: {
//             studentId: sc.studentId,
//             courseId: sc.courseId,
//           },
//         });

//         return {
//           studentCourse: sc,
//           feeStructure,
//           feeRecords,
//         };
//       })
//     );

//     console.log("GET STUDENTS BASED ON COURSE BATCH AND FACUKTY:", studentCourse);

//     return res.status(200).json({
//       message: "Student Course fetched successfully ✅",
//       studentCourse,
//       detailedCourses,
//       totalPages,
//       page: pageNum,
//       limit: limitNum,
//     });
//   } catch (err) {
//     console.error("Error fetching studentCourse:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function getStudentCourseController(
  req: Request,
  res: Response
) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = studentCourseQuerySchema.parse(req.query);

    const result = await getStudentsCourses({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    console.log("Students Courses ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅:", result);

    return res.json({
      message: "Student Course fetched successfully ✅",
      ...result,
      page: query.page,
      limit: query.limit,
    });

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error("Error fetching student course:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getStudentCoursebyIdController(req: Request, res: Response) {
  const { id } = req.params;

  console.log("Get Stiudent Id in GetStudentCourseControlle:", id);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;
    const tenant = req.tenantInfo;

    console.log("Get tenant user in getEnquiryController", user);

    console.log("Get tenant Info in getEnquiryController", tenant);

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    const email = user.email;   

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: 'Client admin not found' });
    }

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    const studentCourses = await tenantPrisma.studentCourse.findMany({
      where: { studentId: parseInt(id) }
    });

    const detailedCourses = await Promise.all(studentCourses.map(async (sc) => {
      const feeStructure = await tenantPrisma.feeStructure.findUnique({
        where: {
          studentId_courseId: {
            studentId: sc.studentId,
            courseId: sc.courseId
          }
        }
      });

      const feeRecords = await tenantPrisma.studentFee.findMany({
        where: {
          studentId: sc.studentId,
          courseId: sc.courseId,
        }
      });

      return {
        studentCourse: sc,
        feeStructure,
        feeRecords,
      };
    }));

    return res.status(200).json({
      message: "Students Course fetched successfully",
      detailedCourses,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error('Error Fetched Enquiry:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}