"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { apiClient } from "@/lib/apiClient";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Column = { key: string; label: string; kind: "number" | "money" | "percent" };
type Options = {
  companies: { id: string; name: string; role: string }[];
  financialYears: string[];
  reports: { key: string; label: string; allowedRoles: string[] }[];
};
type Result = {
  label: string;
  columns: Column[];
  primary: string;
  companies: {
    id: string;
    name: string;
    values: Record<string, number>;
    period: { from: string | null; to: string | null; financialYear: string | null };
  }[];
  chart: { labels: string[]; values: number[] };
  series: { labels: string[]; datasets: { name: string; data: number[] }[] } | null;
};

const fmt = (v: number | undefined, kind: Column["kind"]) => {
  const n = v ?? 0;
  if (kind === "money") return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  if (kind === "percent") return `${n}%`;
  return n.toLocaleString("en-IN");
};

const dateInput =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

/** Compare the same report across two or more companies of the institute. */
export default function CompanyCompare() {
  const [opts, setOpts] = useState<Options | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [report, setReport] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fy, setFy] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/reports/compare/options")
      .then((r) => {
        setOpts(r.data);
        setReport(r.data.reports[0]?.key ?? "");
      })
      .catch(() => setError("Could not load the comparison options."));
  }, []);

  // Reports a user may run depend on their role in the companies they ticked.
  const reportOptions = useMemo(() => {
    if (!opts) return [];
    const chosen = opts.companies.filter((c) => picked.includes(c.id));
    return opts.reports
      .filter((r) => chosen.every((c) => r.allowedRoles.includes(c.role)))
      .map((r) => ({ value: r.key, label: r.label }));
  }, [opts, picked]);

  useEffect(() => {
    if (reportOptions.length && !reportOptions.some((r) => r.value === report)) {
      setReport(reportOptions[0].value);
    }
  }, [reportOptions, report]);

  const run = async () => {
    setError("");
    setResult(null);
    if (picked.length < 2) return setError("Select two or more companies to compare.");
    if (from && to && from > to) return setError("Start date must be before the end date.");
    setLoading(true);
    try {
      const r = await apiClient.get("/reports/compare", {
        params: {
          companyIds: picked.join(","),
          reportType: report,
          ...(from ? { startDate: from } : {}),
          ...(to ? { endDate: to } : {}),
          ...(fy && !from && !to ? { financialYear: fy } : {}),
        },
      });
      setResult(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Could not run the comparison.");
    } finally {
      setLoading(false);
    }
  };

  const primaryCol = result?.columns.find((c) => c.key === result.primary);
  const chartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#465fff", "#12b76a", "#f79009", "#f04438", "#7a5af8", "#0ba5ec"],
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 4, distributed: !result?.series } },
    dataLabels: { enabled: true, formatter: (v: number) => fmt(v, primaryCol?.kind ?? "number") },
    xaxis: { categories: result?.series ? result.series.labels : result?.chart.labels },
    yaxis: { labels: { formatter: (v: number) => fmt(v, primaryCol?.kind ?? "number") } },
    legend: { show: !!result?.series },
    grid: { yaxis: { lines: { show: true } } },
  };

  if (error && !opts) return <p className="text-sm text-red-500">{error}</p>;
  if (!opts) return <p className="text-sm text-gray-500">Loading...</p>;
  if (opts.companies.length < 2) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        Comparison needs access to at least two companies with an Admin or Accountant role. Ask the institute admin to
        assign you more companies.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Label>Companies to compare *</Label>
        <div className="mb-5 flex flex-wrap gap-3">
          {opts.companies.map((c) => {
            const on = picked.includes(c.id);
            return (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  on
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10"
                    : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setPicked(on ? picked.filter((p) => p !== c.id) : [...picked, c.id])}
                />
                {c.name}
              </label>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <Label>Report</Label>
            <Select searchable options={reportOptions} value={report} onChange={setReport} placeholder="Select report" />
          </div>
          <div>
            <Label>From date</Label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={dateInput} />
          </div>
          <div>
            <Label>To date</Label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={dateInput} />
          </div>
          <div>
            <Label>Academic year</Label>
            <Select
              options={[{ value: "", label: "All" }, ...opts.financialYears.map((y) => ({ value: y, label: y }))]}
              value={fy}
              onChange={setFy}
              showArrow
            />
            {(from || to) && fy && <p className="mt-1 text-xs text-gray-500">Dates override the academic year.</p>}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        <button
          onClick={run}
          disabled={loading || picked.length < 2 || !report}
          className="mt-5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {result && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  {result.columns.map((c) => (
                    <th key={c.key} className="px-5 py-3 text-right font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.companies.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-5 py-3 font-medium">
                      {c.name}
                      {c.period.financialYear && (
                        <span className="ml-2 text-xs text-gray-400">FY {c.period.financialYear}</span>
                      )}
                    </td>
                    {result.columns.map((col) => (
                      <td key={col.key} className="px-5 py-3 text-right">
                        {fmt(c.values[col.key], col.kind)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
              {result.label}
              {result.series ? " by month" : `: ${primaryCol?.label ?? ""}`}
            </h3>
            <ReactApexChart
              type="bar"
              height={320}
              options={chartOptions}
              series={
                result.series
                  ? result.series.datasets
                  : [{ name: primaryCol?.label ?? result.label, data: result.chart.values }]
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
