import { Request, Response } from "express";

const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export const getBranches = async (req: Request, res: Response) => {
  const db = req.tenantPrisma;
  const user = req.user;
  if (!db || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized request" });
  const branches = await db.branch.findMany({
    where: { clientAdminId: user.clientAdminId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  res.json({ branches });
};

export const createBranch = async (req: Request, res: Response) => {
  const db = req.tenantPrisma;
  const user = req.user;
  if (!db || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized request" });
  const name = clean(req.body.name);
  if (!name) return res.status(400).json({ error: "Branch name is required" });

  const existing = await db.branch.findMany({ where: { clientAdminId: user.clientAdminId } });
  if (existing.some((b: any) => b.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ error: "A branch with this name already exists" });
  }
  const branch = await db.branch.create({
    data: {
      name,
      city: clean(req.body.city),
      address: clean(req.body.address),
      contact: clean(req.body.contact),
      isDefault: existing.length === 0, // first branch becomes the default
      clientAdminId: user.clientAdminId,
    },
  });
  res.status(201).json({ branch });
};

export const updateBranch = async (req: Request, res: Response) => {
  const db = req.tenantPrisma;
  const user = req.user;
  if (!db || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized request" });
  const id = Number(req.params.id);
  const branch = await db.branch.findFirst({ where: { id, clientAdminId: user.clientAdminId } });
  if (!branch) return res.status(404).json({ error: "Branch not found" });

  const data: any = {};
  if (req.body.name !== undefined) {
    const name = clean(req.body.name);
    if (!name) return res.status(400).json({ error: "Branch name cannot be empty" });
    data.name = name;
  }
  for (const k of ["city", "address", "contact"]) if (req.body[k] !== undefined) data[k] = clean(req.body[k]);
  if (typeof req.body.isActive === "boolean") {
    if (!req.body.isActive && branch.isDefault) {
      return res.status(400).json({ error: "The default branch cannot be deactivated" });
    }
    data.isActive = req.body.isActive;
  }
  if (req.body.isDefault === true) {
    await db.branch.updateMany({ where: { clientAdminId: user.clientAdminId }, data: { isDefault: false } });
    data.isDefault = true;
    data.isActive = true;
  }
  const updated = await db.branch.update({ where: { id }, data });
  res.json({ branch: updated });
};
