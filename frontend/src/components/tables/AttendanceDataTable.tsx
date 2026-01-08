"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import { useMutation } from "@tanstack/react-query";
import { markAttendance, getAttendanceByBatch } from "@/lib/api";
import Checkbox from "../form/input/Checkbox";

type AttendanceDataTableProps = {
  facultyId: string;
  loading: boolean;
  batchId: string;
  role: string;
  selectedDate: string; // ✅ accept selected date from parent
};

export default function AttendanceDataTable({
  facultyId,
  role,
  loading,
  batchId,
  selectedDate,
}: AttendanceDataTableProps) {
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  // const [selectedDate, setSelectedDate] = useState<string>(
  //   new Date().toISOString().split("T")[0]
  // );
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  console.log("get Selected dtae in Attendance data table:", selectedDate);
  console.log("get Batch Id in Attendance data table:", batchId);
  console.log("get Faculty Id in Attendance data table:", facultyId);
  console.log("get Role in Attendance data table:", role);

  // ✅ Fetch existing attendance when date or batch changes
  useEffect(() => {
    const fetchAttendance = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !batchId) return;

      try {
        const data = await getAttendanceByBatch(
          token,
          Number(batchId), // ✅ convert to number
          selectedDate,
        );

        console.log("📅 Existing Attendance Data:", data);

        // ✅ Fix mapping (record.student.id instead of record.studentId)
        const mapped: Record<number, boolean> = {};
        data.forEach((record: any) => {
          if (record.student?.id) {
            mapped[record.student.id] = record.present;
          }
        });

        setAttendance(mapped);
        setAttendanceData(data); // ✅ save fetched records
      } catch (err) {
        console.error("Error fetching existing attendance:", err);
      }
    };

    fetchAttendance();
  }, [selectedDate, batchId, facultyId]);

  // ✅ Mutation for marking attendance
  const { mutate: submitAttendance, isPending } = useMutation({
    mutationFn: async (data: any) => await markAttendance(data),
    onSuccess: () => alert("✅ Attendance saved!"),
    onError: (err) => {
      console.error("Error saving attendance:", err);
      alert("❌ Failed to save attendance");
    },
  });

  // ✅ Handle checkbox
  const handleToggle = (studentId: number, present: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: present }));
  };

  // ✅ Submit attendance
  const handleSubmit = () => {
    if (!attendanceData.length) return;
    const first = attendanceData[0];
    const records = attendanceData.map((item) => ({
      studentId: item.student?.id,
      present: attendance[item.student?.id] || false,
    }));

    const payload = {
      date: selectedDate,
      batchId: first.batch?.id,
      courseId: first.course?.id,
      attendance: records,
    };

    console.log("📤 Sending Attendance Payload:", payload);
    submitAttendance(payload);
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading students...</div>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* 🧾 Table */}
      {/* ✅ Display selected date for faculty */}
      <div className="flex items-center justify-end border-b border-gray-100 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Batch:</span> {batchId}
        </div>{" "}
        {"  | "}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Date:</span>{" "}
          {new Date(selectedDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[500px] min-w-[1100px] overflow-y-auto">
          <Table>
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Student
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
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Faculty
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Attendance
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {attendanceData.length > 0 ? (
                attendanceData.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            record.student?.photoUrl?.startsWith("http")
                              ? record.student.photoUrl
                              : `http://localhost:5001${record.student?.photoUrl || ""}`
                          }
                          alt="student"
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "/images/user/user-21.jpg")
                          }
                        />
                        <div>
                          <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                            {record.student?.fullName || "N/A"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {record.student?.studentCode || "N/A"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-theme-sm capitalize font-medium text-gray-800 dark:text-white/90">
                      {record.course?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-theme-sm capitalize font-medium text-gray-800 dark:text-white/90">
                      {record.batch?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {record.batch?.faculty?.name || "N/A"}
                    </TableCell>

                    <TableCell className="text-center">
                      <label className="inline-flex items-center gap-2">
                        <Checkbox
                        disabled={role === "ADMIN"}
                          checked={attendance[record.student?.id] || false}
                          onChange={(checked) =>
                            handleToggle(record.student?.id, checked)
                          }
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-100">
                          {attendance[record.student?.id]
                            ? "Present"
                            : "Absent"}
                        </span>
                      </label>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-gray-500"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ✅ Submit Button */}
      {role === "FACULTY" && attendanceData.length > 0 && (
        <div className="flex justify-end divide-y divide-gray-100 border-t border-gray-100 p-4 dark:divide-white/[0.05] dark:border-white/[0.05]">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            {isPending ? "Saving..." : "Submit Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
}
