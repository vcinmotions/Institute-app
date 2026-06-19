"use client";
import { useDashboardOpsMetrics } from "@/hooks/queries/useDashboardOpsMetrics";
import React from "react";
import Link from "next/link";

export const DashboardOpsMetrics = () => {
    const { metrics, lists, isLoading } = useDashboardOpsMetrics();

    console.log("METRICS:", lists)

    const formatNum = (num: number) => new Intl.NumberFormat("en-IN").format(num);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse h-48 rounded border border-slate-200 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/40" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 mb-6">

            {/* BLOCK 1: TODAY'S NEW LEADS */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        </span>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Today's New Enquiries</h3>
                    </div>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 tabular-nums">
                        {formatNum(metrics.todayLeads)}
                    </span>
                </div>
                <div className="p-2 flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="pb-1.5 pl-1">Name</th>
                                <th className="pb-1.5">Contact</th>
                                <th className="pb-1.5 text-right pr-1">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {lists.todayLeads.length > 0 ? (
                                lists.todayLeads.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                        <td className="py-1.5 pl-1 font-semibold text-slate-700 dark:text-slate-300 capitalize truncate max-w-[120px]">{item.name}</td>
                                        <td className="py-1.5 font-mono">{item.contact?.slice(-10) || "—"}</td>
                                        <td className="py-1.5 text-right pr-1">
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.leadStatus}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-6 text-center text-slate-400 font-normal">No enquiries logged today</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BLOCK 2: PENDING FOLLOW-UPS */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </span>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pending Follow-Ups</h3>
                    </div>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 tabular-nums">
                        {formatNum(metrics.pendingFollowUps)}
                    </span>
                </div>
                <div className="p-2 flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="pb-1.5 pl-1">Target Enquiry</th>
                                <th className="pb-1.5">Scheduled Action</th>
                                <th className="pb-1.5 text-right pr-1">Remark / Log</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {lists.pendingFollowUps.length > 0 ? (
                                lists.pendingFollowUps.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                        <td className="py-1.5 pl-1 font-semibold text-slate-700 dark:text-slate-300 capitalize truncate max-w-[110px]">{item.enquiry?.name || "Action Required"}</td>
                                        <td className="py-1.5 font-mono text-amber-600 dark:text-amber-400">
                                            {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Overdue"}
                                        </td>
                                        <td className="py-1.5 text-right pr-1 truncate max-w-[130px] italic text-slate-400">{item.remark || "No description logged"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-6 text-center text-slate-400 font-normal">All actions cleared successfully</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BLOCK 3: PENDING ADMISSIONS */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </span>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pending Enrollment</h3>
                    </div>
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 tabular-nums">
                        {formatNum(metrics.pendingAdmissions)}
                    </span>
                </div>
                <div className="p-2 flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="pb-1.5 pl-1">Prospect Student</th>
                                <th className="pb-1.5">Intended Courses</th>
                                <th className="pb-1.5 text-right pr-1">Action Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {lists.pendingAdmissions.length > 0 ? (
                                lists.pendingAdmissions.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                        <td className="py-1.5 pl-1 font-semibold text-slate-700 dark:text-slate-300 capitalize truncate max-w-[120px]">{item.name}</td>
                                        <td className="py-1.5 truncate max-w-[140px]">
                                            {item.enquiryCourse?.map((c: any) => c.course?.name).join(", ") || "Unassigned"}
                                        </td>
                                        <td className="py-1.5 text-right pr-1">
                                            <Link href={`/dashboard/admission/edit?id=${item.id}`} className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
                                                Process →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-6 text-center text-slate-400 font-normal">No closed deals awaiting enrollment</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BLOCK 4: PENDING PAYMENTS */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </span>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Outstanding Processing</h3>
                    </div>
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 tabular-nums">
                        {formatNum(metrics.pendingPayments)}
                    </span>
                </div>
                <div className="p-2 flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="pb-1.5 pl-1">Student context</th>
                                <th className="pb-1.5">Mode</th>
                                <th className="pb-1.5 text-right pr-1">Pending Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {lists.pendingPayments.length > 0 ? (
                                lists.pendingPayments.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                        <td className="py-1.5 pl-1 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                            {item.studentCourse?.studentDetails?.name || item.studentId || "System Account"}
                                        </td>
                                        <td className="py-1.5 font-mono text-[10px]">{item.paymentMode || "CASH"}</td>
                                        <td className="py-1.5 text-right pr-1 font-bold text-rose-600 dark:text-rose-400 font-mono">
                                            {formatNum(item.amount || item.totalAmount || 0)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-6 text-center text-slate-400 font-normal">All collections fully matched</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};