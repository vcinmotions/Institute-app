import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/button/Button";
import AdmissionForm from "../common/AdmissionForm";
import { Student } from "@/types/student";
import CourseForm from "../form/form-elements/AddCourseToStudentForm";
import { RootState } from "@/store";
import { getUser } from "@/lib/api";
import { setLoading, setUser } from "@/store/slices/authSlice";
import EditStudentForm from "../form/form-elements/EditStudentForm";
import Avatar from "../common/Avatar";

type StudentDataTableProps = {
  students: any[];
  batch: any[];
  course: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function StudentDataTable({
  students,
  batch,
  course,
  loading,
  onSort,
  sortField,
  sortOrder,
}: StudentDataTableProps) {
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);

  // Sorting Handler logic matching ERP behavior
  const handleSort = (field: string) => {
    onSort(field);
  };

  const handleCloseAdmissionModal = () => {
    setShowAdmissionForm(false);
  };

  const handleCloseEditStudentModal = () => {
    setShowEditForm(false);
  };

  const handleCloseCourseModal = () => {
    setShowCourseForm(false);
  };

  const handleAdmissionForm = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const details = students.find((item) => item.id === id);
    if (!details) return;

    setStudentDetails(details);
    setStudentId(id);
    setShowAdmissionForm(true);
  };

  const handleEditForm = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const details = students.find((item) => item.id === id);
    if (!details) return;

    setStudentDetails(details);
    setStudentId(id);
    setShowEditForm(true);
  };

  const handleCourseForm = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const details = students.find((item) => item.id === id);
    if (!details) return;

    setStudentDetails(details);
    setStudentId(id);
    setShowCourseForm(true);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        const data = await getUser(token);
        dispatch(setUser(data.userdata));

        const role = data?.userdata?.role;
        if (role === "MASTER_ADMIN") {
          router.replace("/master-dashboard");
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };

    fetchUser();
  }, [dispatch, router]);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[1102px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">
            {/* ERP Style Table Header matching your exact theme requirements */}
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  User
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Email
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Contact
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("admissionDate")}
                  >
                    Admission Date
                    <span className="text-[9px] opacity-70">
                      {sortField !== "admissionDate"
                        ? "↕"
                        : sortOrder === "asc"
                          ? "↑"
                          : "↓"}
                    </span>
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Add New Course
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Admission Form
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Edit Details
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {students && students.length > 0 ? (
                students.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    {/* User profile detail block */}
                    <TableCell className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-slate-100 dark:border-slate-800">
                          {item?.photoUrl ? (
                            <img
                              src={
                                item.photoUrl.startsWith("http")
                                  ? item.photoUrl
                                  : `http://localhost:5001${item.photoUrl}`
                              }
                              alt="student"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/images/user/user-21.jpg";
                              }}
                            />
                          ) : (
                            <Avatar name={item?.fullName} size={28} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                            {item.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {new Date(item.admissionDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 tracking-wide">
                      {item.email}
                    </TableCell>

                    {/* Contact details */}
                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.contact ? item.contact : "—"}
                    </TableCell>

                    {/* Admission Date field */}
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
                      {new Date(item.admissionDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </TableCell>

                    {/* Micro Action: Add Course */}
                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleCourseForm(item.id)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Add
                      </Button>
                    </TableCell>

                    {/* Micro Action: View Admission Form */}
                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleAdmissionForm(item.id)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        View
                      </Button>
                    </TableCell>

                    {/* Micro Action: Edit Details */}
                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleEditForm(item.id)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Student found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Student Admission modal === */}
      {showAdmissionForm && studentDetails && studentId !== null && (
        <AdmissionForm
          companyDetails={user}
          onCloseModal={handleCloseAdmissionModal}
          student={studentDetails!}
        />
      )}

      {/* === Edit Student Detail modal === */}
      {showEditForm && studentDetails && studentId !== null && (
        <EditStudentForm
          onCloseModal={handleCloseEditStudentModal}
          student={studentDetails!}
        />
      )}

      {/* === Add Course modal === */}
      {showCourseForm && studentDetails && studentId !== null && (
        <CourseForm
          onCloseModal={handleCloseCourseModal}
          studentId={studentId!}
          batch={batch}
          course={course}
          studentDetails={studentDetails}
        />
      )}
    </div>
  );
}