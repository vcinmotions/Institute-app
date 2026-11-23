import { Request, Response } from "express";
import { companiesForUser, ensureMasterCompany } from "../utils/institute";
import { REPORTS, CompareReportType, companyMetrics, parseRange } from "../services/companyCompare.service";

const MONEY_ROLES = ["ADMIN", "ACCOUNTANT"];
const ALL_REPORT_ROLES = ["ADMIN"];

/** Roles allowed to see this report for a company. */
const rolesFor = (report: CompareReportType) => (REPORTS[report].moneyOnly ? MONEY_ROLES : ALL_REPORT_ROLES);

async function accessibleCompanies(req: Request) {
  const db = req.tenantPrisma!;
  const u = req.user as any;
  await ensureMasterCompany(db);
  return companiesForUser(db, {
    userType: u.userType,
    id: u.id,
    role: u.role,
    clientAdminId: u.userType === "ADMIN" ? u.id : u.clientAdminId,
  });
}

/** What the compare screen can offer this user: companies, reports and financial years. */
export async function compareOptionsController(req: Request, res: Response) {
  if (!req.tenantPrisma || !req.user || typeof req.user === "string") {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  const companies = (await accessibleCompanies(req)).filter((c) => MONEY_ROLES.includes(c.role));
  const fys = await req.tenantPrisma.financialYear.findMany({
    where: { clientAdminId: { in: companies.map((c) => c.id) } },
    select: { name: true, startDate: true },
    orderBy: { startDate: "desc" },
  });
  const financialYears = [...new Set(fys.map((f) => f.name))];
  res.json({
    companies,
    financialYears,
    reports: (Object.keys(REPORTS) as CompareReportType[]).map((k) => ({
      key: k,
      label: REPORTS[k].label,
      allowedRoles: rolesFor(k),
    })),
  });
}

export async function compareReportsController(req: Request, res: Response) {
  const db = req.tenantPrisma;
  if (!db || !req.user || typeof req.user === "string") return res.status(401).json({ error: "Unauthorized request" });

  const report = String(req.query.reportType ?? "") as CompareReportType;
  if (!REPORTS[report]) return res.status(400).json({ error: "Choose a valid report." });

  const ids = [...new Set(String(req.query.companyIds ?? "").split(",").map((s) => s.trim()).filter(Boolean))];
  if (ids.length < 2) return res.status(400).json({ error: "Select two or more companies to compare." });

  // Each company must be one the user may work in, with a role that allows this report.
  const mine = await accessibleCompanies(req);
  const chosen = [];
  for (const id of ids) {
    const c = mine.find((m) => m.id === id);
    if (!c) return res.status(403).json({ error: "You do not have access to one of the selected companies." });
    if (!rolesFor(report).includes(c.role)) {
      return res.status(403).json({ error: `Your role in ${c.name} does not allow the ${REPORTS[report].label} report.` });
    }
    chosen.push(c);
  }

  let explicit: { start?: Date; end?: Date };
  try {
    explicit = parseRange(req.query.startDate as string, req.query.endDate as string);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
  if (explicit.start && explicit.end && explicit.start > explicit.end) {
    return res.status(400).json({ error: "Start date must be before the end date." });
  }
  const fyName = String(req.query.financialYear ?? "").trim();

  const results = [];
  for (const c of chosen) {
    let { start, end } = explicit;
    let fyApplied: string | null = null;
    // A financial year applies when no explicit dates are given (each company has its own FY rows).
    if (fyName && !start && !end) {
      const fy = await db.financialYear.findFirst({ where: { clientAdminId: c.id, name: fyName } });
      if (fy) {
        start = fy.startDate;
        end = new Date(fy.endDate);
        end.setUTCHours(23, 59, 59, 999);
        fyApplied = fy.name;
      }
    }
    const m = await companyMetrics(db, c.id, report, start, end);
    results.push({
      id: c.id,
      name: c.name,
      values: m.values,
      monthly: m.monthly,
      period: { from: start ?? null, to: end ?? null, financialYear: fyApplied },
    });
  }

  const def = REPORTS[report];
  const months = [...new Set(results.flatMap((r) => Object.keys(r.monthly ?? {})))].sort();
  res.json({
    reportType: report,
    label: def.label,
    columns: def.columns,
    primary: def.primary,
    companies: results,
    chart: {
      labels: results.map((r) => r.name),
      values: results.map((r) => r.values[def.primary] ?? 0),
    },
    series: months.length
      ? { labels: months, datasets: results.map((r) => ({ name: r.name, data: months.map((m) => r.monthly?.[m] ?? 0) })) }
      : null,
  });
}
