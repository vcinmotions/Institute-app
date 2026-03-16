import { Request, Response } from "express";
import { titleCase } from "../utils/Normalize";
import { testQuerySchema } from "../validators/test.query";
import { getTests } from "../services/test.service";

export async function addTestController(
  req: Request,
  res: Response
) {
  const { name, batchId, courseId } = req.body;

  console.log("GET TEST DATA in REQ.BODY:", req.body);

  if (!name || !batchId || !courseId) {
    return res.status(400).json({
      error: "name and batchId are required",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const normalizedTestName = titleCase(name);

    // ✅ Step 1: Check if Batch Exists
    const batchExists = await tenantPrisma.batch.findFirst({
      where: {
        id: Number(batchId),
        clientAdminId: user.clientAdminId,
      },
    });

    if (!batchExists) {
      return res.status(404).json({
        error: "Batch not found ❌",
      });
    }
    // ✅ Step 2: Check if Batch Exists
    const courseExists = await tenantPrisma.course.findFirst({
      where: {
        id: Number(courseId),
        clientAdminId: user.clientAdminId,
      },
    });

    if (!courseExists) {
      return res.status(404).json({
        error: "Course not found ❌",
      });
    }

    // ✅ Step 2: Check if Test Already Exists for this Batch
    const existingTest = await tenantPrisma.test.findFirst({
      where: {
        name: normalizedTestName,
        batchId: Number(batchId),
        courseId: Number(courseId),
      },
    });

    if (existingTest) {
      return res.status(409).json({
        error: "Test already exists for this batch ❌",
      });
    }

    // ✅ Step 3: Create Test
    const test = await tenantPrisma.test.create({
      data: {
        name: normalizedTestName,
        batchId: Number(batchId),
        courseId: Number(courseId),
        clientAdminId: user.clientAdminId,
      },
    });

    console.log("TEST CREATED:", test);

    return res.status(201).json({
      message: "Test created successfully ✅",
      test,
    });
  } catch (err: any) {
    console.error("Error creating test:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Duplicate test entry ❌",
      });
    } 

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function editTestController(
  req: Request,
  res: Response
) {
  const { id, name, batchId } = req.body;

  console.log("EDIT TEST DATA in REQ.BODY:", req.body);

  if (!id) {
    return res.status(400).json({
      error: "id is required",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // ✅ Step 1: Check if Test Exists (Tenant Safe)
    const existingTest = await tenantPrisma.test.findFirst({
      where: {
        id: Number(id),
        batch: {
          clientAdminId: user.clientAdminId,
        },
      },
      include: {
        batch: true,
      },
    });

    if (!existingTest) {
      return res.status(404).json({
        error: "Test not found ❌",
      });
    }

    let normalizedTestName: string | undefined;
    let finalBatchId = existingTest.batchId;

    // ✅ Step 2: If batchId provided, verify batch exists
    if (batchId) {
      const batchExists = await tenantPrisma.batch.findFirst({
        where: {
          id: Number(batchId),
          clientAdminId: user.clientAdminId,
        },
      });

      if (!batchExists) {
        return res.status(404).json({
          error: "Batch not found ❌",
        });
      }

      finalBatchId = Number(batchId);
    }

    // ✅ Step 3: Normalize name if provided
    if (name) {
      normalizedTestName = titleCase(name);

      // Prevent duplicate test in same batch
      const duplicateTest = await tenantPrisma.test.findFirst({
        where: {
          name: normalizedTestName,
          batchId: finalBatchId,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (duplicateTest) {
        return res.status(409).json({
          error: "Test already exists for this batch ❌",
        });
      }
    }

    // ✅ Step 4: Update Test
    const updatedTest = await tenantPrisma.test.update({
      where: {
        id: Number(id),
      },
      data: {
        name: normalizedTestName ?? existingTest.name,
        batchId: finalBatchId,
      },
    });

    console.log("TEST UPDATED:", updatedTest);

    return res.status(200).json({
      message: "Test updated successfully ✅",
      updatedTest,
    });

  } catch (err: any) {
    console.error("Error updating test:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function addStudentTestController(
  req: Request,
  res: Response
) {
  const {
    studentId,
    testId,
    assignedDate,
    testDate,
    description,
    facultyId,
  } = req.body;

  console.log("ADD STUDENT TASK DATA in REQ.BODY:", req.body);

  // ✅ Validation
  if (!studentId || !testId || !assignedDate || !testDate || !description) {
    return res.status(400).json({
      error: "studentId, taskId, assignedDate, dueDate and description are required ❌",
    });
  }

  const parsedStudentId = Number(studentId);
  const parsedTestIdId = Number(testId);
  const parsedFacultyId = facultyId ? Number(facultyId) : null;

  if (isNaN(parsedStudentId) || isNaN(parsedTestIdId)) {
    return res.status(400).json({
      error: "studentId and taskId must be valid numbers ❌",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // ✅ Step 1: Check if Student Exists
    const student = await tenantPrisma.student.findFirst({
      where: {
        id: parsedStudentId,
        clientAdminId: user.clientAdminId,
      },
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found ❌",
      });
    }

    // ✅ Step 2: Check if Task Exists
    const test = await tenantPrisma.test.findFirst({
      where: {
        id: parsedTestIdId,
        status: "DRAFT",
        clientAdminId: user.clientAdminId,
      },
    });

    if (!test) {
      return res.status(404).json({
        error: "Test not found ❌",
      });
    }

    // ✅ Step 3: Prevent Duplicate Assignment
    const existingStudentTest = await tenantPrisma.studentTest.findFirst({
      where: {
        studentId: parsedStudentId,
        testId: parsedTestIdId,
      },
    });

    if (existingStudentTest) {
      return res.status(409).json({
        error: "Test already assigned to this student ❌",
      });
    }

    // ✅ Step 4: Create StudentTask
    const studentTest = await tenantPrisma.studentTest.create({
      data: {
        studentId: parsedStudentId,
        testId: parsedTestIdId,
        testName: test.name,
        courseId: test.courseId,
        assignedDate: new Date(assignedDate),
        testDate: new Date(testDate),
        description,
        status: "PENDING",
        clientAdminId: user.clientAdminId,
      },
    });

    console.log("STUDENT TASK CREATED:", studentTest);

    return res.status(201).json({
      message: "Student test created successfully ✅",
      studentTest,
    });
  } catch (err: any) {
    console.error("Error creating student test:", err);

    return res.status(500).json({
      error: "Internal server error ❌",
    });
  }
}

export async function getTestController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = testQuerySchema.parse(req.query);

    const result = await getTests({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    return res.status(200).json({
      message: "Test fetched successfully",
      test: result.data,
      total: result.total,
      totalPages: result.totalPages,
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