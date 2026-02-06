import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { titleCase } from "../utils/Normalize";

// =============================
// ✅ Create a new Role-based User (sub-admin)
// =============================
export async function createRoleUserController(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      error: "name, email, password, and role are required",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    //✅ Get current admin (creator)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: user.clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const clientAdminId = user.clientAdminId;

    // ✅ Check for existing user with same email
    const existingUser = await tenantPrisma.roleUser.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create RoleUser
    const newRoleUser = await tenantPrisma.roleUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        country: clientAdmin.country,
        state: clientAdmin.state,
        city: clientAdmin.city,
        zipCode: clientAdmin.zipCode,
        clientAdminId: clientAdminId,
      },
    });

    return res.status(201).json({
      message: "Role-based user created successfully ✅",
      user: {
        id: newRoleUser.id,
        name: newRoleUser.name,
        email: newRoleUser.email,
        role: newRoleUser.role,
      },
    });
  } catch (err: any) {
    console.error("Error creating role user:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already in use ❌" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// =============================
// ✅ Update a new Role-based User (sub-admin)
// =============================
export async function updateRoleUserController(req: Request, res: Response) {
  const { name, email, role } = req.body;
  const { id } = req.params;

  if (!name || !email || !role) {
    return res.status(400).json({
      error: "name, email, password, and role are required",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    //✅ Get current admin (creator)
    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: user.clientAdminId },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const clientAdminId = user.clientAdminId;

    // ✅ Check for existing user with same email

    // ✅ Create RoleUser
    const newRoleUser = await tenantPrisma.roleUser.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        role,
      },
    });

    return res.status(201).json({
      message: "Role-based user created successfully ✅",
      user: {
        id: newRoleUser.id,
        name: newRoleUser.name,
        email: newRoleUser.email,
        role: newRoleUser.role,
      },
    });
  } catch (err: any) {
    console.error("Error creating role user:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already in use ❌" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// =============================
// ✅ Get all Role-based Users
// =============================
export async function getRoleUsersController(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;

    // 📄 Pagination & Search
    // 2.1 ✅ Extract query params
    const {
      page,
      limit,
    } = req.query;

    console.log("GET ROLE SEARCH:", page, limit);

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 5) || 5;
    const skip = (pageNum - 1) * limitNum;
    const search = req.query.search as string | undefined;


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

    // ✅ Build search filter
        const where: any = {
          clientAdminId: user.clientAdminId, // only fetch faculties for this admin
        };
    
        if (search) {
          const normalizeRoleName = titleCase(search);
          where.OR = [
            { name: { startsWith: normalizeRoleName } },
            { email: { contains: search } },
          ];
        }
    

    const roles = await tenantPrisma.roleUser.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    console.log("GET ALL ROLE DATA:", roles);

    const totalCount = await tenantPrisma.roleUser.count({ where });
    const totalPages = Math.ceil(totalCount / limitNum);

    console.log("GET ROLE PAGINATION DATA;", totalPages);

    return res.status(200).json({
      message: "Role users fetched successfully ✅",
      roles,
      totalPages,
      page: pageNum,
      limit: limitNum,
      totalCount,
    });
  } catch (err) {
    console.error("Error fetching role users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
