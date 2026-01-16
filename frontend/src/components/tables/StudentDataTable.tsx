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
import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";
import { useCreateAdmission } from "@/hooks/useCreateAdmission";
import { useDeleteEnquiry } from "@/hooks/useDeleteEnquiry";
import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import EnquiryDetails from "../ui/enquiry/EnquiryDetails";
import { addFollowUpsForEnquiry } from "@/store/slices/followUpSlice";
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import AdmissionForm from "../common/AdmissionForm";
import { Student } from "@/types/student";
import CourseForm from "../form/form-elements/AddCourseToStudentForm";
import { RootState } from "@/store";
import { getUser } from "@/lib/api";
import { setLoading, setUser } from "@/store/slices/authSlice";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

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
  const [showForm, setShowForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const dispatch = useDispatch();

  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);

  console.log("get All Query To search:", students);

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

  const handleCloseModal = () => {
    setShowForm(false);
  };

  const handleCloseAdmissionModal = () => {
    setShowAdmissionForm(false);
  };

  const handleCloseCourseModal = () => {
    setShowCourseForm(false);
  };

  console.log("Get All Enquiry Details in Enquiry table", students);

  const handleAdmissionForm = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }

    console.log("Get studentId to Admission Handle:", id);

    console.log("Student All Details:", students);

    const studentDetails = students.find((item) => item.id === id);

    console.log(
      "Get student Data with Id in Handle Admission:",
      studentDetails,
    );

    if (!studentDetails) {
      console.error("No enquiry data found for this ID");
      return;
    }

    // ✅ Save ID and data to state
    setStudentDetails(studentDetails);
    setStudentId(id);

    console.log("Get student Id in HandleAdmission:", studentId);
    console.log("Get studentDetails in HandleAdmission:", studentDetails);
    setShowAdmissionForm(true);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.warn("No token found.");
        router.replace("/signin"); // or "/login"
        return; // ✅ return early to prevent `getUser(null)`
      }

      try {
        const data = await getUser(token);
        dispatch(setUser(data.userdata));
        console.log("GET USER DATA IN ADMIN LAYOUT:", data);

        // 🚫 Restrict MASTER_ADMIN from entering Admin layout
        const role = data?.userdata?.role;
        if (role === "MASTER_ADMIN") {
          console.warn("Master admin cannot access Admin layout.");
          router.replace("/master-dashboard"); // 👈 redirect to master layout
          return;
        }

        setLoading(false); // ✅ All good, show dashboard
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleCourseForm = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }

    console.log("Get studentId to Admission Handle:", id);

    console.log("Student All Details:", students);

    const studentDetails = students.find((item) => item.id === id);

    console.log(
      "Get student Data with Id in Handle Admission:",
      studentDetails,
    );

    if (!studentDetails) {
      console.error("No enquiry data found for this ID");
      return;
    }

    // ✅ Save ID and data to state
    setStudentDetails(studentDetails);
    setStudentId(id);

    console.log("Get student Id in HandleAdmission:", studentId);
    console.log("Get studentDetails in HandleAdmission:", studentDetails);
    setShowCourseForm(true);
  };


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
                  User
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Email
                </TableCell>
                {/* <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Studant Code
                </TableCell> */}
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Contact
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("admissionDate")}
                  >
                    Admission Date
                    <span>
                      {sortField === "admissionDate" && sortOrder === "asc"
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
                    Add New Course
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button type="button" className="flex items-center gap-1">
                    Admission Form
                  </button>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {students && students.length > 0 ? (
                students.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <img
                          src={
                            item?.photoUrl?.startsWith("http")
                              ? item.photoUrl
                              : `http://localhost:5001${item?.photoUrl || ""}`
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
                            {item.fullName}
                          </span>
                          <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                            {/* {new Date(item.admissionDate).toLocaleDateString()} */}
                            {new Date(item.admissionDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.email}
                    </TableCell>
                    {/* <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.studentCode}
                    </TableCell> */}
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.contact}
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {/* {new Date(item.admissionDate).toISOString().split("T")[0]} */}
                      {new Date(item.admissionDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleCourseForm(item.id)}
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Add Course
                      </Button>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleAdmissionForm(item.id)}
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Admission
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Sudent found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>


      {/* === Follow-Up Timeline modal === */}
      {showAdmissionForm && studentDetails && studentId !== null && (
        <AdmissionForm
          companyDetails={user}
          onCloseModal={handleCloseAdmissionModal} // Function to close timeline modal
          student={studentDetails!} // Pass follow-up data fetched from API
        />
      )}

      {/* === Follow-Up Timeline modal === */}
      {showCourseForm && studentDetails && studentId !== null && (
        <CourseForm
          onCloseModal={handleCloseCourseModal} // Function to close timeline modal
          studentId={studentId!} // Pass follow-up data fetched from API
          batch={batch}
          course={course}
          studentDetails={studentDetails}
        />
      )}
    </div>
  );
}
