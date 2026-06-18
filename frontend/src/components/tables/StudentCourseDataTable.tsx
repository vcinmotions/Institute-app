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
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import CourseCompletionForm from "../form/form-elements/CourseCompletionForm";
import Avatar from "../common/Avatar";
import Button from "../ui/button/Button";

type FollowUpModalType = "completeCourse" | "update" | "complete" | null;

type StudentCourseDataTableProps = {
  studentCourse: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function StudentCourseDataTable({
  studentCourse,
  loading,
  onSort,
  sortField,
  sortOrder,
}: StudentCourseDataTableProps) {
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedStudentCourseId, setSelectedStudentCourseId] =
    useState<string>("");
  const { mutate: fetchEnquiries } = useFetchEnquiry();
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleSort = (field: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const order: "asc" | "desc" =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";

    fetchEnquiries({
      token,
      sortField: field,
      sortOrder: order,
    });
  };

  const handleCompletion = (item: any) => {
    setModalType("completeCourse");
    setStudentId(item.studentCourse.student.id);
    setSelectedStudentCourseId(item.studentCourse.id);
  };

  const handleDownload = async (url: string) => {
    if (!url) {
      alert("No certificate available to download.");
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop() || "certificate.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the certificate.");
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
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Student Name
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Course
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Batch
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => onSort("startDate")}
                  >
                    Start Date
                    <span className="text-[9px] opacity-70">
                      {sortField !== "startDate" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => onSort("endDate")}
                  >
                    End Date
                    <span className="text-[9px] opacity-70">
                      {sortField !== "endDate" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Course Completion
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Download
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {studentCourse && studentCourse.length > 0 ? (
                studentCourse.map((item: any) => (
                  <TableRow
                    key={item.studentCourse?.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <TableCell className="px-3 py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full flex items-center justify-center">
                          {item?.studentCourse?.student?.photoUrl ? (
                            <img
                              src={
                                item?.studentCourse?.student?.photoUrl?.startsWith("http")
                                  ? item.photoUrl
                                  : `http://localhost:5001${item?.studentCourse?.student?.photoUrl}`
                              }
                              alt="student"
                              className="h-7 w-7 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/user/user-21.jpg";
                              }}
                            />
                          ) : (
                            <Avatar name={item?.studentCourse?.student?.fullName} size={28} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize truncate">
                            {item.studentCourse?.student?.fullName || "N/A"}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide truncate">
                            {item.studentCourse?.student?.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                      {item.studentCourse?.course?.name || "N/A"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.studentCourse?.batchId || "N/A"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Badge
                        size="sm"
                        color={
                          item.studentCourse?.status === "COMPLETED"
                            ? "success"
                            : item.studentCourse?.status === "ACTIVE"
                              ? "warning"
                              : item.studentCourse?.status === "WARM"
                                ? "info"
                                : "error"
                        }
                      >
                        {item.studentCourse?.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.studentCourse?.startDate
                        ? new Date(item.studentCourse.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.studentCourse?.endDate
                        ? new Date(item.studentCourse.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleCompletion(item)}
                        disabled={item.studentCourse.status === "COMPLETED"}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Completion
                      </Button>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      {item.studentCourse?.certificate?.certificateUrl ? (
                        <Button
                          onClick={() =>
                            handleDownload(item.studentCourse.certificate.certificateUrl)
                          }
                          className="h-6 rounded-[4px] bg-amber-500 px-2.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                        >
                          Download
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic dark:text-slate-500">
                          No Certificate
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Student Course found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {modalType === "completeCourse" && studentId !== null && (
        <CourseCompletionForm
          studentId={studentId}
          studentCourseId={selectedStudentCourseId}
          onCloseModal={() => setModalType(null)}
        />
      )}
    </div>
  );
}