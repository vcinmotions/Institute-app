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
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import { Student } from "@/types/student";
import CreateStudentPaymentModal from "../form/form-elements/CreateStudentPaymentModal";
import { downloadReceipt } from "@/app/utils/ReceiptDownload";
import { singleDownloadReceipt } from "@/app/utils/SingleReceiptDownload";
import { PAYMENTSTATUS_COLOR_MAP, STATUS_COLOR_MAP } from "../common/BadgeStatus";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

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
  const [selectedPaymentData, setSelectedPaymentData] = useState<any>(null); // You can strongly type this

  //const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // const toggleExpanded = (payment: any) => {
  //   console.log("GET PAYMENT DETAILS IN EXPANDABLE COMPONENT;", payment);
  //   setExpandedRows((prev) =>
  //     prev.includes(payment.id) ? prev.filter((rowId) => rowId !== payment.id) : [...prev, payment.id]
  //   );
  // };

  const toggleExpanded = (payment: any) => {
    console.log("GET PAYMENT DETAILS IN EXPANDABLE COMPONENT;", payment);
    setExpandedRowId((prev) => (prev === payment.id ? null : payment.id));
  };


  console.log("get All Query To search:", payment);

  const handleCloseAdmissionModal = () => {
    setShowPaymentDetailsForm(false);
    setSelectedPaymentData(null);
  };


  const handleEditClick = async (payment: any) => {
    setShowPaymentDetailsForm(true);
    console.log("PAYMENT DETAILS WHEN OPENING PAYMENT FORM:", payment);
    setSelectedPaymentData(payment);

    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-125 min-w-275.5">
          <Table>
            {/* Table Header */}
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Student Name
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Course
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Payment Status
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onPaymentType("paymentType")}
                  >
                    Payment Type
                    <span>
                      {sortField === "paymentType" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Total Amount
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Amount Due
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Amount Paid
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button type="button" className="flex items-center gap-1">
                    Details
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button type="button" className="flex items-center gap-1">
                    Update Payment
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button type="button" className="flex items-center gap-1">
                    Download Receipt
                  </button>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {payment && payment.length > 0 ? (
                payment.map((item: any) => (
                  <React.Fragment key={item?.id}>
                    <TableRow key={item?.id}>
                      <TableCell className="px-5 py-4 text-start sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full">
                             <img
                          src={
                            item?.student?.photoUrl?.startsWith("http")
                              ? item?.student?.photoUrl
                              : `http://localhost:5001${item?.student?.photoUrl || ""}`
                          }
                          alt="student"
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "/images/user/user-21.jpg")
                          }
                        />
                          </div>
                          <div>
                            <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                              {item?.student?.fullName || "N/A"}
                            </span>
                            <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                              {item.receiptNo ? item?.receiptNo : "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                        {item?.course?.name || "N/A"}
                      </TableCell>

                      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={PAYMENTSTATUS_COLOR_MAP[item.paymentStatus] ?? "error"}
                        >
                          {item?.paymentStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                        {item?.feeStructure?.paymentType}
                      </TableCell>

                      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                        {item?.feeStructure?.totalAmount}
                      </TableCell>

                      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                        {item.amountDue}
                      </TableCell>

                      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                        {item?.amountPaid}
                      </TableCell>

                      <TableCell>
                        <Button
                          onClick={() => toggleExpanded(item)}
                          size="sm"
                          className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                        >
                          {expandedRowId === item.id ? "Hide" : "Show"}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Button
                          onClick={() => handleEditClick(item)}
                          size="sm"
                          disabled={item.paymentStatus === "SUCCESS"}
                          className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                        >
                          Update
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Button
                          onClick={() => downloadReceipt(item)}
                          size="sm"
                          disabled={item?.feeLogs.length === 0}
                          className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded row */}
                    {expandedRowId === item.id && (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="bg-gray-50 px-6 py-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          {/* You can customize this area with more details */}
                          <div>
                            {item?.feeLogs?.length > 0 ? (
                              <table className="w-full border border-gray-200 text-left text-sm dark:border-white/10">
                                <thead className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white">
                                  <tr>
                                    <th className="border border-gray-200 px-4 py-2 dark:border-white/10">
                                      #
                                    </th>
                                    <th className="border border-gray-200 px-4 py-2 dark:border-white/10">
                                      Receipt No
                                    </th>
                                    <th className="border border-gray-200 px-4 py-2 dark:border-white/10">
                                      Amount Paid
                                    </th>
                                    <th className="border border-gray-200 px-4 py-2 dark:border-white/10">
                                      Payment Mode
                                    </th>
                                    <th className="border border-gray-200 px-4 py-2 dark:border-white/10">
                                      Payment Date
                                    </th>
                                    <th className="border border-gray-200 px-4 py-2 dark:border-white/10">
                                      Download Receipt
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="text-gray-800 dark:text-gray-200">
                                  {item.feeLogs.map(
                                    (log: any, index: number) => (
                                      <tr
                                        key={log.id}
                                        className="border-t border-gray-200 dark:border-white/5"
                                      >
                                        <td className="px-4 py-2">
                                          {index + 1}
                                        </td>
                                        <td className="px-4 py-2">
                                          {log.receiptNo || "N/A"}
                                        </td>
                                        <td className="px-4 py-2">
                                          {log.amountPaid}
                                        </td>
                                        <td className="px-4 py-2">
                                          {log.paymentMode}
                                        </td>
                                        <td className="px-4 py-2">
                                          {log.paymentDate
                                            ? new Date(log.paymentDate)
                                                .toISOString()
                                                .split("T")[0]
                                            : "N/A"}
                                        </td>
                                        <td className="px-4 py-2">
                                          <div className="mb-2 flex items-center justify-between px-1">
                                            <Button
                                              size="sm"
                                              className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                                              disabled={
                                                item?.feeLogs.length === 0
                                              }
                                              onClick={() =>
                                                singleDownloadReceipt(item, log)
                                              }
                                            >
                                              Download Receipt
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400">
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
                    colSpan={12}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Payment found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Follow-Up Timeline modal === */}
      {showPaymentDetailsForm && selectedPaymentData && (
        <CreateStudentPaymentModal
          onCloseModal={handleCloseAdmissionModal} // Function to close timeline modal
          payment={selectedPaymentData!} // Pass follow-up data fetched from API
          title={""}
          currentPage={0}
          searchQuery={""}
        />
      )}
    </div>
  );
}
