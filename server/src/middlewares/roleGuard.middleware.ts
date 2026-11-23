import { Request, Response, NextFunction } from "express";

/**
 * Role based access control for tenant (institute) routes.
 * Runs after authMiddleware, so req.user is a verified JWT payload.
 *
 * Roles in tokens: ADMIN, FRONT_DESK, ACCOUNTANT, VIEW_ONLY, FACULTY.
 * ADMIN can do everything. Rules below only RESTRICT other roles.
 */

type Rule = { methods?: string[]; test: RegExp; roles: string[] };

const ADMIN = ["ADMIN"];

const RULES: Rule[] = [
  // --- administration: ADMIN only ---
  { test: /^\/(role-user|edit-role-user)/, roles: ADMIN },
  { test: /^\/user\/?$/, methods: ["PUT"], roles: ADMIN },
  { test: /^\/all-client/, roles: ADMIN },
  { test: /^\/log/, roles: ADMIN },
  { test: /^\/(admission-config|payment-receipt-config)\/?$/, methods: ["POST", "PUT"], roles: ADMIN },
  { test: /^\/(create-lab|edit-lab)/, roles: ADMIN },
  { test: /^\/(create-course|edit-course)/, roles: ADMIN },
  { test: /^\/(create-faculty|edit-faculty|assign-batch)/, roles: ADMIN },
  { test: /^\/create-batch/, roles: ADMIN },
  { test: /^\/(create-source)/, roles: ADMIN },
  { test: /^\/(create-stationary|edit-stationary)/, roles: ["ADMIN", "FRONT_DESK"] },
  { test: /^\/enquiry\/[^/]+\/?$/, methods: ["DELETE"], roles: ADMIN },

  // --- money: ADMIN + ACCOUNTANT ---
  { test: /^\/(create-student-payment|advance-payment|create-op)/, roles: ["ADMIN", "ACCOUNTANT"] },
  { test: /^\/(profit|financial-summary|outstanding)/, roles: ["ADMIN", "ACCOUNTANT"] },
  { test: /^\/expense/, roles: ["ADMIN", "ACCOUNTANT"] },
  // Reports (also the cross-company comparison, which checks the role per company as well).
  { test: /^\/reports/, roles: ["ADMIN", "ACCOUNTANT"] },

  // --- front office: ADMIN + FRONT_DESK ---
  { test: /^\/(admission-new|edit-student|add-course|student-course)/, methods: ["POST", "PUT"], roles: ["ADMIN", "FRONT_DESK"] },
  { test: /^\/(enquiry|enquiry-new|edit-enquiry|followup|followup-edit|followup\/complete)/, methods: ["POST", "PUT", "DELETE"], roles: ["ADMIN", "FRONT_DESK"] },

  // --- teaching: ADMIN + FACULTY ---
  { test: /^\/(attendance\/mark|create-task|edit-task|task-publish|create-test|edit-test|test-marks)/, roles: ["ADMIN", "FACULTY"] },
  { test: /^\/course-completion/, roles: ["ADMIN", "FACULTY"] },
];

export function roleGuard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || typeof user === "string") {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  const role = String((user as any).role || "");

  // Master tokens never belong on institute routes.
  if (role === "MASTER_ADMIN") {
    return res.status(403).json({ error: "Master admin cannot use institute routes" });
  }

  // Read-only users may never change data.
  if (role === "VIEW_ONLY" && req.method !== "GET") {
    return res.status(403).json({ error: "Your role is read-only" });
  }

  // Normalise: strip query string and /api prefix, collapse slashes, ignore case.
  let path = req.originalUrl.split("?")[0];
  try { path = decodeURIComponent(path); } catch { /* keep raw */ }
  path = path.replace(/^\/api(?=\/|$)/i, "").replace(/\/{2,}/g, "/");
  for (const rule of RULES) {
    if (rule.methods && !rule.methods.includes(req.method)) continue;
    if (!new RegExp(rule.test.source, "i").test(path)) continue;
    if (!rule.roles.includes(role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
  }

  next();
}
