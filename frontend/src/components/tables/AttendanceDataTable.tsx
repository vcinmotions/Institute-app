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
import Badge from "../ui/badge/Badge";
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
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  console.log("get Selected date in Attendance data table:", selectedDate);
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
      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">Loading students...</div>
    );

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ERP Style Meta Header */}
      <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Batch:</span> {batchId}
        </div>{" "}
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Date:</span>{" "}
          {new Date(selectedDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[1102px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">

            {/* ERP Style Table Header */}
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sr No.
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Student
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Course
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Batch
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Faculty
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Attendance Status
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {attendanceData.length > 0 ? (
                attendanceData.map((record: any, index: number) => {
                  const isPresent = attendance[record.student?.id] || false;

                  return (
                    <TableRow key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">

                      {/* Sr No */}
                      <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-400 dark:text-slate-500">
                        {index + 1}
                      </TableCell>

                      {/* Student Info */}
                      <TableCell className="px-3 py-1.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              record.student?.photoUrl?.startsWith("http")
                                ? record.student.photoUrl
                                : `http://localhost:5001${record.student?.photoUrl || ""}`
                            }
                            alt="student"
                            className="h-7 w-7 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                            onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "/images/user/user-21.jpg")
                            }
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                              {record.student?.fullName || "N/A"}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide font-mono">
                              {record.student?.studentCode || "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Course */}
                      <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 capitalize">
                        {record.course?.name || "N/A"}
                      </TableCell>

                      {/* Batch */}
                      <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 capitalize">
                        {record.batch?.name || "N/A"}
                      </TableCell>

                      {/* Faculty */}
                      <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {record.batch?.faculty?.name || "N/A"}
                      </TableCell>

                      {/* Attendance Action Column */}
                      <TableCell className="px-3 py-1.5">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            disabled={role === "ADMIN"}
                            checked={isPresent}
                            onChange={(checked) =>
                              handleToggle(record.student?.id, checked)
                            }
                          />
                          <Badge
                            size="sm"
                            color={isPresent ? "success" : "error"}
                          >
                            {isPresent ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ✅ Action Footer */}
      {role === "FACULTY" && attendanceData.length > 0 && (
        <div className="flex justify-end border-t border-slate-200 bg-slate-50/30 p-3 dark:border-slate-800 dark:bg-slate-900/30">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="h-7 rounded-[4px] bg-blue-600 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Submit Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
}