import { Request, Response, NextFunction } from "express";
import { auditContext } from "../utils/auditContext";
import { MODULES, normalizePath } from "../services/permissions.service";

/**
 * Audit trail for every successful data change (POST / PUT / PATCH / DELETE), without touching each controller:
 * who (user, role), when, which module, what action and which record. Controllers that already write their own
 * detailed log row are not duplicated (see utils/activityLogger). Failed requests are not logged as changes.
 * Runs right after authMiddleware.
 */
const SKIP = /^\/(heartbeat|logout|notification|switch-company|select-company|subscription|device-activation|my-permissions)(\/|$)/;
const ID_KEYS = ["id", "student", "enquiry", "course", "batch", "lab", "faculty", "payment", "expense", "task", "test", "source", "stationary", "user", "role", "branch"];

function recordId(req: Request, body: any): string {
  const p = (req.params ?? {}) as Record<string, string>;
  if (p.id) return String(p.id);
  const first = Object.values(p)[0];
  if (first) return String(first);
  const b = body && typeof body === "object" ? body : {};
  for (const k of ID_KEYS) {
    const v = b[k];
    if (v && typeof v === "object" && v.id !== undefined) return String(v.id);
    if (k === "id" && v !== undefined && typeof v !== "object") return String(v);
  }
  return "-";
}

export function auditTrail(req: Request, res: Response, next: NextFunction) {
  const u: any = req.user;
  const store = {
    actorId: u?.id !== undefined ? String(u.id) : undefined,
    actorName: u?.name || u?.email,
    actorRole: u?.customRoleId ? `custom:${u.customRoleId}` : u?.role,
    ip: req.ip,
    audited: false,
  };
  const isWrite = !["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (!isWrite) return auditContext.run(store, next);

  let captured: any;
  const origJson = res.json.bind(res);
  res.json = (body?: any) => { captured = body; return origJson(body); };

  res.on("finish", () => {
    try {
      if (store.audited || res.statusCode >= 400 || !req.tenantPrisma || !u?.clientAdminId) return;
      const path = normalizePath(req.originalUrl);
      if (SKIP.test(path)) return;
      const mod = MODULES.find((m) => m.test.test(path));
      const action = req.method === "DELETE" ? "DELETE" : req.method === "POST" ? "CREATE" : "UPDATE";
      req.tenantPrisma.activityLog
        .create({
          data: {
            clientAdminId: String(u.clientAdminId),
            entity: mod?.label ?? path.split("/")[1] ?? "System",
            entityId: recordId(req, captured),
            action,
            message: `${req.method} ${path}`,
            module: mod?.key ?? null,
            actorId: store.actorId ?? null,
            actorName: store.actorName ?? null,
            actorRole: store.actorRole ?? null,
            ip: store.ip ?? null,
          },
        })
        .catch((e: any) => console.error("audit log failed:", e?.message));
    } catch (e) {
      console.error("audit error:", e);
    }
  });

  auditContext.run(store, next);
}
