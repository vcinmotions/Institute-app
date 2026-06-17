import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { normalizeEmail, normalizePhone, titleCase } from "../utils/Normalize";
import { startsWith } from "zod";
import { parseDate, parseDateISO } from "../helpers/date";
import { slugifyName } from "../utils/slug";

export async function addSourceController(req: Request, res: Response) {
  const { name } =
    req.body;

  if (!name ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const tables = await tenantPrisma.$queryRawUnsafe(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema='public';
`);

console.log(tables);

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: user.clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const existingSourceType = await tenantPrisma.sourceType.findUnique({
      where: {
        slug: slugifyName(name),
      },
    });

    if (existingSourceType) {
      return res.status(409).json({ error: "Source already exists" });
    }

    // ✅ Create Faculty
    const source = await tenantPrisma.sourceType.create({
      data: {
        name,
        slug: slugifyName(name),
      },
    });

    return res.status(201).json({
      message: "Source created ✅",
      source,
    });
  } catch (err: any) {
    console.error("Error:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Source already Exist",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateSourceController(req: Request, res: Response) {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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

    // ✅ Create Faculty
    const source = await tenantPrisma.sourceType.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });

    return res.status(201).json({
      message: "Source updated ✅",
      source,
    });
  } catch (err: any) {
    console.error("Error:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Source already exist",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSourceController(req: Request, res: Response) {
  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // 2.1 ✅ Extract query params
    const {
      page,
      limit,
      sortField, // default sort by created date
      sortOrder, // default descending
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const search = req.query.search as string | undefined;


    // ✅ Build search filter
    const where: any = {};

    if (search) {
      const normalizeSourceName = titleCase(search);
      where.OR = [
        { name: { startsWith: normalizeSourceName } },
      ];
    }

    console.log("Tenant Prisma URL:");
const result = await tenantPrisma.$queryRawUnsafe(`
  SELECT current_database();
`);
console.log(result);

    // ✅ Fetch paginated, sorted, and filtered enquiries
    const source = await tenantPrisma.sourceType.findMany({
      where,
      skip,
      take: limitNum,
    });

    // ✅ Total count (for frontend pagination)
    const totalCount = await tenantPrisma.sourceType.count({ where });
    const totalPages = Math.ceil(totalCount / limitNum);

    console.log(
      "Source Fetched Successfully",
      source,
      totalPages,
      totalCount,
      pageNum,
      limitNum
    );

    return res.status(200).json({
      message: "Source fetched successfully",
      source,
      totalPages,
      totalCount,
      page: pageNum,
      limit: limitNum,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched Source:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  addSourceController,
  updateSourceController,
  getSourceController,
};