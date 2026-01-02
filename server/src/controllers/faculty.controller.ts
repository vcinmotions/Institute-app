import { Request, Response } from "express";
import bcrypt from "bcryptjs";

export async function addFacultyController(req: Request, res: Response) {
  const { name, email, password, contact, joiningDate, batchId, courseId } =
    req.body;

  if (!name || !email || !contact || !joiningDate || !batchId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("GET FACULTY CREATE DETAILS:", req.body);

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: user.clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const clientAdminId = user.clientAdminId;

    // ✅ Create Faculty
    const faculty = await tenantPrisma.faculty.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        joiningDate: new Date(joiningDate.split("/").reverse().join("-")),
        contact,
        role: "FACULTY",
        country: clientAdmin.country,
        state: clientAdmin.state,
        city: clientAdmin.city,
        zipCode: clientAdmin.zipCode,
        clientAdminId: clientAdminId,
      },
    });

    // ✅ Assign faculty to batch
    await tenantPrisma.batch.update({
      where: { id: Number(batchId) },
      data: { facultyId: faculty.id },
    });

    return res.status(201).json({
      message: "Faculty created and assigned to batch ✅",
      faculty,
    });
  } catch (err: any) {
    console.error("Error:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Faculty email already registered",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateFacultyController(req: Request, res: Response) {
  const { name, email, contact } = req.body;
  const { id } = req.params;

  if (!name || !email || !contact) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("GET FACULTY UPDATE DETAILS:", req.body);

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: user.clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const clientAdminId = user.clientAdminId;

    // ✅ Create Faculty
    const faculty = await tenantPrisma.faculty.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
        contact,
        role: "FACULTY",
        country: clientAdmin.country,
        state: clientAdmin.state,
        city: clientAdmin.city,
        zipCode: clientAdmin.zipCode,
        clientAdminId: clientAdminId,
      },
    });

    return res.status(201).json({
      message: "Faculty created and assigned to batch ✅",
      faculty,
    });
  } catch (err: any) {
    console.error("Error:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Faculty email already registered",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getFacultyController(req: Request, res: Response) {
  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user in getFacultyController", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

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

    console.log("get allClientAdmin in getFacultyController:", allClientAdmin);

    // 2.1 ✅ Extract query params
    const {
      page,
      limit,
      search,
      sortField, // default sort by created date
      sortOrder, // default descending
      leadStatus, // 👈 Add this
    } = req.query;

    console.log("get ALl Params:", sortField, sortOrder);

    // const pageNum = parseInt(page as string, 10);
    // const limitNum = parseInt(limit as string, 10);
    // const skip = (pageNum - 1) * limitNum;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // ✅ Build search filter
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contact: { contains: search, mode: "insensitive" } },
        // Add more searchable fields as needed
      ];
    }

    // 3. Create student under that admin
    // const enquiry = await tenantPrisma.enquiry.findMany({
    // });

    // ✅ Fetch paginated, sorted, and filtered enquiries
    const faculty = await tenantPrisma.faculty.findMany({
      where,
      // orderBy: {
      //   [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
      // },
      skip,
      take: limitNum,
      include: {
        batches: true,
      },
    });

    // ✅ Total count (for frontend pagination)
    const totalPages = await tenantPrisma.faculty.count({ where });

    console.log(
      "Faculty Fetched Successfully",
      faculty,
      totalPages,
      pageNum,
      limitNum
    );

    return res.status(200).json({
      message: "Faculty fetched successfully",
      faculty,
      totalPages,
      page: pageNum,
      limit: limitNum,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched Faculty:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function assignFacultyToBatch(req: Request, res: Response) {
  const { facultyId, batchId } = req.body;

  if (!facultyId || !batchId) {
    return res.status(400).json({ error: "facultyId & batchId required" });
  }

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user in getFacultyController", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    await tenantPrisma.batch.update({
      where: { id: Number(batchId) },
      data: { facultyId: Number(facultyId) },
    });

    return res.status(200).json({
      message: "Faculty updated for batch ✅",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function assignBatchToFacultyController(
  req: Request,
  res: Response
) {
  const { facultyId, batchId } = req.body;

  console.log("GET ASSIGNED BATCH TO FACULTY :", req.body);

  if (!facultyId || !batchId) {
    return res
      .status(400)
      .json({ error: "Missing required fields: facultyId or batchId" });
  }

  console.log("ASSIGN NEW BATCH TO FACULTY:", req.body);

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // ✅ Verify the faculty exists
    const faculty = await tenantPrisma.faculty.findUnique({
      where: { id: Number(facultyId) },
    });

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // ✅ Verify the batch exists
    const batch = await tenantPrisma.batch.findUnique({
      where: { id: Number(batchId) },
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // ✅ Check if batch already assigned to another faculty
    if (batch.facultyId && batch.facultyId !== faculty.id) {
      return res.status(409).json({
        error: "This batch is already assigned to another faculty",
      });
    }

    // ✅ Assign batch to faculty
    const updatedBatch = await tenantPrisma.batch.update({
      where: { id: Number(batchId) },
      data: { facultyId: faculty.id },
      include: { faculty: true },
    });

    return res.status(200).json({
      message: "Batch successfully assigned to faculty ✅",
      updatedBatch,
    });
  } catch (err: any) {
    console.error("Error assigning batch to faculty:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getFacultyBatches(req: Request, res: Response) {
  try {
    const { facultyId } = req.params;
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const facultyBatches = await tenantPrisma.batch.findMany({
      where: { facultyId: Number(facultyId) },
      include: {
        faculty: true,
        labTimeSlot: true,
        studentCourses: {
          include: {
            student: true,
            course: true,
            batch: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });

    if (!facultyBatches.length) {
      return res
        .status(404)
        .json({ message: "No batches found for this faculty." });
    }

    return res.status(200).json({ batches: facultyBatches });
  } catch (error) {
    console.error("❌ Error fetching faculty batches:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
