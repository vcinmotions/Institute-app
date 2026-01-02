import { Request, Response } from "express";

export async function getLogController(req: Request, res: Response) {

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user in getCourseController", user);


    if (!tenantPrisma || !user || typeof user === 'string') {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    const email = user.email;   

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // console.log("get ClientAdmin in getEnquiryController:", clientAdmin);

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: 'Client admin not found' });
    }

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    // 2.1 ✅ Extract query params
    const {
      page,
      limit,
      search,
      sortField, // default sort by created date
      sortOrder,       // default descending
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
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        // Add more searchable fields as needed
      ];
    }

    // 3. Create student under that admin
    // const enquiry = await tenantPrisma.enquiry.findMany({
    // });

    // ✅ Fetch paginated, sorted, and filtered enquiries
    const log = await tenantPrisma.activityLog.findMany({
      where,
      // orderBy: {
      //   [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
      // },
      skip,
      take: limitNum,
    });

    // ✅ Total count (for frontend pagination)
    const totalPages = await tenantPrisma.activityLog.count({ where });

    console.log("logs Fetched Successfully", log, totalPages, pageNum, limitNum);

    return res.status(200).json({
      message: "log fetched successfully",
      log,
      totalPages,
      page: pageNum,
      limit: limitNum,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error('Error Fetched log:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}