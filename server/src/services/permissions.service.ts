/**
 * Centralised module permissions (View / Add / Update / Delete).
 *
 * One table maps API paths to a module and the HTTP method to an action, so the SAME rule drives
 * backend enforcement (roleGuard) and the module list shown in the Role Access screen.
 * Built-in roles are untouched; only users with an AccessRole (customRoleId) use this engine.
 */
export type Action = "view" | "add" | "update" | "delete";

export type ModuleDef = { key: string; label: string; test: RegExp };

export const MODULES: ModuleDef[] = [
  { key: "enquiry", label: "Enquiry & Follow-ups", test: /^\/(enquiry|enquiry-new|edit-enquiry|followup|followup-edit|won-enquiry|missed-followups|pending-followups|followup-stats)(\/|$)/ },
  { key: "admission", label: "Admission & Students", test: /^\/(admission|admission-new|edit-student|student|students|add-course|student-course|course-completion|create-op)(\/|$)/ },
  { key: "payment", label: "Payments & Fees", test: /^\/(create-student-payment|advance-payment|payment|outstanding)(\/|$)/ },
  { key: "course", label: "Course", test: /^\/(create-course|edit-course|course)(\/|$)/ },
  { key: "faculty", label: "Faculty", test: /^\/(create-faculty|edit-faculty|faculty|assign-batch)(\/|$)|^\/\d+\/batches/ },
  { key: "batch", label: "Batch", test: /^\/(create-batch|batch)(\/|$)/ },
  { key: "class", label: "Class & Time Slots", test: /^\/(create-class|edit-class|all-class)(\/|$)/ },
  { key: "lab", label: "Lab & Time Slots", test: /^\/(create-lab|edit-lab|all-lab|lab)(\/|$)/ },
  { key: "source", label: "Source Config", test: /^\/(create-source|source)(\/|$)/ },
  { key: "stationary", label: "Stationary", test: /^\/(create-stationary|edit-stationary|stationary)(\/|$)/ },
  { key: "attendance", label: "Attendance", test: /^\/(attendance|attendance-report)(\/|$)/ },
  { key: "task", label: "Tasks", test: /^\/(create-task|edit-task|task|task-publish|task-completion)(\/|$)/ },
  { key: "test", label: "Tests & Marks", test: /^\/(create-test|edit-test|test|test-marks|test-upload)(\/|$)/ },
  { key: "expense", label: "Expenses", test: /^\/expense(\/|$)/ },
  { key: "reports", label: "Reports & Finance Summary", test: /^\/(reports|profit|financial-summary)(\/|$)/ },
  { key: "users", label: "Users", test: /^\/(role-user|edit-role-user|all-client)(\/|$)/ },
  { key: "settings", label: "Settings (config, branches, backup)", test: /^\/(admission-config|payment-receipt-config|branches|user|backup|restore)(\/|$)/ },
];

/** POST endpoints that change an existing record rather than create one. */
const POST_IS_UPDATE = /^\/(enquiry\/(hold|lost)|followup\/complete|attendance\/mark|task-publish|create-test\/publish|course-completion|test-marks)(\/|$)/;

const ACTION_BY_METHOD: Record<string, Action> = {
  GET: "view", HEAD: "view", OPTIONS: "view", POST: "add", PUT: "update", PATCH: "update", DELETE: "delete",
};

/** Normalises a request path the same way for every check. */
export function normalizePath(originalUrl: string) {
  let p = originalUrl.split("?")[0];
  try { p = decodeURIComponent(p); } catch { /* keep raw */ }
  return p.replace(/^\/api(?=\/|$)/i, "").replace(/\/{2,}/g, "/").toLowerCase();
}

export function resolve(method: string, path: string): { module: string; action: Action } | null {
  const mod = MODULES.find((m) => m.test.test(path));
  if (!mod) return null;
  let action = ACTION_BY_METHOD[method.toUpperCase()] ?? "update";
  if (method.toUpperCase() === "POST" && POST_IS_UPDATE.test(path)) action = "update";
  return { module: mod.key, action };
}

export type PermMap = Record<string, { view: boolean; add: boolean; update: boolean; delete: boolean }>;

/** Add/Update/Delete imply View, so a role can never write to what it cannot see. */
export function normalizePerm(p: { view?: boolean; add?: boolean; update?: boolean; delete?: boolean }) {
  const add = !!p.add, update = !!p.update, del = !!p.delete;
  return { view: !!p.view || add || update || del, add, update, delete: del };
}

const cache = new Map<string, { at: number; perms: PermMap }>();
const TTL_MS = 5000;

export function clearPermissionCache() {
  cache.clear();
}

export async function loadPermissions(prisma: any, roleId: number): Promise<PermMap> {
  const key = `${roleId}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.perms;
  const rows = await prisma.accessRolePermission.findMany({ where: { roleId } });
  const perms: PermMap = {};
  for (const m of MODULES) perms[m.key] = { view: false, add: false, update: false, delete: false };
  for (const r of rows) {
    if (perms[r.module]) perms[r.module] = normalizePerm({ view: r.canView, add: r.canAdd, update: r.canUpdate, delete: r.canDelete });
  }
  cache.set(key, { at: Date.now(), perms });
  return perms;
}

/** Never available to custom roles (super admin only). */
const ADMIN_ONLY = /^\/(log|access-roles|tenants)(\/|$)/;
/** Non-GET endpoints every signed-in user needs regardless of module. */
const ALWAYS_OK = /^\/(notification|heartbeat|logout|my-permissions|my-companies|switch-company|select-company|subscription|device-activation|followup-stats)(\/|$)/;

export function allowed(perms: PermMap, method: string, path: string): boolean {
  if (ADMIN_ONLY.test(path)) return false;
  const r = resolve(method, path);
  if (!r) {
    // Not a module endpoint (dashboard, analytics, own profile...): reading is fine, changing needs the safe list.
    return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase()) || ALWAYS_OK.test(path);
  }
  return !!perms[r.module]?.[r.action];
}
