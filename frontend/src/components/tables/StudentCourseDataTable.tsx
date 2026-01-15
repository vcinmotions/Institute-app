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
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Button from "../ui/button/Button";
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import { Student } from "@/types/student";
import CourseCompletionForm from "../form/form-elements/CourseCompletionForm";

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
  const [showForm, setShowForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const dispatch = useDispatch();
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [showCreateFollowUp, setShowCreateFollowUp] = useState(false);
  const [enquiryDetail, setEnquiryDetail] = useState(false);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null); // You can strongly type this
  const [newEnquiry, setNewEnquiry] = React.useState({
    name: "",
    email: "",
    course: "",
    source: "",
    contact: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedStudentCourseId, setSelectedStudentCourseId] =
    useState<string>("");
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  const [studentId, setStudentId] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  //const { enquiries, loading } = useSelector((state: RootState) => state.enquiry);

  // const [sortField, setSortField] = useState<string>("admissionDate");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  console.log("get All Query To search:", studentCourse);

  // Dispatch server-side fetch
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

  console.log("Get All Enquiry Details in Enquiry table", studentCourse);

  const handleCompletion = (item: any) => {
    setModalType("completeCourse");
    setStudentId(item.studentCourse.student.id);
    setSelectedStudentCourseId(item.studentCourse.id);
    console.log("get Studemnt datra in Course Completion:", item);
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

  console.log("get ModalType", modalType);
  console.log("get selectedStudentId", selectedStudentId);
  console.log("get selectedStudentCourseId", selectedStudentCourseId);
  console.log(
    ":Get STudent Course data in Student Course Table:",
    studentCourse,
  );
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[500px] min-w-[1102px] overflow-y-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/[0.05]">
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
                  Batch
                </TableCell>
                {/* <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Faculty
                </TableCell> */}
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("startDate")}
                  >
                    Start Date
                    <span>
                      {sortField === "startDate" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("endDate")}
                  >
                    End Date
                    <span>
                      {sortField === "endDate" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button type="button" className="flex items-center gap-1">
                    Course Completion
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                 Download
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {studentCourse && studentCourse.length > 0 ? (
                studentCourse.map((item: any) => (
                  <TableRow key={item.studentCourse?.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <img
                          src={
                            item?.studentCourse?.student?.photoUrl?.startsWith("http")
                              ? item?.studentCourse?.student?.photoUrl
                              : `http://localhost:5001${item?.studentCourse?.student?.photoUrl || ""}`
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
                            {item.studentCourse?.student?.fullName || "N/A"}
                          </span>
                          <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                            {item.studentCourse.student.email
                              ? item.studentCourse?.student?.email
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCourse?.course?.name || "N/A"}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCourse?.batchId || "N/A"}
                    </TableCell>

                    {/* <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCourse?.batch?.faculty?.name || "N/A"}
                    </TableCell> */}

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          item.studentCourse?.status === "COMPLETED"
                            ? "success"
                            : item.studentCourse?.status === "ACTIVE"
                              ? "warning"
                              : item.studentCourse?.status === "WARM"
                                ? "info" // or any color name you support
                                : "error"
                        }
                      >
                        {item.studentCourse?.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCourse?.startDate
                        ? new Date(
                            item.studentCourse.startDate,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCourse?.endDate
                        ? new Date(
                            item.studentCourse.endDate,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Button
                        size="sm"
                        onClick={() => handleCompletion(item)}
                        disabled={item.studentCourse.status === "COMPLETED"}
                        className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Completion
                      </Button>
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCourse?.certificate?.certificateUrl ? (
                        <Button
                        size="sm"
                          onClick={() =>
                            handleDownload(
                              item.studentCourse.certificate.certificateUrl,
                            )
                          }
                          className="mt-2 bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                          Download
                        </Button>
                      ) : (
                        <span className="text-gray-400 italic">
                          No Certificate
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
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
