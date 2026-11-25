"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, publicApi } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";

/** Master admin: automatic sign-out after inactivity, for every PC of this installation. */
export default function SessionSettingsCard() {
  const qc = useQueryClient();
  const { data } = useQuery<{ idleTimeoutMinutes: number }>({
    queryKey: ["session-settings"],
    queryFn: async () => (await publicApi.get("/session-settings")).data,
  });
  const [minutes, setMinutes] = useState("30");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { if (data) setMinutes(String(data.idleTimeoutMinutes)); }, [data]);

  const save = useMutation({
    mutationFn: async () => (await apiClient.put("/session-settings", { idleTimeoutMinutes: Number(minutes) })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["session-settings"] }); setMsg({ ok: true, text: "Saved. It applies to every PC within a few minutes." }); },
    onError: (e) => setMsg({ ok: false, text: getApiErrorMessage(e) }),
  });

  return (
    <div className="rounded border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800/80 dark:bg-slate-900/10">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Automatic sign-out (idle timeout)</h4>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Users are signed out after this many minutes without activity, after a 60-second warning. It also signs people out when the PC
        was asleep or locked for longer than this. Use 0 to turn it off.
      </p>
      <div className="mt-3 flex max-w-sm items-center gap-2">
        <input type="number" min={0} max={1440} value={minutes} onChange={(e) => setMinutes(e.target.value)}
          className="h-8 w-24 rounded border border-slate-300 px-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        <span className="text-xs text-slate-500">minutes</span>
        <button onClick={() => save.mutate()} disabled={save.isPending}
          className="h-8 rounded bg-slate-900 px-4 text-[11px] font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-950">Save</button>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
    </div>
  );
}
