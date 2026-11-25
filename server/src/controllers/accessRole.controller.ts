import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import {
  DEFAULT_ROLES, DEFAULT_ROLE_MARK, DEFAULT_ROLE_NAMES, MODULES, PermMap, clearPermissionCache, defaultRows, ensureDefaultRoles, loadPermissions, normalizePerm,
} from "../services/permissions.service";

/**
 * Role Management + Role Access (permissions). Super Admin (ADMIN) only - enforced by roleGuard.
 * /my-permissions is open to every signed-in user (the UI uses it to hide what is not allowed;
 * the server still enforces every request).
 */
const NAME_MAX = 60;

function ctx(req: Request) {
  const prisma = req.tenantPrisma;
  const user: any = req.user;
  if (!prisma || !user || typeof user === "string") return null;
  return { prisma, user, clientAdminId: String(user.clientAdminId) };
}

const isDefaultRole = (r: { name: string; description?: string | null }) =>
  r.description === DEFAULT_ROLE_MARK && DEFAULT_ROLE_NAMES.includes(r.name);

const view = (r: any) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  isDefault: isDefaultRole(r),
  userCount: r._count?.users ?? r.users?.length ?? 0,
  permissions: Object.fromEntries(
    MODULES.map((m) => {
      const p = (r.permissions ?? []).find((x: any) => x.module === m.key);
      return [m.key, p ? normalizePerm({ view: p.canView, add: p.canAdd, update: p.canUpdate, delete: p.canDelete }) : { view: false, add: false, update: false, delete: false }];
    })
  ),
});

export async function listAccessRoles(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  await ensureDefaultRoles(c.prisma, c.clientAdminId);
  const roles = await c.prisma.accessRole.findMany({
    where: { clientAdminId: c.clientAdminId },
    include: { permissions: true, _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ modules: MODULES.map((m) => ({ key: m.key, label: m.label })), roles: roles.map(view) });
}

export async function createAccessRole(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  const name = String(req.body?.name ?? "").trim();
  if (!name || name.length > NAME_MAX) return res.status(400).json({ error: `Role name is required (max ${NAME_MAX} characters).` });
  // Built-in names are reserved so nobody confuses them with the fixed roles.
  if (["ADMIN", "FRONT_DESK", "FACULTY", "ACCOUNTANT", "VIEW_ONLY"].includes(name.toUpperCase().replace(/\s+/g, "_"))) {
    return res.status(400).json({ error: "That name is reserved for a built-in role." });
  }
  try {
    const role = await c.prisma.accessRole.create({
      data: { name, description: req.body?.description ? String(req.body.description).slice(0, 200) : null, clientAdminId: c.clientAdminId },
      include: { permissions: true },
    });
    await logActivity({ clientAdminId: c.clientAdminId, entity: "AccessRole", entityId: String(role.id), action: "CREATE", message: `Role created: ${role.name}`, dbUrl: c.user.dbUrl });
    res.status(201).json(view(role));
  } catch (e: any) {
    if (e?.code === "P2002") return res.status(409).json({ error: "A role with this name already exists." });
    console.error(e);
    res.status(500).json({ error: "Could not create the role." });
  }
}

export async function updateAccessRole(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  const id = Number(req.params.id);
  const name = String(req.body?.name ?? "").trim();
  if (!name || name.length > NAME_MAX) return res.status(400).json({ error: `Role name is required (max ${NAME_MAX} characters).` });
  const existing = await c.prisma.accessRole.findFirst({ where: { id, clientAdminId: c.clientAdminId } });
  if (!existing) return res.status(404).json({ error: "Role not found." });
  if (isDefaultRole(existing)) return res.status(400).json({ error: "A default role cannot be renamed. You can change what it is allowed to do." });
  try {
    const role = await c.prisma.accessRole.update({
      where: { id },
      data: { name, description: req.body?.description !== undefined ? String(req.body.description || "").slice(0, 200) || null : undefined },
      include: { permissions: true },
    });
    await logActivity({ clientAdminId: c.clientAdminId, entity: "AccessRole", entityId: String(id), action: "UPDATE", message: `Role updated: ${role.name}`, dbUrl: c.user.dbUrl });
    res.json(view(role));
  } catch (e: any) {
    if (e?.code === "P2002") return res.status(409).json({ error: "A role with this name already exists." });
    res.status(500).json({ error: "Could not update the role." });
  }
}

export async function deleteAccessRole(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  const id = Number(req.params.id);
  const role = await c.prisma.accessRole.findFirst({ where: { id, clientAdminId: c.clientAdminId }, include: { _count: { select: { users: true } } } });
  if (!role) return res.status(404).json({ error: "Role not found." });
  if (isDefaultRole(role)) return res.status(400).json({ error: "A default role cannot be deleted." });
  if (role._count.users > 0) {
    return res.status(409).json({ error: `${role._count.users} user(s) still use this role. Move them to another role first.` });
  }
  await c.prisma.accessRole.delete({ where: { id } });
  clearPermissionCache();
  await logActivity({ clientAdminId: c.clientAdminId, entity: "AccessRole", entityId: String(id), action: "DELETE", message: `Role deleted: ${role.name}`, dbUrl: c.user.dbUrl });
  res.json({ ok: true });
}

/** Replaces the whole permission matrix of a role. Body: { permissions: { module: {view,add,update,delete} } } */
export async function setAccessRolePermissions(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  const id = Number(req.params.id);
  const role = await c.prisma.accessRole.findFirst({ where: { id, clientAdminId: c.clientAdminId } });
  if (!role) return res.status(404).json({ error: "Role not found." });
  const input = req.body?.permissions;
  if (!input || typeof input !== "object") return res.status(400).json({ error: "permissions are required." });

  const rows = MODULES.map((m) => {
    const p = normalizePerm(input[m.key] ?? {});
    return { roleId: id, module: m.key, canView: p.view, canAdd: p.add, canUpdate: p.update, canDelete: p.delete };
  }).filter((r) => r.canView || r.canAdd || r.canUpdate || r.canDelete);

  await c.prisma.$transaction([
    c.prisma.accessRolePermission.deleteMany({ where: { roleId: id } }),
    ...(rows.length ? [c.prisma.accessRolePermission.createMany({ data: rows })] : []),
  ]);
  clearPermissionCache();
  await logActivity({ clientAdminId: c.clientAdminId, entity: "AccessRole", entityId: String(id), action: "UPDATE", message: `Permissions changed for role: ${role.name}`, dbUrl: c.user.dbUrl });
  const fresh = await c.prisma.accessRole.findUnique({ where: { id }, include: { permissions: true } });
  res.json(view(fresh));
}

/** Puts a default role back to the permissions it shipped with. */
export async function resetAccessRole(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  const id = Number(req.params.id);
  const role = await c.prisma.accessRole.findFirst({ where: { id, clientAdminId: c.clientAdminId } });
  if (!role) return res.status(404).json({ error: "Role not found." });
  const def = DEFAULT_ROLES.find((d) => d.name === role.name);
  if (!def || !isDefaultRole(role)) return res.status(400).json({ error: "Only the default roles can be reset." });
  await c.prisma.$transaction([
    c.prisma.accessRolePermission.deleteMany({ where: { roleId: id } }),
    c.prisma.accessRolePermission.createMany({ data: defaultRows(id, def.perms) }),
  ]);
  clearPermissionCache();
  await logActivity({ clientAdminId: c.clientAdminId, entity: "AccessRole", entityId: String(id), action: "UPDATE", message: `Role reset to default: ${role.name}`, dbUrl: c.user.dbUrl });
  const fresh = await c.prisma.accessRole.findUnique({ where: { id }, include: { permissions: true, _count: { select: { users: true } } } });
  res.json(view(fresh));
}

export async function myPermissions(req: Request, res: Response) {
  const c = ctx(req);
  if (!c) return res.status(401).json({ error: "Unauthorized request" });
  const roleId = (c.user as any).customRoleId;
  if (!roleId) return res.json({ custom: false, role: c.user.role, permissions: null });
  const [perms, role] = await Promise.all([
    loadPermissions(c.prisma, Number(roleId)) as Promise<PermMap>,
    c.prisma.accessRole.findUnique({ where: { id: Number(roleId) }, select: { name: true } }),
  ]);
  res.json({ custom: true, role: role?.name ?? "Custom", permissions: perms });
}
