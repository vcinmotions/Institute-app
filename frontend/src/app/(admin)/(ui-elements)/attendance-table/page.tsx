"use client";
import Pagination from "@/components/tables/Pagination";
import {
  downloadAttendanceExcel,
  getAttendanceByBatch,
  getBatch,
  getCourse,
  getStudentAttendance,
  getStudentCourse,
} from "@/lib/api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import React, { useState, useEffect } from "react";
import AttendanceDataTable from "@/components/tables/AttendanceDataTable";

import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import FilterBox from "@/components/form/input/FilterBox";
import StudentCard from "@/components/common/StudentCard";
import Alert from "@/components/ui/alert/Alert";

export default function AttendanceTable() {
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const batch = useSelector((state: RootState) => state.batch.batches);

  const [alert, setAlert] = useState<{ show: boolean; title: string; message: string; variant: string }>({
      show: false,
      title: '',
      message: '',
      variant: '',
    });

  // const facultyBatch = batch.filter((item) => item.facultyId === user.id);

  // ✅ Determine batch list based on role
  const facultyBatch =
    user?.role === "ADMIN"
      ? batch // admin sees all batches
      : batch.filter((item) => item.facultyId === user.id);

  console.log("GET BATCH DATA (filtered or all):", facultyBatch);

  console.log("GET FACULTY BATCH DATA:", facultyBatch);

  console.log("GET USER IN ATTENDANCE DATA TABLE:", user);

  // 🔹 Load all batches + courses once
  useEffect(() => {
    const fetchBatchCourse = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const [responseBatch, responseCourse] = await Promise.all([
          getBatch({ token }),
          getCourse({ token }),
        ]);
        dispatch(setBatches(responseBatch.batch || []));
        dispatch(setCourses(responseCourse.course || []));
      } catch (err) {
        console.error("Error fetching filters data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatchCourse();
  }, []);

  // 🔹 Handle filters (Course, Batch, Date)
  // const handleFilters = (selectedFilters: Record<string, string | null>) => {
  //   console.log("🧩 Selected filters:", selectedFilters);
  //   setFilters(selectedFilters);
  //   setSelectedDate(selectedFilters.date || new Date().toISOString().split("T")[0]);
  // };

  const handleFilters = (selectedFilters: Record<string, string | null>) => {
    console.log("🧩 Selected filters:", selectedFilters);

    const today = new Date().toISOString().split("T")[0];
    const appliedDate = selectedFilters.date || today;

    setFilters({
      ...selectedFilters,
      date: appliedDate,
    });

    setSelectedDate(appliedDate);
  };

  const handlePagination = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDownloadAttendance = async () => {
  const batchId = filters.batchId ? Number(filters.batchId) : null;
  const date =
    filters.date || new Date().toISOString().split("T")[0];

  // 🛑 Validate inputs
  if (!batchId || !date) {
    setAlert({
      show: true,
      title: "Missing Required Fields",
      message: "Please select Batch and Date to download attendance.",
      variant: "error",
    });

    setTimeout(() => {
      setAlert({
        show: false,
        title: "",
        message: "",
        variant: "",
      });
    }, 2000);

    return; // ⛔ STOP execution
  }

  if (!token) {
    setAlert({
      show: true,
      title: "Authentication Error",
      message: "Session expired. Please login again.",
      variant: "error",
    });
    return;
  }

  try {
    setLoading(true);

    await downloadAttendanceExcel(token, batchId, date);

    setAlert({
      show: true,
      title: "Download Started",
      message: "Attendance file is downloading.",
      variant: "success",
    });
  } catch (error) {
    console.error("❌ Error downloading attendance:", error);

    setAlert({
      show: true,
      title: "Download Failed",
      message: "Please try again later.",
      variant: "error",
    });
  } finally {
    setLoading(false);

    setTimeout(() => {
      setAlert({
        show: false,
        title: "",
        message: "",
        variant: "",
      });
    }, 2000);
  }
};


  // 🔹 Fetch student + attendance data only when filters are applied

  console.log("Get bath Id in filter:", filters);
  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Attendance">
          {/* 🔍 Filter Section */}
          <div className="flex justify-end gap-2">
            <FilterBox
              onFilterChange={handleFilters}
              filterFields={[
                {
                  label: "Batch",
                  key: "batchId",
                  type: "select",
                  options: facultyBatch.map((b) => ({
                    label: b.name,
                    value: b.id.toString(),
                  })),
                },
                { label: "Date", key: "date", type: "date" },
              ]}
            />

            <button
              className="rounded-md bg-green-600 px-4 py-2 text-white"
              onClick={handleDownloadAttendance}
            >
              Download Attendance
            </button>
          </div>

          {alert.show && 
          (<Alert
            variant={"error"}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />)}

          {/* 🧾 Attendance Table only after filter selection */}
          {filters.batchId ? (
            <AttendanceDataTable
              key={`${filters.batchId}-${filters.date}`} // 🔥 Forces remount when filters change
              loading={loading}
              facultyId={user.id}
              role={user.role}
              batchId={filters.batchId}
              selectedDate={
                filters.date || new Date().toISOString().split("T")[0]
              } // ✅ fallback to today
            />
          ) : (
            <div className="p-6 text-center text-gray-400">
              ⚙️ Please select Batch with Date to view & mark attendance.
            </div>
          )}

          {/* 📄 Pagination (optional) */}
          {filters.batchId && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePagination}
            />
          )}
        </StudentCard>
      </div>
    </div>
  );
}
