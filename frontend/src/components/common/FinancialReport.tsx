"use client";
import React, { useEffect, useState } from "react";
import { getFinancial, downloadFinancialExcel, downloadOutstandingExcel, downloadAttendanceExcel } from "@/lib/api";

const FinancialReport = () => {
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any>(null);
  const token = sessionStorage.getItem("token"); // adjust as per your auth setup

  useEffect(() => {
    if (token) loadSummary();
  }, [token]);

  const loadSummary = async () => {
    const data = await getFinancial(token!);
    setSummary(data.summary);
    setRecords(data.records);
  };

  const handleDownload = async () => {
    await downloadFinancialExcel(token!);
  };

  const handleDownloadOutstanding = async () => {
    await downloadOutstandingExcel(token!);
  };

  const handleDownloadAttendance = async () => {
    const batchId = 1; // replace with your state or prop
    const month = "2025-11";     // example: "2025-11"
    await downloadAttendanceExcel(token!, batchId, month);
  };

  console.log("GET RECORDS DATA: ", records)
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Financial Summary</h2>

      {summary && (
        <div className="mb-6">
          <p><b>Total Income:</b> ₹{summary.totalIncome}</p>
          <p><b>Total Expense:</b> ₹{summary.totalExpense}</p>
          <p><b>Profit:</b> ₹{summary.profit}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={loadSummary}
        >
          Refresh Summary
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleDownload}
        >
          Download Excel
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleDownloadOutstanding}
        >
          Download Outstanding
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleDownloadAttendance}
        >
          Download Attendance
        </button>
      </div>
    </div>
  );
};

export default FinancialReport;
