"use client";

import { useDialog } from "@/components/common/AppDialog";
import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import { apiClient } from "@/lib/apiClient";

type Expense = {
  id: string;
  amount: number;
  description: string | null;
  paymentMode: string | null;
  date: string;
};

const MODES = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
];

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ amount: "", description: "", paymentMode: "CASH", date: today() });

const field =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function ExpensePage() {
  const dialog = useDialog();
  const [rows, setRows] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/expense", {
        params: { page, limit: 10, from: from || undefined, to: to || undefined },
      });
      setRows(data.data);
      setTotal(data.total);
      setTotalAmount(data.totalAmount);
      setTotalPages(Math.max(1, data.totalPages));
    } catch {
      setMsg({ ok: false, text: "Could not load expenses" });
    }
  }, [page, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!form.description.trim()) return setMsg({ ok: false, text: "Description is required" });
    if (!(Number(form.amount) > 0)) return setMsg({ ok: false, text: "Amount must be greater than 0" });
    setBusy(true);
    try {
      const body = { ...form, amount: Number(form.amount) };
      if (editingId) await apiClient.put(`/expense/${editingId}`, body);
      else await apiClient.post("/expense", body);
      setMsg({ ok: true, text: editingId ? "Expense updated" : "Expense saved" });
      setForm(emptyForm());
      setEditingId(null);
      setPage(1);
      await load();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.error || "Could not save expense" });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (x: Expense) => {
    setEditingId(x.id);
    setForm({
      amount: String(x.amount),
      description: x.description ?? "",
      paymentMode: x.paymentMode ?? "CASH",
      date: x.date.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (x: Expense) => {
    if (!(await dialog.confirm({ title: "Delete this expense?", message: `Amount: ₹${x.amount}. This cannot be undone.`, confirmText: "Delete", danger: true }))) return;
    try {
      await apiClient.delete(`/expense/${x.id}`);
      setMsg({ ok: true, text: "Expense deleted" });
      await load();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.error || "Could not delete expense" });
    }
  };

  return (
    <RoleProtected allowedRoles={["ADMIN", "ACCOUNTANT"]}>
      <PageBreadcrumb pageTitle="Institute Expenses" />

      <div className="space-y-5">
        <form
          onSubmit={save}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {editingId ? "Edit expense" : "Add expense"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-gray-700 dark:text-gray-300 lg:col-span-2">
              Description *
              <input autoFocus
                className={field}
                placeholder="e.g. Electricity bill, Rent, Stationery"
                value={form.description}
                maxLength={300}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Amount (₹) *
              <input
                className={field}
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Date
              <input
                className={field}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Payment mode
              <select
                className={field}
                value={form.paymentMode}
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              disabled={busy}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-brand-600"
            >
              {busy ? "Saving..." : editingId ? "Update expense" : "Save expense"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm());
                }}
                className="text-sm text-gray-500 underline"
              >
                Cancel edit
              </button>
            )}
            {msg && (
              <span className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</span>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                From
                <input
                  type="date"
                  className={field}
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label className="text-xs text-gray-600 dark:text-gray-400">
                To
                <input
                  type="date"
                  className={field}
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              {(from || to) && (
                <button
                  onClick={() => {
                    setFrom("");
                    setTo("");
                    setPage(1);
                  }}
                  className="pb-2 text-xs text-gray-500 underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-right text-sm text-gray-700 dark:text-gray-300">
              {total} expense(s) · Total{" "}
              <span className="font-semibold">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-800">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                      No expenses recorded.
                    </td>
                  </tr>
                ) : (
                  rows.map((x) => (
                    <tr key={x.id} className="text-gray-800 dark:text-gray-200">
                      <td className="px-3 py-2">{new Date(x.date).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-2">{x.description}</td>
                      <td className="px-3 py-2">{x.paymentMode?.replace("_", " ")}</td>
                      <td className="px-3 py-2 text-right">₹{x.amount.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => startEdit(x)} className="mr-3 text-brand-600 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => remove(x)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-3 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </RoleProtected>
  );
}
