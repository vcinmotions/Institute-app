"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import { apiClient } from "@/lib/apiClient";

type Row = {
  id: number;
  totalMarks: number | null;
  marksObtained: number | null;
  grade: string | null;
  student: { fullName: string; studentCode: string };
};

function gradeFor(percent: number) {
  if (percent >= 90) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B+";
  if (percent >= 60) return "B";
  if (percent >= 50) return "C";
  if (percent >= 40) return "D";
  return "F";
}

function MarksInner() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [test, setTest] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [values, setValues] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get(`/test/${id}/students`)
      .then(({ data }) => {
        setTest(data.test);
        setRows(data.students);
        const v: Record<number, string> = {};
        data.students.forEach((r: Row) => {
          v[r.id] = r.marksObtained === null || r.marksObtained === undefined ? "" : String(r.marksObtained);
        });
        setValues(v);
      })
      .catch(() => setMsg({ ok: false, text: "Could not load this test" }));
  }, [id]);

  const preview = (r: Row) => {
    const raw = values[r.id];
    if (raw === "" || raw === undefined || !r.totalMarks) return r.grade ?? "-";
    const n = Number(raw);
    return Number.isFinite(n) ? gradeFor((n / r.totalMarks) * 100) : "-";
  };

  const save = async () => {
    setMsg(null);
    for (const r of rows) {
      const raw = values[r.id];
      if (raw === "" || raw === undefined) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) return setMsg({ ok: false, text: `Enter valid marks for ${r.student.fullName}` });
      if (r.totalMarks && n > r.totalMarks)
        return setMsg({ ok: false, text: `${r.student.fullName}: marks cannot be more than ${r.totalMarks}` });
    }
    setBusy(true);
    try {
      const marks = rows.map((r) => ({ studentTestId: r.id, marksObtained: values[r.id] }));
      const { data } = await apiClient.put("/test-marks", { testId: Number(id), marks });
      setMsg({ ok: true, text: `Marks saved for ${data.saved} student(s)` });
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.error || "Could not save marks" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoleProtected allowedRoles={["ADMIN", "FACULTY"]}>
      <PageBreadcrumb pageTitle="Enter Test Marks" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
        {test && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold capitalize">{test.name}</span> · {test.course?.name} · {test.batch?.name}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800">
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Marks obtained</th>
                <th className="px-3 py-2">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                    No students are assigned to this test.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="text-gray-800 dark:text-gray-200">
                    <td className="px-3 py-2">
                      {r.student.fullName} <span className="text-xs text-gray-400">{r.student.studentCode}</span>
                    </td>
                    <td className="px-3 py-2">{r.totalMarks ?? "-"}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        max={r.totalMarks ?? undefined}
                        value={values[r.id] ?? ""}
                        onChange={(e) => setValues({ ...values, [r.id]: e.target.value })}
                        className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold">{preview(r)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={save}
            disabled={busy || rows.length === 0}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-brand-600"
          >
            {busy ? "Saving..." : "Save marks"}
          </button>
          <button onClick={() => router.push("/dashboard/test")} className="text-sm text-gray-500 underline">
            Back to tests
          </button>
          {msg && <span className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</span>}
        </div>
      </div>
    </RoleProtected>
  );
}

export default function MarksPage() {
  return (
    <Suspense fallback={null}>
      <MarksInner />
    </Suspense>
  );
}
