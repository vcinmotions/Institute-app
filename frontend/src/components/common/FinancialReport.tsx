// "use client";
// import React, { useEffect, useState } from "react";
// import { getFinancial, downloadFinancialExcel, downloadOutstandingExcel, downloadAttendanceExcel } from "@/lib/api";

// const FinancialReport = () => {
//   const [summary, setSummary] = useState<any>(null);
//   const [records, setRecords] = useState<any>(null);
//   const token = sessionStorage.getItem("token"); // adjust as per your auth setup

//   useEffect(() => {
//     if (token) loadSummary();
//   }, [token]);

//   const loadSummary = async () => {
//     const data = await getFinancial(token!);
//     setSummary(data.summary);
//     setRecords(data.records);
//   };

//   const handleDownload = async () => {
//     await downloadFinancialExcel(token!);
//   };

//   const handleDownloadOutstanding = async () => {
//     await downloadOutstandingExcel(token!);
//   };

//   const handleDownloadAttendance = async () => {
//     const batchId = 1; // replace with your state or prop
//     const month = "2025-11";     // example: "2025-11"
//     await downloadAttendanceExcel(token!, batchId, month);
//   };

//   console.log("GET RECORDS DATA: ", records)
//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Financial Summary</h2>

//       {summary && (
//         <div className="mb-6">
//           <p><b>Total Income:</b> ₹{summary.totalIncome}</p>
//           <p><b>Total Expense:</b> ₹{summary.totalExpense}</p>
//           <p><b>Profit:</b> ₹{summary.profit}</p>
//         </div>
//       )}

//       <div className="flex gap-4">
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded-md"
//           onClick={loadSummary}
//         >
//           Refresh Summary
//         </button>
//         <button
//           className="bg-green-600 text-white px-4 py-2 rounded-md"
//           onClick={handleDownload}
//         >
//           Download Excel
//         </button>

//         <button
//           className="bg-green-600 text-white px-4 py-2 rounded-md"
//           onClick={handleDownloadOutstanding}
//         >
//           Download Outstanding
//         </button>

//         <button
//           className="bg-green-600 text-white px-4 py-2 rounded-md"
//           onClick={handleDownloadAttendance}
//         >
//           Download Attendance
//         </button>
//       </div>
//     </div>
//   );
// };

// export default FinancialReport;

"use client";
import React, { useEffect, useState } from "react";
import {
  getFinancial,
  downloadFinancialExcel,
  downloadOutstandingExcel,
  downloadAttendanceExcel,
} from "@/lib/api";

const FinancialReport = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("token")
      : null;

  useEffect(() => {
    if (token) loadSummary();
  }, [token]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await getFinancial(token!);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className=" bg-white dark:bg-white/[0.03] border border-white/[0.03] rounded-2xl px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Financial Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Summary of income, expenses and performance
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <p className="text-sm text-neutral-500">Total Income</p>
              <p className="text-3xl font-semibold text-neutral-900 mt-2">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <p className="text-sm text-neutral-500">Total Expense</p>
              <p className="text-3xl font-semibold text-neutral-900 mt-2">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <p className="text-sm text-neutral-500">Net Profit</p>
              <p className="text-3xl font-semibold text-neutral-900 mt-2">
                {formatCurrency(summary.profit)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadSummary}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={() => downloadFinancialExcel(token!)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              Export Financial
            </button>

            <button
              onClick={() => downloadOutstandingExcel(token!)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              Export Outstanding
            </button>

            <button
              onClick={() =>
                downloadAttendanceExcel(token!, 1, "2025-11")
              }
              className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
            >
              Export Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;

