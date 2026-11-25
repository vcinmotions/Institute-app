"use client";

import { useDialog } from "@/components/common/AppDialog";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import { apiClient } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";
import { AccessRole, Perm, useAccessRoles } from "@/hooks/useAccessRoles";

const ACTIONS: { key: keyof Perm; label: string; hint: string }[] = [
  { key: "view", label: "View", hint: "See records only" },
  { key: "add", label: "Add", hint: "Create new records" },
  { key: "update", label: "Update", hint: "Edit existing records" },
  { key: "delete", label: "Delete", hint: "Delete records" },
];

type Matrix = Record<string, Perm>;
const blank = (): Perm => ({ view: false, add: false, update: false, delete: false });

/** Role Management (create / rename / delete roles) + Role Access (module-wise permissions). Super Admin only. */
export default function AccessRolesPage() {
  const dialog = useDialog();
  const { data, isLoading } = useAccessRoles();
  const modules = data?.modules ?? [];
  const roles = data?.roles ?? [];

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matrix, setMatrix] = useState<Matrix>({});
  const [dirty, setDirty] = useState(false);
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const selected: AccessRole | undefined = useMemo(() => roles.find((r) => r.id === selectedId), [roles, selectedId]);

  // Load the matrix when a role is picked (or its saved data changes while nothing is being edited).
  useEffect(() => {
    if (!selected || dirty) return;
    setMatrix(Object.fromEntries(modules.map((m) => [m.key, { ...blank(), ...(selected.permissions[m.key] ?? {}) }])));
  }, [selected, modules, dirty]);

  useEffect(() => {
    if (selectedId === null && roles.length) setSelectedId(roles[0].id);
    if (selectedId !== null && !roles.some((r) => r.id === selectedId)) setSelectedId(roles[0]?.id ?? null);
  }, [roles, selectedId]);

  const flash = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const create = useMutation({
    mutationFn: async (name: string) => (await apiClient.post("/access-roles", { name })).data,
    onSuccess: (r: any) => { setNewName(""); setDirty(false); setSelectedId(r.id); flash(true, "Role created. Now tick its permissions."); },
    onError: (e) => flash(false, getApiErrorMessage(e)),
  });
  const rename = useMutation({
    mutationFn: async (p: { id: number; name: string }) => (await apiClient.put(`/access-roles/${p.id}`, { name: p.name })).data,
    onSuccess: () => flash(true, "Role renamed."),
    onError: (e) => flash(false, getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => (await apiClient.delete(`/access-roles/${id}`)).data,
    onSuccess: () => { setDirty(false); flash(true, "Role deleted."); },
    onError: (e) => flash(false, getApiErrorMessage(e)),
  });
  const reset = useMutation({
    mutationFn: async (id: number) => (await apiClient.post(`/access-roles/${id}/reset`)).data,
    onSuccess: () => { setDirty(false); flash(true, "Permissions are back to the default."); },
    onError: (e) => flash(false, getApiErrorMessage(e)),
  });
  const save = useMutation({
    mutationFn: async () => (await apiClient.put(`/access-roles/${selectedId}/permissions`, { permissions: matrix })).data,
    onSuccess: () => { setDirty(false); flash(true, "Permissions saved. They apply to users of this role immediately."); },
    onError: (e) => flash(false, getApiErrorMessage(e)),
  });

  const toggle = (module: string, action: keyof Perm) => {
    setDirty(true);
    setMatrix((m) => {
      const cur = { ...(m[module] ?? blank()) };
      cur[action] = !cur[action];
      if (action === "view" && !cur.view) { cur.add = cur.update = cur.delete = false; } // no writing without viewing
      if (action !== "view" && cur[action]) cur.view = true;
      return { ...m, [module]: cur };
    });
  };
  const setAll = (module: string, on: boolean) => {
    setDirty(true);
    setMatrix((m) => ({ ...m, [module]: { view: on, add: on, update: on, delete: on } }));
  };

  return (
    <RoleProtected allowedRoles={["ADMIN"]}>
      <PageBreadcrumb pageTitle="Role Access" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ---------- Role Management ---------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Roles</h2>
          <div className="mb-3 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newName.trim() && create.mutate(newName.trim())}
              placeholder="New role name"
              className="h-9 min-w-0 flex-1 rounded border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={() => create.mutate(newName.trim())}
              disabled={!newName.trim() || create.isPending}
              className="rounded bg-brand-500 px-3 text-sm text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {!isLoading && roles.length === 0 && (
            <p className="text-sm text-gray-500">No roles yet.</p>
          )}
          <ul className="space-y-1">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  onClick={async () => { if (dirty && !(await dialog.confirm({ title: "Discard changes?", message: "You have unsaved permission changes for this role.", confirmText: "Discard", danger: true }))) return; setDirty(false); setSelectedId(r.id); }}
                  className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm ${r.id === selectedId ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"} dark:text-white`}
                >
                  <span>{r.name}{r.isDefault && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800">Default</span>}</span>
                  <span className="text-xs text-gray-400">{r.userCount} user{r.userCount === 1 ? "" : "s"}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Role Access ---------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          {!selected ? (
            <p className="text-sm text-gray-500">Create or select a role to set what it can do in each module.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold dark:text-white">{selected.name}</h2>
                <div className="flex gap-3 text-sm">
                  {selected.isDefault ? (
                    <button className="underline" disabled={reset.isPending}
                      onClick={async () => { if (await dialog.confirm({ title: `Reset "${selected.name}"?`, message: "It goes back to the permissions it shipped with. Your changes to this role will be lost.", confirmText: "Reset to default", danger: true })) reset.mutate(selected.id); }}>
                      Reset to default
                    </button>
                  ) : (
                    <>
                      <button className="underline" onClick={async () => { const n = await dialog.prompt({ title: "Rename role", label: "Role name", defaultValue: selected.name, maxLength: 60, confirmText: "Rename" }); if (n && n !== selected.name) rename.mutate({ id: selected.id, name: n }); }}>Rename</button>
                      <button className="text-red-600 underline" onClick={async () => { if (await dialog.confirm({ title: `Delete role "${selected.name}"?`, message: "Users must be moved to another role first. This cannot be undone.", confirmText: "Delete", danger: true })) remove.mutate(selected.id); }}>Delete</button>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-500 dark:border-gray-800">
                      <th className="py-2 pr-4">Module</th>
                      {ACTIONS.map((a) => (
                        <th key={a.key} className="px-3 py-2 text-center" title={a.hint}>{a.label}</th>
                      ))}
                      <th className="px-3 py-2 text-center">All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((m) => {
                      const p = matrix[m.key] ?? blank();
                      const all = p.view && p.add && p.update && p.delete;
                      return (
                        <tr key={m.key} className="border-b last:border-0 dark:border-gray-800 dark:text-white">
                          <td className="py-2 pr-4">{m.label}</td>
                          {ACTIONS.map((a) => (
                            <td key={a.key} className="px-3 py-2 text-center">
                              <input type="checkbox" checked={!!p[a.key]} onChange={() => toggle(m.key, a.key)} aria-label={`${m.label} ${a.label}`} className="h-4 w-4 cursor-pointer" />
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={all} onChange={() => setAll(m.key, !all)} aria-label={`${m.label} all`} className="h-4 w-4 cursor-pointer" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">Add, Update and Delete automatically include View. Assign this role to a user under App Users &gt; Create User.</p>
                <button
                  onClick={() => save.mutate()}
                  disabled={!dirty || save.isPending}
                  className="rounded bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {save.isPending ? "Saving..." : "Save permissions"}
                </button>
              </div>
            </>
          )}
          {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
        </section>
      </div>
    </RoleProtected>
  );
}
