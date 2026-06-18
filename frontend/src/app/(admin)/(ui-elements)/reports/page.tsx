"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useFetchReports } from "@/hooks/queries/useQueryFetchReports";

type ReportType = "ENQUIRIES" | "FINANCE" | "STUDENTS";
type FinanceStatus = "ALL" | "PAID" | "OUTSTANDING";

export default function ReportsDashboard() {
    const [reportType, setReportType] = useState<ReportType>("ENQUIRIES");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Deep Filtering State Management
    const [sourceId, setSourceId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [financeStatus, setFinanceStatus] = useState<FinanceStatus>("ALL");

    // Pagination State Management
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Mock constants - wire these up with your application's actual drop-down data lists
    const coursesList = [{ id: 1, name: "Full Stack Web Dev" }, { id: 2, name: "Data Science" }];
    const batchesList = [{ id: 4, name: "Morning Batch A" }, { id: 5, name: "Evening Batch B" }];
    const sourcesList = [{ id: 1, name: "Google" }, { id: 2, name: "Instagram" }];

    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

    const { data, isLoading, isError, error } = useFetchReports({
        token,
        reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sourceId: sourceId || undefined,
        courseId: courseId || undefined,
        batchId: batchId || undefined,
        financeStatus: reportType === "FINANCE" ? financeStatus : undefined,
    });

    const reportRows = data?.data || [];
    const totalRecords = reportRows.length;

    // Reset page index tracking when filters morph
    React.useEffect(() => {
        setCurrentPage(1);
    }, [reportType, startDate, endDate, sourceId, courseId, batchId, financeStatus]);

    // Client-side pagination segmenting logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentPaginatedRows = reportRows.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const handleDownload = async (format: "excel" | "pdf") => {
        try {
            const params = new URLSearchParams({ reportType });
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if (sourceId) params.append("sourceId", sourceId);
            if (courseId) params.append("courseId", courseId);
            if (batchId) params.append("batchId", batchId);
            if (reportType === "FINANCE") params.append("financeStatus", financeStatus);

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

            const response = await fetch(`${baseUrl}/reports/${format}?${params.toString()}`, {
                method: "GET",
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) throw new Error(`Failed to download ${format}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${reportType}-Report.${format === "excel" ? "xlsx" : "pdf"}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert(`Failed to download ${format} file.`);
        }
    };

    const headers = reportRows.length > 0 ? Object.keys(reportRows[0]) : [];

    const inputStyles = "w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors duration-200";
    const labelStyles = "text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider";

    return (
        <div className="space-y-6 text-slate-900 dark:text-slate-100">
            <ComponentCard title="Generate Reports">

                {/* FILTERS SECTION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-6 p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
                    <div className="flex flex-col">
                        <label className={labelStyles}>Report Type</label>
                        <select
                            className={inputStyles}
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value as ReportType);
                                setSourceId(""); setCourseId(""); setBatchId(""); setFinanceStatus("ALL");
                            }}
                        >
                            <option value="ENQUIRIES" className="bg-white dark:bg-slate-800">Enquiries</option>
                            <option value="FINANCE" className="bg-white dark:bg-slate-800">Finance</option>
                            <option value="STUDENTS" className="bg-white dark:bg-slate-800">Students</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className={labelStyles}>Start Date</label>
                        <input type="date" className={inputStyles} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>

                    <div className="flex flex-col">
                        <label className={labelStyles}>End Date</label>
                        <input type="date" className={inputStyles} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>

                    {/* DYNAMIC FILTERS BASED ON REPORT TYPE */}
                    {reportType === "ENQUIRIES" && (
                        <>
                            <div className="flex flex-col">
                                <label className={labelStyles}>Lead Source</label>
                                <select className={inputStyles} value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                                    <option value="" className="bg-white dark:bg-slate-800">All Sources</option>
                                    {sourcesList.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800">{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className={labelStyles}>Course</label>
                                <select className={inputStyles} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                                    <option value="" className="bg-white dark:bg-slate-800">All Courses</option>
                                    {coursesList.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {reportType === "STUDENTS" && (
                        <>
                            <div className="flex flex-col">
                                <label className={labelStyles}>Course</label>
                                <select className={inputStyles} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                                    <option value="" className="bg-white dark:bg-slate-800">All Courses</option>
                                    {coursesList.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className={labelStyles}>Batch</label>
                                <select className={inputStyles} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                                    <option value="" className="bg-white dark:bg-slate-800">All Batches</option>
                                    {batchesList.map(b => <option key={b.id} value={b.id} className="bg-white dark:bg-slate-800">{b.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {reportType === "FINANCE" && (
                        <div className="flex flex-col">
                            <label className={labelStyles}>Payment Status Filter</label>
                            <select className={inputStyles} value={financeStatus} onChange={(e) => setFinanceStatus(e.target.value as FinanceStatus)}>
                                <option value="ALL" className="bg-white dark:bg-slate-800">All Payments</option>
                                <option value="PAID" className="bg-white dark:bg-slate-800">Paid Payments</option>
                                <option value="OUTSTANDING" className="bg-white dark:bg-slate-800">Outstanding Payments</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* RESULTS SUMMARY METRIC & ACTION DOWNLOAD ROW */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 p-1">
                    <div>
                        {!isLoading && !isError && (
                            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-3.5 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100 dark:border-indigo-900/40">
                                <span>Filtered Result Counter:</span>
                                <span className="bg-indigo-600 text-white dark:bg-indigo-500 rounded-md px-2 py-0.5 text-xs font-bold">
                                    {totalRecords} {totalRecords === 1 ? "Record" : "Records"}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 ml-auto sm:ml-0">
                        <button
                            onClick={() => handleDownload("excel")}
                            disabled={totalRecords === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white shadow-sm dark:shadow-emerald-900/20 px-4 py-2 rounded-lg transition duration-200 font-medium text-sm flex items-center gap-1.5"
                        >
                            Download Excel
                        </button>
                        <button
                            onClick={() => handleDownload("pdf")}
                            disabled={totalRecords === 0}
                            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:pointer-events-none text-white shadow-sm dark:shadow-rose-900/20 px-4 py-2 rounded-lg transition duration-200 font-medium text-sm flex items-center gap-1.5"
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* ERROR STATE */}
                {isError && (
                    <div className="text-rose-600 dark:text-rose-400 mb-5 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-lg border border-rose-200 dark:border-rose-900/50 text-sm font-medium">
                        {error?.message || "An error occurred while fetching reports."}
                    </div>
                )}

                {/* DATA TABLE SECTION */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
                    {isLoading ? (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-12 font-medium tracking-wide">
                            <div className="animate-pulse inline-block">Loading report data...</div>
                        </div>
                    ) : totalRecords === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-12 text-sm font-medium">
                            No data available for the selected filters.
                        </p>
                    ) : (
                        <>
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400 border-collapse">
                                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        {headers.map((header) => (
                                            <th key={header} className="px-6 py-3.5 font-semibold whitespace-nowrap">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                    {currentPaginatedRows.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                            {headers.map((header) => (
                                                <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium text-sm">
                                                    {row[header] !== null && row[header] !== undefined ? String(row[header]) : "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* EXPLICIT TABLE PAGINATION ACTIONS BAR */}
                            <div className="sticky left-0 px-6 py-4 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">
                                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Rows Per Page:</span>
                                    <select
                                        className="border border-slate-300 dark:border-slate-700 rounded-md p-1 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-xs">
                                        Showing <b>{indexOfFirstRow + 1}</b> to <b>{Math.min(indexOfLastRow, totalRecords)}</b> of <b>{totalRecords}</b> entries
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150"
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150"
                                    >
                                        Previous
                                    </button>

                                    <div className="px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded border border-indigo-100 dark:border-indigo-900/30">
                                        Page {currentPage} of {totalPages || 1}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150"
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </ComponentCard>
        </div>
    );
}