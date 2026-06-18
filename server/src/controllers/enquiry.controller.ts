// controllers/enquiryController.ts
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import redis from "../redis/redis";
import { convertEnquiryService, createEnquiryService, editEnquiryService, getEnquiries, getEnquiryByIdService, markEnquiryHoldService, markEnquiryLostService } from "../services/enquiry.service";
import { enquiryCreateSchema, enquiryEditSchema, enquiryQuerySchema } from "../validators/enquiry.query";
import { getWonEnquiries } from "../services/won.enquiry.service";
import { logNotification } from "../utils/templates/notificationLogger";

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

     const last = await tenantPrisma.enquiry.findFirst({
      where: { clientAdminId },
      orderBy: { srNo: "desc" },
      select: { srNo: true },
    });

    const nextSrNo = (last?.srNo ?? 0) + 1;

    // 3. Create student under that admin
    const enquiry = await tenantPrisma.enquiry.create({
      data: {
        srNo: nextSrNo,
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
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("ENQUIRY DATA TO CREATE ENQUIRY IN BODY:", req.body);

    // ✅ Validate input
    const data = enquiryCreateSchema.parse(req.body);

    console.log("SUCCESSFUL ENQURY CREATE BODY PARSED!", req.body);

    // ✅ Call service layer
    const enquiry = await createEnquiryService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    console.log("SUCCESSFUL ENQURY CREATED!", enquiry);

    // ✅ Side effects
    // await logNotification({
    //   clientAdminId: user.clientAdminId,
    //   enquiryId: enquiry.id,
    //   message: `New enquiry created for ${enquiry.name} - ${enquiry.contact.split("+91")[1]}`,
    //   dbUrl: user.dbUrl,
    // })

    await logActivity({
      clientAdminId: user.clientAdminId,
      entity: "Enquiry",
      entityId: enquiry.id,
      action: "CREATE",
      message: `New enquiry created for: ${enquiry.name}. Contact: ${enquiry.contact.split("91")[1]}`,
      dbUrl: user.dbUrl,
    });

    return res.status(201).json({
      message: "Enquiry created successfully",
      enquiry,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    if (err.message?.includes("exists")) {
      return res.status(409).json({ error: err.message });
    }

    if (err.name === "ZodError") {
      console.error("Zod validation failed:", err.errors);
      return res.status(400).json({ error: err.errors });
    } 
    
    console.error("Error creating enquiry:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

export async function editEnquiryController(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.tenantPrisma || !req.user || typeof req.user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1️⃣ Validate request
    const data = enquiryEditSchema.parse(req.body);

    console.log("EDIT ENQUIRY REQ BODY:", req.body);

    // 2️⃣ Call service
    const enquiry = await editEnquiryService({
      prisma: req.tenantPrisma,
      clientAdminId: req.user.clientAdminId,
      data,
    });

    console.log("EDIT ENQUIRY DATA 🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐:", enquiry);

    return res.status(200).json({
      message: "Enquiry updated successfully",
      enquiry,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(400).json({ error: error.message });
  }
}

export async function getEnquiryController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = enquiryQuerySchema.parse(req.query);

    const result = await getEnquiries({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    return res.json({
      message: "Enquiries fetched successfully",
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

export async function getWonEnquiryController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = enquiryQuerySchema.parse(req.query);

    const result = await getWonEnquiries({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    return res.json({
      message: "Won Enquiries fetched successfully",
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

export async function getEnquiryByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Enquiry ID is required" });
    }

    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const enquiry = await getEnquiryByIdService({
      prisma,
      enquiryId: id,
      clientAdminId: user.clientAdminId,
    });

    return res.status(200).json({
      message: "Enquiry fetched by Id successfully",
      enquiry,
    });
  } catch (error: any) {
    console.error("Error fetching enquiry:", error);
    return res.status(500).json({ error: error.message });
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
  try {
    // 1. Use values injected by middleware
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Missing tenant email or Enquiry details" });
    }

    const enquiry = await convertEnquiryService({
      prisma,
      enquiryId: id,
      clientAdminId: user.clientAdminId,
    });

    return res
      .status(201)
      .json({ message: "Enquiry Converting Enquiry to WON successfully", enquiry });
  } catch (err) {
    console.error("Error Converting Enquiry to WON:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function lostEnquiryController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { remark, enquiryId } = req.body;
    if (!remark || !enquiryId) {
      return res.status(400).json({ error: "Remark and Enquiry ID are required" });
    }

    const result = await markEnquiryLostService({
      prisma,
      enquiryId,
      clientAdminId: user.clientAdminId,
      remark,
    });

    return res.status(200).json({
      message: "Enquiry marked as LOST and final follow-up created",
      enquiry: result.enquiry,
      finalFollowUp: result.finalFollowUp,
    });
  } catch (err: any) {
    console.error("Error marking enquiry as LOST:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function holdEnquiryController(req: Request, res: Response) {
  try {
    // 1. Use values injected by middleware
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { remark, enquiryId } = req.body;
    if (!remark || !enquiryId) {
      return res.status(400).json({ error: "Remark and Enquiry ID are required" });
    }

    // ✅ 1. Update the enquiry’s lead status to WON (or COLD if you prefer)
    const result = await markEnquiryHoldService({
      prisma,
      enquiryId,
      clientAdminId: user.clientAdminId,
      remark,
    });

    console.log("HOLD HOLD HOLD HOLD HOLD HOLD")

    return res.status(201).json({
      message: "Enquiry marked as HOLD and final follow-up created",
      finalFollowUp: result,
    });
  } catch (err) {
    console.error("Error Enquiry marked as LOST and final follow-up created:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
