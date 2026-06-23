"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

// Components & UI Elements
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import AdmissionForm from "../common/AdmissionForm";
import CourseForm from "../form/form-elements/AddCourseToStudentForm";
import EditStudentForm from "../form/form-elements/EditStudentForm";
import Avatar from "../common/Avatar";

// Store & API Utilities
import { RootState } from "@/store";
import { getUser } from "@/lib/api";
import { setLoading, setUser } from "@/store/slices/authSlice";
import { Student } from "@/types/student";
import Link from "next/link";

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
  const dispatch = useDispatch();
  const router = useRouter();

  // Local Component States
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  // Sorting Handler behavior
  const handleSort = (field: string) => {
    onSort(field);
  };

  // ✅ FIXED: Clean cleanup handlers to prevent row re-click freezing bugs
  const handleCloseAdmissionModal = () => {
    setShowAdmissionForm(false);
    setStudentId(null);
    setStudentDetails(null);
  };

  const handleCloseEditStudentModal = () => {
    setShowEditForm(false);
    setStudentId(null);
    setStudentDetails(null);
  };

  const handleCloseCourseModal = () => {
    setShowCourseForm(false);
    setStudentId(null);
    setStudentDetails(null);
  };

  const handleAdmissionForm = (id: any) => {
    const details = students.find((item) => item.id === id);
    if (!details) return;

    setStudentDetails(details);
    setStudentId(id);
    setShowAdmissionForm(true);
  };

  const handleEditForm = (id: any) => {
    const details = students.find((item) => item.id === id);
    if (!details) return;

    setStudentDetails(details);
    setStudentId(id);
    setShowEditForm(true);
  };

  const handleCourseForm = (id: any) => {
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

        dispatch(setLoading(false));
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
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contact</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <button type="button" className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort("admissionDate")}>
                    Admission Date
                    <span className="text-[9px] opacity-70">
                      {sortField !== "admissionDate" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Add New Course</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Admission Form</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Edit Details</TableCell>
              </TableRow>
            </TableHeader>

            {/* ✅ FIXED: Eradicated parsing syntax crash right inside the TableBody evaluation node */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-3 text-center text-xs text-slate-400">Loading master records...</TableCell>
                </TableRow>
              ) : students && students.length > 0 ? (
                students.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <TableCell className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-slate-100 dark:border-slate-800">
                          {item?.photoUrl ? (
                            <img
                              src={item.photoUrl.startsWith("http") ? item.photoUrl : `http://localhost:5001${item.photoUrl}`}
                              alt="student"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/user/user-21.jpg";
                              }}
                            />
                          ) : (
                            <Avatar name={item?.fullName} size={28} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">{item.fullName}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {item.admissionDate ? new Date(item.admissionDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 tracking-wide">{item.email || "—"}</TableCell>
                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">{item.contact || "—"}</TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
                      {item.admissionDate ? new Date(item.admissionDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleCourseForm(item.id)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      >
                        Add
                      </Button>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Link
                        href={(`/dashboard/student/admission-form/${item.id}`)}
                        className="h-6 rounded-[8px] border border-slate-200 bg-white py-1.5 px-4 text-[11px] font-medium text-white shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      >
                        View
                      </Link>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleEditForm(item.id)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">No Students found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Student Admission Modal === */}
      {showAdmissionForm && studentDetails && studentId !== null && (
        <AdmissionForm
          companyDetails={user}
          onCloseModal={handleCloseAdmissionModal}
          student={studentDetails}
        />
      )}

      {/* === Edit Student Detail Modal === */}
      {showEditForm && studentDetails && studentId !== null && (
        <EditStudentForm
          onCloseModal={handleCloseEditStudentModal}
          student={studentDetails}
        />
      )}

      {/* === Add Course Modal === */}
      {showCourseForm && studentId !== null && (
        <CourseForm
          onCloseModal={handleCloseCourseModal}
          studentId={studentId}
          batch={batch}
          course={course}
          studentDetails={studentDetails}
        />
      )}
    </div>
  );
}