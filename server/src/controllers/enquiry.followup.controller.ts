// controllers/enquiryController.ts
import { Request, Response } from 'express';

export async function addFollowUpController(req: Request, res: Response) {
   const { enquiryId, scheduledAt, remark } = req.body;

  if (!enquiryId || !scheduledAt || !remark ) {
    return res.status(400).json({ error: 'Missing tenant email or Enquiry details' });
  }

  console.log("Enquiry data", enquiryId, scheduledAt, remark);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from middlerware", user);

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    const email = user.email;   

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    const updateEnquiryLeadStatus = await tenantPrisma.enquiry.update({ where: { id: enquiryId}, data: { leadStatus: "HOT"}});

    console.log("Updated Lead Status to Hot", updateEnquiryLeadStatus);

    // 3. Create student under that admin
    const followUp = await tenantPrisma.followUp.create({
        data: {
        enquiry: { connect: { id: enquiryId } },
        scheduledAt: new Date(scheduledAt),
        remark,
        },
    });

    console.log("Enquiry Follow Up Created Successfully", followUp);

    return res.status(201).json({ message: 'Enquiry Follow Up created successfully', followUp });
  } catch (err) {
    console.error('Error creating Enquiry Follow Up:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateFollowUpController(req: Request, res: Response) {
  const { id } = req.params;
  const { enquiryId, scheduledAt, remark } = req.body;

  console.log("Pending FollowUp Id:", id);
  console.log("get data from req body for update followup", enquiryId, scheduledAt, remark);

  if (!id || !enquiryId || !scheduledAt || !remark) {
    return res.status(400).json({ error: 'Missing required fields for follow-up update.' });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    const email = user.email;

    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
    //   where: { email },
    // });s

    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // ✅ 1️⃣ Update the existing follow-up as completed
    const updatedFollowUp = await tenantPrisma.followUp.update({
      where: { id },
      data: {
        enquiry: { connect: { id: enquiryId } },
        doneAt: new Date(),
        followUpStatus: "COMPLETED"
      },
    });

    console.log("🔄 Follow-up updated successfully:", updatedFollowUp);

    // ✅ 2️⃣ Check the enquiry's current lead status
    const enquiry = await tenantPrisma.enquiry.findUnique({
      where: { id: enquiryId },
      select: { leadStatus: true },
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    // ✅ 3️⃣ If leadStatus is HOLD, update to HOT
    if (enquiry.leadStatus === "HOLD") {
      await tenantPrisma.enquiry.update({
        where: { id: enquiryId },
        data: { leadStatus: "HOT" },
      });
      console.log("🔥 Enquiry lead status updated from HOLD → HOT");
    }

    const getEnquiryUpdate = await tenantPrisma.enquiry.findUnique({
      where: {
        id: enquiryId
      }
    })

    console.log("📌 GET UPDATIND ENQUIRY AFTER CREATING NEXT FOLLOW_UP", getEnquiryUpdate);

     // ✅ 4️⃣ Create a new PENDING follow-up
    const createNewFollowUp = await tenantPrisma.followUp.create({
      data: {
        enquiry: { connect: { id: enquiryId } },
        scheduledAt: new Date(scheduledAt),
        remark,
        followUpStatus: "PENDING"
      },
    });

    console.log("🔄 New Follow-up created successfully:", createNewFollowUp);
 
    return res.status(200).json({ message: 'Follow-up updated successfully', followUp: createNewFollowUp });
  } catch (err) {
    console.error('❌ Error updating follow-up:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFollowUpController(req: Request, res: Response) {

  const { id } = req.params;

  console.log("get Enquiry Id:", id)

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from middlerware", user);

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // 3. Create student under that admin
    const followUps = await tenantPrisma.enquiry.findUnique({
      where: { id },
      include: {
        followUps: true
      }
    });

    
    // ✅ Get only follow-ups for the given enquiry ID
    const followup = await tenantPrisma.followUp.findMany({
      where: {
        enquiryId: id,
      },
      orderBy: {
        scheduledAt: 'desc', // Optional: order by upcoming first
      },
    });

    console.log("Enquiry Id FollowUp Fetched Successfully", followup, followUps);

    return res.status(201).json({ message: 'Enquiry Id FollowUp Fetched successfully', followup, followUps });
  } catch (err) {
    console.error('Error Fetched Enquiry FollowUp:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


export async function editFollowUpController(req: Request, res: Response) {
  const { id } = req.params;
  const { scheduledAt, remark, followUpStatus } = req.body;

  console.log("Editing FollowUp Id:", id);
  console.log("Request Body:", scheduledAt, remark, followUpStatus);

  // Basic validation
  if (!id || !scheduledAt || !remark) {
    return res.status(400).json({ error: 'Missing required fields for follow-up edit.' });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    // Update the existing follow-up
    const updatedFollowUp = await tenantPrisma.followUp.update({
      where: { id },
      data: {
        scheduledAt: new Date(scheduledAt),
        remark,
        ...(followUpStatus ? { followUpStatus } : {}), // Optional: allow status change
      },
    });

    console.log("Follow-up edited successfully:", updatedFollowUp);

    return res.status(200).json({ message: 'Follow-up updated successfully', followUp: updatedFollowUp });
  } catch (err) {
    console.error('Error editing follow-up:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function completeFollowUpController(req: Request, res: Response) {
    const { remark, enquiryId } = req.body;

  if ( !remark || !enquiryId ) {
    return res.status(400).json({ error: 'Missing tenant email or Enquiry details' });
  }

  console.log("Enquiry Follow Up data", remark);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user from middlerware", user);

    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    // ✅ 1. Update the enquiry’s lead status to WON (or COLD if you prefer)
    const updatedEnquiry = await tenantPrisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        leadStatus: 'WON', // You can also use "COLD" if that fits your workflow
        isConverted: true, // Mark as converted if applicable
      },
    });

    // ✅ 2. Mark all previous follow-ups for this enquiry as COMPLETED
    const completeOldFollowUps = await tenantPrisma.followUp.updateMany({
      where: { enquiryId },
      data: { followUpStatus: 'COMPLETED', doneAt: new Date() },
    });

    console.log("followUp Updated Created Successfully", completeOldFollowUps);

     // ✅ 3. Create one final completed follow-up with the user remark
    const finalFollowUp = await tenantPrisma.followUp.create({
      data: {
        enquiry: { connect: { id: enquiryId } },
        remark,
        doneAt: new Date(),
        followUpStatus: 'COMPLETED',
      },
    });

    console.log("🔄 New Follow-up created successfully:", finalFollowUp);

    return res.status(201).json({ message: 'FollowUp Updated Created Successfully', finalFollowUp });
  } catch (err) {
    console.error('Error followUp Updated:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}