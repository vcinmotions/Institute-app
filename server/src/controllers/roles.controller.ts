import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { titleCase } from "../utils/Normalize";
import { checkLoginEmailDomain } from "../utils/tenantDbUrl";
import { companiesForUser, ensureMasterCompany } from "../utils/institute";

const ALLOWED_ROLES = ["ADMIN", "FRONT_DESK", "ACCOUNTANT", "VIEW_ONLY", "FACULTY"];


/** Validates an optional custom (Super-Admin defined) role. Returns {id|null|undefined, error}. undefined = leave unchanged. */
async function parseCustomRole(db: any, user: any, raw: any): Promise<{ id?: number | null; error?: string }> {
  if (raw === undefined) return { id: undefined };
  if (raw === null || raw === "") return { id: null };
  const id = Number(raw);
  if (!Number.isInteger(id)) return { error: "Invalid custom role." };
  const found = await db.accessRole.findFirst({ where: { id, clientAdminId: String(user.clientAdminId) } });
  if (!found) return { error: "Custom role not found." };
  return { id };
}

// =============================
// ✅ Create a new Role-based User (sub-admin)
// =============================
type Assignment = { companyId: string; role: string };

/** Companies the signed-in admin may hand out (an institute admin: all; others: their own). */
async function assignableCompanyIds(db: any, user: any): Promise<Set<string>> {
  await ensureMasterCompany(db);
  const list = await companiesForUser(db, {
    userType: user.userType,
    id: user.id,
    role: user.role,
    clientAdminId: user.userType === "ADMIN" ? user.id : user.clientAdminId,
  });
  return new Set(list.map((c) => c.id));
}

/** Validates the "companies" payload: [{ companyId, role }] */
async function parseAssignments(db: any, user: any, raw: any): Promise<{ list?: Assignment[]; error?: string }> {
  if (raw === undefined) return {};
  if (!Array.isArray(raw) || raw.length === 0) return { error: "Assign at least one company." };
  const allowed = await assignableCompanyIds(db, user);
  const seen = new Set<string>();
  const list: Assignment[] = [];
  for (const a of raw) {
    const companyId = String(a?.companyId ?? "");
    const role = String(a?.role ?? "");
    if (!allowed.has(companyId)) return { error: "You cannot assign one of those companies." };
    if (!ALLOWED_ROLES.includes(role)) return { error: `role must be one of ${ALLOWED_ROLES.join(", ")}` };
    if (seen.has(companyId)) return { error: "A company is listed twice." };
    seen.add(companyId);
    list.push({ companyId, role });
  }
  return { list };
}

export async function createRoleUserController(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const hasCustom = req.body.customRoleId !== undefined && req.body.customRoleId !== null && req.body.customRoleId !== "";
  // A custom role user is stored with the lowest built-in role (VIEW_ONLY) as a safe base.
  const role = hasCustom ? "VIEW_ONLY" : req.body.role;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      error: "name, email, password, and role are required",
    });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of ${ALLOWED_ROLES.join(", ")}` });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const domainError = await checkLoginEmailDomain(user, email);
    if (domainError) return res.status(400).json({ error: domainError });

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

    const custom = await parseCustomRole(tenantPrisma, user, req.body.customRoleId);
    if (custom.error) return res.status(400).json({ error: custom.error });
    const parsed = await parseAssignments(tenantPrisma, user, req.body.companies);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    if (custom.id && parsed.list) parsed.list.forEach((a) => { a.role = "VIEW_ONLY"; });
    // No list given: the user belongs to the company the admin is working in.
    const assignments: Assignment[] = parsed.list ?? [{ companyId: clientAdminId, role }];
    const homeAssignment = assignments.find((a) => a.companyId === clientAdminId) ?? assignments[0];

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create RoleUser
    const newRoleUser = await tenantPrisma.roleUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: homeAssignment.role as any,
        customRoleId: custom.id ?? null,
        country: clientAdmin.country,
        state: clientAdmin.state,
        city: clientAdmin.city,
        zipCode: clientAdmin.zipCode,
        clientAdminId: homeAssignment.companyId,
        companyAccess: {
          create: assignments.map((a) => ({ clientAdminId: a.companyId, role: a.role as any })),
        },
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
  const { name, email, password } = req.body;
  const customInput = req.body.customRoleId;
  const role = customInput !== undefined && customInput !== null && customInput !== "" ? "VIEW_ONLY" : req.body.role;
  const id = String(req.params.id);

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

    // Optional password reset: only the main admin account may do this.
    let hashedPassword: string | undefined;
    if (password !== undefined && password !== null && password !== "") {
      if ((user as any).userType !== "ADMIN") {
        return res.status(403).json({ error: "Only the admin can reset a user's password." });
      }
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // ✅ Update RoleUser
    const custom = await parseCustomRole(tenantPrisma, user, req.body.customRoleId);
    if (custom.error) return res.status(400).json({ error: custom.error });
    const parsed = await parseAssignments(tenantPrisma, user, req.body.companies);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    if (custom.id && parsed.list) parsed.list.forEach((a) => { a.role = "VIEW_ONLY"; });
    const assignments = parsed.list;
    const current = await tenantPrisma.roleUser.findUnique({ where: { id }, select: { clientAdminId: true } });
    if (!current) return res.status(404).json({ error: "User not found" });
    // The "home" company must stay one of the assigned companies.
    const home = assignments
      ? (assignments.find((a) => a.companyId === current.clientAdminId) ?? assignments[0])
      : null;

    const newRoleUser = await tenantPrisma.$transaction(async (tx) => {
      if (assignments) {
        await tx.userCompanyAccess.deleteMany({ where: { roleUserId: id } });
        await tx.userCompanyAccess.createMany({
          data: assignments.map((a) => ({ roleUserId: id, clientAdminId: a.companyId, role: a.role as any })),
        });
      }
      return tx.roleUser.update({
        where: { id },
        data: {
          name,
          email,
          role: (home ? home.role : role) as any,
          ...(custom.id !== undefined ? { customRoleId: custom.id } : {}),
          ...(home ? { clientAdminId: home.companyId } : {}),
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
      });
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
          // users of this company: homed here, or assigned here
          OR: [
            { clientAdminId: user.clientAdminId },
            { companyAccess: { some: { clientAdminId: user.clientAdminId } } },
          ],
        };
    
        if (search) {
          const normalizeRoleName = titleCase(search);
          where.AND = [
            {
              OR: [
                { name: { startsWith: normalizeRoleName } },
                { email: { contains: search } },
              ],
            },
          ];
        }
    

    const roles = await tenantPrisma.roleUser.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: { select: { name: true } },
        createdAt: true,
        companyAccess: { select: { clientAdminId: true, role: true } },
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

/** Companies the signed-in user can work in (company switcher, user-assignment form). */
export async function getMyCompaniesController(req: Request, res: Response) {
  const db = req.tenantPrisma;
  const user = req.user as any;
  if (!db || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized request" });
  await ensureMasterCompany(db);
  const companies = await companiesForUser(db, {
    userType: user.userType,
    id: user.id,
    role: user.role,
    clientAdminId: user.userType === "ADMIN" ? user.id : user.clientAdminId,
  });
  res.json({ currentCompanyId: user.clientAdminId, companies });
}
