// controllers/enquiryController.ts
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import redis from "../redis/redis";

export async function addEnquiryController(req: Request, res: Response) {
  const { name, contact, course, source, email: enquiryEmail, alternateContact, age, location, gender, dob, referedBy } = req.body;

  if (!name || !contact) {
    return res
      .status(400)
      .json({ error: "Missing tenant Email or Contact Enquiry details" });
  }

  console.log("Enquiry data", name, contact, course, source);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user; //Fetching User injected in AuthMiddlerware from Token!

    console.log(
      "Get Admin User from AuthMiddlerware from Token in Enquiry Controller",
      user
    );

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;
    const clientAdminId = user.clientAdminId;

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // ✅ Check if enquiry email already exists in this tenant
    const existingEnquiry = await tenantPrisma.enquiry.findFirst({
      where: { email: enquiryEmail, contact },
    });

    if (existingEnquiry) {
      return res.status(409).json({
        error: "Email already exists in enquiries. Try another Email.",
      });
    }

    // 3. Create student under that admin
    const enquiry = await tenantPrisma.enquiry.create({
      data: {
        name: name,
        contact: contact,
        email: enquiryEmail,
        course: course,
        source: source,
        clientAdminId: clientAdminId,
      },
    });

    // ✅ Log the creation
    // const logs = await logActivity({
    //   clientAdminId: clientAdminId,
    //   entity: "Enquiry",
    //   entityId: enquiry.id.toString(),
    //   action: "CREATE",
    //   message: `New Enquiry created: ${enquiry.id}`,
    // });

    const message = `Create Follow-Up for ${enquiryEmail} (${enquiry.contact})`;

    const notification = await tenantPrisma.notification.create({
      data: {
        message,
        clientAdminId: clientAdminId,
        enquiryId: enquiry.id,
      },
    });

    console.log("Notification Created", notification);

    const logs = await logActivity({
      clientAdminId: clientAdminId,
      entity: "Enquiry",
      entityId: enquiry.id.toString(),
      action: "CREATE",
      message: `New Enquiry created: ${enquiry.id}`,
      dbUrl: user.dbUrl, // 👈 pass from JWT
    });

    console.log("Logs for Enquiry Created Successfully", logs);

    console.log("Enquiry Created Successfully", enquiry);

    // 4️⃣ Auto-create first follow-up (scheduled for +1 day)
    // const scheduledDate = new Date();
    // scheduledDate.setDate(scheduledDate.getDate() + 1); // +1 day

    // const followUp = await tenantPrisma.followUp.create({
    //   data: {
    //     enquiry: { connect: { id: enquiry.id } },
    //     scheduledAt: scheduledDate,
    //     remark: 'Initial follow-up scheduled',
    //     followUpStatus: 'PENDING',
    //   },
    // });

    //console.log('📝 Auto Follow-Up Created:', followUp);

    return res
      .status(201)
      .json({ message: "Enquiry created successfully", enquiry });
  } catch (err) {
    console.error("Error creating Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function addEnquiryControllerNew(req: Request, res: Response) {
  // const { name, contact, email, source, courseId } = req.body;
  const { name, contact, courseId, source, email, alternateContact, location, gender, dob, referedBy } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: "Missing required enquiry details" });
  }

  console.log("GET ENQUIRY CREATE DATA:", req.body)

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const clientAdminId = user.clientAdminId;

    // 1️⃣ Check for duplicate email
    if(email) {
    const existing = await tenantPrisma.enquiry.findFirst({
      where: { email },
    });

    
    if (existing) {
      return res.status(409).json({
        error: "Email already exists in enquiries",
      });
    }
    }

    // 1️⃣ Check for duplicate email
    if(contact) {
    const existingContact = await tenantPrisma.enquiry.findFirst({
      where: { contact },
    });

    
    if (existingContact) {
      return res.status(409).json({
        error: "Contact already exists in enquiries",
      });
    }
    }

    // 2️⃣ Calculate age from DOB
    let age: number | null = null;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();

      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // If birthday hasn't occurred yet this year, subtract 1
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
      }
    }

    // 2️⃣ Create enquiry
    const enquiry = await tenantPrisma.enquiry.create({
      data: {
        name,
        contact,
        email,
        source: source || null,
        alternateContact: alternateContact || null,
        age: age ? Number(age) : null,
        location: location || null,
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
        referedBy: referedBy || null,
        clientAdminId,
      },
    });

    // 3️⃣ Link enquiry to multiple courses
    if (Array.isArray(courseId) && courseId.length > 0) {
      const linkData = courseId.map((id: string | number) => ({
        enquiryId: enquiry.id,
        courseId: Number(id),
        clientAdminId,
      }));

      await tenantPrisma.enquiryCourse.createMany({
        data: linkData,
      });
    }

    // 4️⃣ Create notification
    await tenantPrisma.notification.create({
      data: {
        message: `Create Follow-Up for ${email} (${contact})`,
        enquiryId: enquiry.id,
        clientAdminId,
      },
    });

    // 5️⃣ Log activity
    await logActivity({
      clientAdminId,
      entity: "Enquiry",
      entityId: enquiry.id,
      action: "CREATE",
      message: `New enquiry created: ${enquiry.id}`,
      dbUrl: user.dbUrl,
    });

    return res.status(201).json({
      message: "Enquiry created successfully",
      enquiry,
    });
  } catch (err) {
    console.error("Error creating enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function editEnquiryController(req: Request, res: Response) {
  const { id, name, contact, courseId, source, email: enquiryEmail, alternateContact, dob, gender, location, referedBy } = req.body;

  console.log("get Edit Enquiry data", req.body);

  if (!id || !name || !contact || !courseId ) {
    return res.status(400).json({ error: "Missing required enquiry details" });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user; // Injected by middleware

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;

    const existingEnquiry = await tenantPrisma.enquiry.findUnique({
      where: { id },
    });

    console.log("GET EXISTING ENQUIRY:", existingEnquiry);

    if (!existingEnquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    if (existingEnquiry.leadStatus === "WON") {
      return res
        .status(409)
        .json({ error: "Enquiry has already been converted to admission" });
    }

    // 2️⃣ Calculate age from DOB
    let age: number | null = null;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();

      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      // If birthday hasn't occurred yet this year, subtract 1
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
      }
    }

    const updatedEnquiry = await tenantPrisma.enquiry.update({
      where: { id },
      data: {
        name,
        contact,
        email: enquiryEmail,
        source: source || null,
        alternateContact: alternateContact || null,
        age: age ? Number(age) : null,
        location: location || null,
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
        referedBy: referedBy || null,
        clientAdminId: clientAdminId,
      },
    });

    // 3️⃣ Link enquiry to multiple courses
    // 3️⃣ Link enquiry to multiple courses
    if (Array.isArray(courseId) && courseId.length > 0) {
      // 1️⃣ Delete old existing mappings
      await tenantPrisma.enquiryCourse.deleteMany({
        where: { enquiryId: id },
      });

      // 2️⃣ Create new mappings
      const linkData = courseId.map((course) => ({
        enquiryId: id, // FIX: enquiryId should be ENQUIRY ID (not course!)
        courseId: Number(course),
        clientAdminId,
      }));

      await tenantPrisma.enquiryCourse.createMany({
        data: linkData,
      });
    }

    console.log("ENQIRY EDITED!");

    // ✅ Log the update
    await logActivity({
      clientAdminId: clientAdminId,
      entity: "Enquiry",
      entityId: updatedEnquiry.id.toString(),
      action: "UPDATE",
      message: `Enquiry updated: ${updatedEnquiry.id}`,
      dbUrl: user.dbUrl,
    });

    console.log("Enquiry Updated Successfully:", updatedEnquiry);

    return res.status(200).json({
      message: "Enquiry updated successfully",
      enquiry: updatedEnquiry,
    });
  } catch (err) {
    console.error("Error updating Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getEnquiryController(req: Request, res: Response) {
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

    const leadStatusOrder = {
      HOT: 1,
      WARM: 2,
      COLD: 3,
      WON: 4,
      LOST: 5,
      HOLD: 6,
    };

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    //console.log("get ClientAdmin in getEnquiryController:", clientAdmin);

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const clientAdminId = user.clientAdminId;

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    // 2.1 ✅ Extract query params
    const {
      page,
      limit,
      search,
      sortField, // default sort by created date
      sortOrder, // default descending
      leadStatus, // 👈 Add this
      courseId,
      createDate,
    } = req.query;

    console.log("get ALl Params:", sortField, sortOrder);
    console.log("get ALl Params for Enquiry:", req.query);

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // 🔥 Redis cache key (tenant + pagination + filters)
    const cacheKey = `enquiry:${user.id}:${pageNum}:${limitNum}:${
      search || ""
    }:${sortField || ""}:${sortOrder || ""}:${leadStatus || ""}`;

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(
        "⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡ ⚡⚡ v v ⚡⚡ Enquiry served from Redis"
      );
      return res.status(200).json(JSON.parse(cachedData));
    }

    // ✅ Build search filter
    // const where: any = {};
    // if (search) {
    //   where.OR = [
    //     { name: { contains: search, mode: "insensitive" } },
    //     { email: { contains: search, mode: "insensitive" } },
    //     { course: { contains: search, mode: "insensitive" } },
    //     { contact: { contains: search, mode: "insensitive" } },
    //     // Add more searchable fields as needed
    //   ];
    // } // for prisma search filter

    // ✅ Build search filter
    // const where = {
    //   clientAdminId,
    //   ...(search
    //     ? {
    //         OR: [
    //           { name: { contains: search as string } },
    //           { email: { contains: search as string } },
    //         ],
    //       }
    //     : {}),
    // };

    const where: any = {
      clientAdminId,
      ...(search
        ? {
            OR: [
              { name: { contains: search as string } },
              { email: { contains: search as string } },
            ],
          }
        : {}),
      ...(leadStatus
        ? {
            leadStatus: leadStatus as string,
          }
        : {}),
        // ✅ Apply optional filters
        // ...(courseId && { courseId: courseId }),
      ...(courseId
        ? {
            enquiryCourse: {
              some: {
                courseId: Number(courseId),
              },
            },
          }
        : {}),
      // ...(createDate && { createdAt: { gte: new Date(createDate as string) } }),
        ...(createDate && (() => {
    const start = new Date(createDate as string);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createDate as string);
    end.setHours(23, 59, 59, 999);

    return {
      createdAt: {
        gte: start,
        lte: end,
      },
    };
  })()),
    };

    // if (leadStatus && typeof leadStatus === "string") {
    //   where.leadStatus = leadStatus;
    // }

    // 3. Create student under that admin
    // const enquiry = await tenantPrisma.enquiry.findMany({
    // });

    // ✅ Fetch paginated, sorted, and filtered enquiries
    const enquiry = await tenantPrisma.enquiry.findMany({
      where,
      // orderBy: {
      //   [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
      // },
      include: {
        enquiryCourse: {
          include: {
            course: true,
          },
        },
      },
      orderBy:
        sortField && sortField !== "leadStatus"
          ? { [sortField as string]: sortOrder === "asc" ? "asc" : "desc" }
          : undefined,
      skip,
      take: limitNum,
    });

    // Custom sort for leadStatus if requested
    if (sortField === "leadStatus") {
      enquiry.sort((a, b) => {
        if (sortOrder === "asc") {
          return leadStatusOrder[a.leadStatus] - leadStatusOrder[b.leadStatus];
        } else {
          return leadStatusOrder[b.leadStatus] - leadStatusOrder[a.leadStatus];
        }
      });
    }

    // ✅ Total count (for frontend pagination)
    //const totalPages = await tenantPrisma.enquiry.count({ where });
    const totalCount = await tenantPrisma.enquiry.count({ where });
    const totalPages = Math.ceil(totalCount / limitNum);
    // ✅ Additional counts
    const convertedCount = await tenantPrisma.enquiry.count({
      where: {
        ...where,
        isConverted: true,
        NOT: { studentId: null }, // ensures studentId exists
      },
    });

    const notConvertedCount = await tenantPrisma.enquiry.count({
      where: {
        ...where,
        OR: [{ isConverted: false }, { studentId: null }],
      },
    });

    // Fetch the data where isConverted = true and studentId = null
    const filteredEnquiries = await tenantPrisma.enquiry.findMany({
      where: {
        ...where,
        isConverted: true,
        studentId: null,
      },
      include: {
        enquiryCourse: {
          include: {
            course: true,
          },
        },
      },
      skip,
      take: limitNum,
    });

    console.log(
      "Enquiry Fetched Successfully",
      enquiry,
      totalPages,
      pageNum,
      limitNum,
      totalCount,
      convertedCount,
      notConvertedCount,
      filteredEnquiries
    );

    return res.status(200).json({
      message: "Enquiry fetched successfully",
      enquiry,
      filteredEnquiries,
      totalPages,
      totalCount,
      page: pageNum,
      limit: limitNum,
      convertedCount,
      notConvertedCount,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getEnquiryByIdController(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Missing tenant Id or Enquiry details" });
  }

  console.log("Enquiry Id", id);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from Enquiry Controller", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { email: email },
    });
    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // 3. Create student under that admin
    const enquiry = await tenantPrisma.enquiry.findUnique({
      where: {
        id: id,
      },
      include: {
        enquiryCourse: {
          include: {
            course: true,
          },
        },
      },
    });

    console.log("Enquiry Fetched Successfully", enquiry);

    return res
      .status(201)
      .json({ message: "Enquiry Fetched successfully", enquiry });
  } catch (err) {
    console.error("Error deleted Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteEnquiryController(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Missing tenant Id or Enquiry details" });
  }

  console.log("Enquiry Id", id);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from Enquiry Controller", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { email: email },
    });
    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    /// 1. Find all followUp IDs for the enquiry
    const followUps = await tenantPrisma.followUp.findMany({
      where: { enquiryId: id },
      select: { id: true },
    });
    const followUpIds = followUps.map((f) => f.id);

    // 2. Delete notifications first
    await tenantPrisma.notification.deleteMany({
      where: {
        followUpId: { in: followUpIds },
      },
    });

    // 3. Delete followUps
    await tenantPrisma.followUp.deleteMany({
      where: { enquiryId: id },
    });

    // 3. Create student under that admin
    const enquiry = await tenantPrisma.enquiry.delete({
      where: {
        id: id,
      },
      include: {
        followUps: true,
      },
    });

    console.log("Enquiry deleted Successfully", enquiry);

    return res
      .status(201)
      .json({ message: "Enquiry deleted successfully", enquiry });
  } catch (err) {
    console.error("Error deleted Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function convertEnquiryController(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Missing tenant email or Enquiry details" });
  }

  console.log("Enquiry data", id);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from middlerware", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { email: email },
    });
    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // 3. Create student under that admin
    const enquiry = await tenantPrisma.enquiry.update({
      where: { id },
      data: { isConverted: true },
    });

    console.log("Enquiry Follow Up Created Successfully", enquiry);

    return res
      .status(201)
      .json({ message: "Enquiry Follow Up created successfully", enquiry });
  } catch (err) {
    console.error("Error creating Enquiry Follow Up:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function lostdEnquiryController(req: Request, res: Response) {
  const { remark, enquiryId } = req.body;

  if (!remark || !enquiryId) {
    return res
      .status(400)
      .json({ error: "Missing tenant email or Enquiry details" });
  }

  console.log("Enquiry Follow Up data", remark);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from middlerware", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 0. Get client admin (we assume there's only one per tenant for now)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { email: email },
    });
    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // ✅ 1. Update the enquiry’s lead status to WON (or COLD if you prefer)
    const updatedEnquiry = await tenantPrisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        leadStatus: "LOST", // You can also use "COLD" if that fits your workflow
      },
    });

    //const updateEnquiryLeadStatus = await tenantPrisma.enquiry.update({ where: { id: enquiryId}, data: { leadStatus: "HOT"}});

    console.log("Updated Lead Status to COLD", updatedEnquiry);

    // ✅ 2. Mark all previous follow-ups for this enquiry as COMPLETED
    const completeOldFollowUps = await tenantPrisma.followUp.updateMany({
      where: { enquiryId },
      data: { followUpStatus: "COMPLETED", doneAt: new Date() },
    });

    console.log("followUp Updated Created Successfully", completeOldFollowUps);

    // ✅ 3. Create one final completed follow-up with the user remark
    const finalFollowUp = await tenantPrisma.followUp.create({
      data: {
        enquiry: { connect: { id: enquiryId } },
        remark,
        doneAt: new Date(),
        followUpStatus: "MISSED",
      },
    });

    console.log("🔄 New Follow-up created successfully:", finalFollowUp);

    return res.status(201).json({
      message: "FollowUp Updated Created Successfully",
      finalFollowUp,
    });
  } catch (err) {
    console.error("Error followUp Updated:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function holdEnquiryController(req: Request, res: Response) {
  const { remark, enquiryId } = req.body;

  if (!remark || !enquiryId) {
    return res
      .status(400)
      .json({ error: "Missing tenant email or Enquiry details" });
  }

  console.log("Enquiry Follow Up data", remark);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from middlerware", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { email: email },
    });
    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // ✅ 1. Update the enquiry’s lead status to WON (or COLD if you prefer)
    const updatedEnquiry = await tenantPrisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        leadStatus: "HOLD", // You can also use "COLD" if that fits your workflow
      },
    });

    //const updateEnquiryLeadStatus = await tenantPrisma.enquiry.update({ where: { id: enquiryId}, data: { leadStatus: "HOT"}});

    console.log("Updated Lead Status to COLD", updatedEnquiry);

    // ✅ 2. Mark all previous follow-ups for this enquiry as COMPLETED
    const completeOldFollowUps = await tenantPrisma.followUp.updateMany({
      where: { enquiryId },
      data: { followUpStatus: "COMPLETED", doneAt: new Date() },
    });

    console.log("followUp Updated Created Successfully", completeOldFollowUps);

    // ✅ 3. Create one final completed follow-up with the user remark
    const finalFollowUp = await tenantPrisma.followUp.create({
      data: {
        enquiry: { connect: { id: enquiryId } },
        remark,
        doneAt: new Date(),
        followUpStatus: "MISSED",
      },
    });

    console.log("🔄 New Follow-up created successfully:", finalFollowUp);

    return res.status(201).json({
      message: "FollowUp Updated Created Successfully",
      finalFollowUp,
    });
  } catch (err) {
    console.error("Error followUp Updated:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
