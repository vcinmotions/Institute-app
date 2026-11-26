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
  { key: "enquiry", label: "Enquiry", test: /^\/(enquiry|enquiry-new|edit-enquiry|won-enquiry)(\/|$)/ },
  // Separate from Enquiry so a role can e.g. see enquiries but not add / change follow-ups.
  { key: "followup", label: "Follow-ups", test: /^\/(followup|followup-edit|missed-followups|pending-followups|followup-stats)(\/|$)/ },
  { key: "admission", label: "Admission & Students", test: /^\/(admission|admission-new|edit-student|student|students|add-course|student-course)(\/|$)/ },
  { key: "payment", label: "Payments & Fees", test: /^\/(create-student-payment|advance-payment|payment|create-op)(\/|$)/ },
  { key: "course", label: "Course", test: /^\/(create-course|edit-course|course)(\/|$)/ },
  { key: "faculty", label: "Faculty", test: /^\/(create-faculty|edit-faculty|faculty|assign-batch)(\/|$)|^\/\d+\/batches/ },
  { key: "batch", label: "Batch", test: /^\/(create-batch|batch)(\/|$)/ },
  { key: "class", label: "Class & Time Slots", test: /^\/(create-class|edit-class|all-class)(\/|$)/ },
  { key: "lab", label: "Lab & Time Slots", test: /^\/(create-lab|edit-lab|all-lab|lab)(\/|$)/ },
  { key: "source", label: "Source Config", test: /^\/(create-source|source)(\/|$)/ },
  { key: "stationary", label: "Stationary", test: /^\/(create-stationary|edit-stationary|stationary)(\/|$)/ },
  { key: "attendance", label: "Attendance", test: /^\/(attendance|attendance-report|course-completion)(\/|$)/ },
  { key: "task", label: "Tasks", test: /^\/(create-task|edit-task|task|task-publish|task-completion)(\/|$)/ },
  { key: "test", label: "Tests & Marks", test: /^\/(create-test|edit-test|test|test-marks|test-upload)(\/|$)/ },
  { key: "expense", label: "Expenses", test: /^\/expense(\/|$)/ },
  { key: "reports", label: "Reports & Finance Summary", test: /^\/(reports|profit|financial-summary|outstanding)(\/|$)/ },
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

/**
 * The three roles every company starts with. Their permissions reproduce EXACTLY what the old built-in roles could do
 * (see the rules in middlewares/roleGuard.middleware.ts), so nothing changes for anyone. The Super Admin can then
 * adjust them under Role Access; "Reset to default" restores these.
 */
export const DEFAULT_ROLE_MARK = "Default role";
type P = Partial<{ view: boolean; add: boolean; update: boolean; delete: boolean }>;
const READ_MODULES = ["enquiry", "followup", "admission", "payment", "course", "faculty", "batch", "lab", "class", "source", "stationary", "attendance", "task", "test", "settings"];

function build(view: string[], extra: Record<string, P> = {}): Record<string, P> {
  const out: Record<string, P> = {};
  for (const m of view) out[m] = { view: true };
  for (const [m, p] of Object.entries(extra)) out[m] = { ...(out[m] ?? {}), ...p, view: true };
  return out;
}

export const DEFAULT_ROLES: { name: string; description: string; perms: Record<string, P> }[] = [
  {
    // Reception: handles enquiries, admissions and stationary; can look at everything else teaching/academic.
    name: "Front Desk",
    description: DEFAULT_ROLE_MARK,
    perms: build(READ_MODULES, {
      enquiry: { add: true, update: true },
      followup: { add: true, update: true },
      admission: { add: true, update: true },
      stationary: { add: true, update: true },
    }),
  },
  {
    // Accounts: payments, expenses and the financial reports; read-only everywhere else.
    name: "Accountant",
    description: DEFAULT_ROLE_MARK,
    perms: build([...READ_MODULES, "expense", "reports"], {
      payment: { add: true, update: true },
      expense: { add: true, update: true, delete: true },
    }),
  },
  {
    // Can look, cannot change anything. No expenses, financial reports or user management.
    name: "View Only",
    description: DEFAULT_ROLE_MARK,
    perms: build(READ_MODULES),
  },
];
export const DEFAULT_ROLE_NAMES = DEFAULT_ROLES.map((r) => r.name);

/**
 * Effective permissions of a BUILT-IN role, so the app can hide what the server would refuse
 * (create / edit / delete buttons, "Create ..." menu items, create pages). They match roleGuard's rules:
 * FRONT_DESK / ACCOUNTANT / VIEW_ONLY are the default roles above; FACULTY can mark attendance and run tests and tasks.
 * ADMIN (and unknown roles) -> null = everything allowed.
 */
const BUILTIN_ROLE: Record<string, string> = { FRONT_DESK: "Front Desk", ACCOUNTANT: "Accountant", VIEW_ONLY: "View Only" };
const FACULTY_PERMS = build(["admission", "course", "batch", "attendance", "task", "test"], {
  attendance: { add: true, update: true },
  task: { add: true, update: true },
  test: { add: true, update: true },
});
export function builtinPermissions(role: string): PermMap | null {
  const def = BUILTIN_ROLE[role] ? DEFAULT_ROLES.find((r) => r.name === BUILTIN_ROLE[role])?.perms : role === "FACULTY" ? FACULTY_PERMS : null;
  if (!def) return null;
  const out: PermMap = {};
  for (const m of MODULES) out[m.key] = normalizePerm(def[m.key] ?? {});
  return out;
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
  // Roles saved before "Follow-ups" was its own module keep exactly what "Enquiry & Follow-ups" allowed.
  if (!rows.some((r: any) => r.module === "followup")) perms.followup = { ...perms.enquiry };
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

/** Rows for one default role's permission table. */
export const defaultRows = (roleId: number, perms: Record<string, any>) =>
  MODULES.map((m) => {
    const p = normalizePerm(perms[m.key] ?? {});
    return { roleId, module: m.key, canView: p.view, canAdd: p.add, canUpdate: p.update, canDelete: p.delete };
  }).filter((r) => r.canView || r.canAdd || r.canUpdate || r.canDelete);

/**
 * Every company starts with the three default roles (Front Desk, Accountant, View Only), created the first time roles are
 * listed. Their permissions equal what the old built-in roles could do. Safe to call repeatedly.
 */
export async function ensureDefaultRoles(prisma: any, clientAdminId: string) {
  for (const d of DEFAULT_ROLES) {
    const exists = await prisma.accessRole.findFirst({ where: { clientAdminId, name: d.name } });
    if (exists) continue;
    try {
      const role = await prisma.accessRole.create({ data: { name: d.name, description: d.description, clientAdminId } });
      await prisma.accessRolePermission.createMany({ data: defaultRows(role.id, d.perms) });
    } catch (e: any) {
      if (e?.code !== "P2002") throw e; // another request created it first
    }
  }
}
