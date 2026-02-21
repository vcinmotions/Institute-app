import { titleCase } from "../utils/Normalize";
import { Request, Response } from "express";
import { taskQuerySchema } from "../validators/Task.query";
import { getTasks } from "../services/task.service";

export async function addTaskController(req: Request, res: Response) {
  const { name, batchId, courseId } = req.body;

  console.log("GET TASK DATA in REQ.BODY:", req.body);

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

    const normalizedTaskName = titleCase(name);

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
    const CourseExists = await tenantPrisma.course.findFirst({
      where: {
        id: Number(courseId),
        clientAdminId: user.clientAdminId,
      },
    });

    if (!CourseExists) {
      return res.status(404).json({
        error: "Course not found ❌",
      });
    }

    // ✅ Step 2: Create Task
    const task = await tenantPrisma.task.create({
      data: {
        name: normalizedTaskName,
        batchId: Number(batchId),
        courseId: Number(courseId),
        clientAdminId: user.clientAdminId,
      },
    });

    console.log("TASK CREATED:", task);

    return res.status(201).json({
      message: "Task created successfully ✅",
      task,
    });
  } catch (err: any) {
    console.error("Error creating task:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Task already exists for this batch ❌",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function editTaskController(
  req: Request,
  res: Response
) {
  const { id, name, batchId, courseId } = req.body;

  console.log("EDIT TASK DATA in REQ.BODY:", req.body);

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

    // ✅ Step 1: Check if Task Exists (Tenant Safe)
    const existingTask = await tenantPrisma.task.findFirst({
      where: {
        id: Number(id),
        batch: {
          clientAdminId: user.clientAdminId,
        },
      },
      include: {
        batch: true,
        course: true
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found ❌",
      });
    }

    let normalizedTaskName: string | undefined;
    let finalBatchId = existingTask.batchId;
    let finalCourseId = existingTask.courseId;

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

    // ✅ Step 2.5: If courseId provided, verify course exists
    if (courseId) {
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

      finalCourseId = Number(courseId);
    }

    // ✅ Step 3: Normalize name if provided
    if (name) {
      normalizedTaskName = titleCase(name);

      // Prevent duplicate task in same batch
      const duplicateTask = await tenantPrisma.task.findFirst({
        where: {
          name: normalizedTaskName,
          batchId: finalBatchId,
          courseId: finalCourseId,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (duplicateTask) {
        return res.status(409).json({
          error: "Task already exists for this batch ❌",
        });
      }
    }

    console.log("NAME FINAL BATCH ID AND COURSE ID:", normalizedTaskName, finalBatchId, finalCourseId);

    // ✅ Step 4: Update Task
    const updatedTask = await tenantPrisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        name: normalizedTaskName ?? existingTask.name,
        batchId: finalBatchId,
        courseId: finalCourseId,
      },
    });

    console.log("TASK UPDATED:", updatedTask);

    return res.status(200).json({
      message: "Task updated successfully ✅",
      updatedTask,
    });

  } catch (err: any) {
    console.error("Error updating task:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function addStudentTaskController(
  req: Request,
  res: Response
) {
  const {
    studentId,
    taskId,
    assignedDate,
    dueDate,
    description,
    facultyId,
  } = req.body;

  console.log("ADD STUDENT TASK DATA in REQ.BODY:", req.body);

  // ✅ Validation
  if (!studentId || !taskId || !assignedDate || !dueDate || !description) {
    return res.status(400).json({
      error: "studentId, taskId, assignedDate, dueDate and description are required ❌",
    });
  }

  const parsedStudentId = Number(studentId);
  const parsedTaskId = Number(taskId);
  const parsedFacultyId = facultyId ? Number(facultyId) : null;

  if (isNaN(parsedStudentId) || isNaN(parsedTaskId)) {
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
    const task = await tenantPrisma.task.findFirst({
      where: {
        id: parsedTaskId,
        clientAdminId: user.clientAdminId,
      },
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found ❌",
      });
    }

    // ✅ Step 3: Prevent Duplicate Assignment
    const existingStudentTask = await tenantPrisma.studentTask.findFirst({
      where: {
        studentId: parsedStudentId,
        taskId: parsedTaskId,
      },
    });

    if (existingStudentTask) {
      return res.status(409).json({
        error: "Task already assigned to this student ❌",
      });
    }

    // ✅ Step 4: Create StudentTask
    const studentTask = await tenantPrisma.studentTask.create({
      data: {
        studentId: parsedStudentId,
        taskId: parsedTaskId,
        courseId: task.courseId,
        assignedDate: new Date(assignedDate),
        dueDate: new Date(dueDate),
        description,
        status: "PENDING",
        facultyId: parsedFacultyId,
        clientAdminId: user.clientAdminId,
      },
    });

    console.log("STUDENT TASK CREATED:", studentTask);

    return res.status(201).json({
      message: "Student task created successfully ✅",
      studentTask,
    });
  } catch (err: any) {
    console.error("Error creating student task:", err);

    return res.status(500).json({
      error: "Internal server error ❌",
    });
  }
}


export async function getTaskController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = taskQuerySchema.parse(req.query);

    const result = await getTasks({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    return res.status(200).json({
      message: "Task fetched successfully",
      task: result.data,
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