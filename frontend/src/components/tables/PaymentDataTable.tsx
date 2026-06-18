import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { useDispatch } from "react-redux";
import Button from "../ui/button/Button";
import CreateStudentPaymentModal from "../form/form-elements/CreateStudentPaymentModal";
import { downloadReceipt } from "@/app/utils/ReceiptDownload";
import { singleDownloadReceipt } from "@/app/utils/SingleReceiptDownload";
import { PAYMENTSTATUS_COLOR_MAP } from "../common/BadgeStatus";
import Avatar from "../common/Avatar";

type StudentCourseDataTableProps = {
  payment: any[];
  loading: boolean;
  onSort: (field: string) => void;
  onPaymentType: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function PaymentDataTable({
  payment,
  loading,
  onSort,
  onPaymentType,
  sortField,
  sortOrder,
}: StudentCourseDataTableProps) {
  const [showPaymentDetailsForm, setShowPaymentDetailsForm] = useState(false);
  const dispatch = useDispatch();
  const [selectedPaymentData, setSelectedPaymentData] = useState<any>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleExpanded = (paymentItem: any) => {
    setExpandedRowId((prev) => (prev === paymentItem.id ? null : paymentItem.id));
  };

  const handleCloseAdmissionModal = () => {
    setShowPaymentDetailsForm(false);
    setSelectedPaymentData(null);
  };

  const handleEditClick = async (paymentItem: any) => {
    setShowPaymentDetailsForm(true);
    setSelectedPaymentData(paymentItem);

    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[1102px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">
            {/* ERP Style Table Header */}
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Student Name
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Payment Status
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => onPaymentType && onPaymentType("paymentType")}
                  >
                    Payment Type
                  </button>
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Amount
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Amount Due
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Amount Paid
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  Logs
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  Action
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  Receipt
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {payment && payment.length > 0 ? (
                payment.map((item: any) => (
                  <React.Fragment key={item?.id}>
                    <TableRow className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <TableCell className="px-3 py-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 overflow-hidden rounded-full shrink-0">
                            {item?.student?.photoUrl ? (
                              <img
                                src={
                                  item.student.photoUrl.startsWith("http")
                                    ? item.student.photoUrl
                                    : `http://localhost:5001${item.student.photoUrl}`
                                }
                                alt="student"
                                className="h-7 w-7 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/user/user-21.jpg";
                                }}
                              />
                            ) : (
                              <Avatar name={item?.student?.fullName} size={28} />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize truncate max-w-[180px]">
                              {item?.student?.fullName || "N/A"}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide font-mono">
                              {item.receiptNo ? item?.receiptNo : "—"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-1.5">
                        <Badge
                          size="sm"
                          color={PAYMENTSTATUS_COLOR_MAP[item.paymentStatus] ?? "error"}
                        >
                          {item?.paymentStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {item?.feeStructure?.paymentType ?? "—"}
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                        {item?.feeStructure?.totalAmount ?? (item.amountDue + item.amountPaid)}
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-xs font-mono text-rose-600 dark:text-rose-400">
                        {item.amountDue}
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        {item?.amountPaid}
                      </TableCell>

                      {/* Micro Actions Aligned to Grid */}
                      <TableCell className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item)}
                          className="h-6 rounded-[4px] border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {expandedRowId === item.id ? "Hide" : "Show"}
                        </button>
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          disabled={item.paymentStatus === "SUCCESS"}
                          className={`h-6 rounded-[4px] border px-2 text-[11px] font-medium shadow-sm transition ${item.paymentStatus === "SUCCESS"
                              ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-900 dark:bg-slate-900/50"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                        >
                          Update
                        </button>
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          disabled={!item?.feeLogs || item.feeLogs.length === 0}
                          onClick={() => downloadReceipt(item)}
                          className={`p-1 transition rounded inline-flex items-center justify-center ${!item?.feeLogs || item.feeLogs.length === 0
                              ? "opacity-30 cursor-not-allowed text-slate-400"
                              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* Sub-item Log Expanded View matching ERP style */}
                    {expandedRowId === item.id && (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="bg-slate-50/50 p-3 text-xs text-slate-700 dark:bg-slate-900/30 dark:text-slate-300"
                        >
                          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-inner">
                            {item?.feeLogs?.length > 0 ? (
                              <table className="w-full border-collapse text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 font-medium">
                                  <tr>
                                    <th className="px-3 py-1.5 w-12 text-center">#</th>
                                    <th className="px-3 py-1.5">Receipt No</th>
                                    <th className="px-3 py-1.5">Amount Paid</th>
                                    <th className="px-3 py-1.5">Payment Mode</th>
                                    <th className="px-3 py-1.5">Payment Date</th>
                                    <th className="px-3 py-1.5 text-center w-28">Download</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-400">
                                  {item.feeLogs.map((log: any, index: number) => (
                                    <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                                      <td className="px-3 py-1.5 text-center font-mono text-slate-400">{index + 1}</td>
                                      <td className="px-3 py-1.5 font-mono">{log.receiptNo || "N/A"}</td>
                                      <td className="px-3 py-1.5 font-mono text-emerald-600 dark:text-emerald-400">{log.amountPaid}</td>
                                      <td className="px-3 py-1.5 capitalize">{log.paymentMode}</td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {log.paymentDate
                                          ? new Date(log.paymentDate).toISOString().split("T")[0]
                                          : "—"}
                                      </td>
                                      <td className="px-3 py-1.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => singleDownloadReceipt(item, log)}
                                          className="h-5 px-2 rounded bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-[10px] text-white transition-colors"
                                        >
                                          Receipt
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="p-3 text-center text-slate-400 dark:text-slate-500 italic">
                                No fee logs found for this student.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Payment found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Element */}
      {showPaymentDetailsForm && selectedPaymentData && (
        <CreateStudentPaymentModal
          onCloseModal={handleCloseAdmissionModal}
          payment={selectedPaymentData!}
          title={"Receive Payment"}
          currentPage={0}
          searchQuery={""}
        />
      )}
    </div>
  );
}