import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tooltip } from "@heroui/react";

import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import EditCourseForm from "../form/form-elements/EditCourseForm";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

type CourseDataTableProps = {
  courses: any[];
  batch: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function CourseDataTable({
  courses,
  batch,
  loading,
  onSort,
  sortField,
  sortOrder,
}: CourseDataTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [batchDetail, setBatchDetail] = useState(false);
  const [batchData, setBatchData] = useState<any>(null);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();

  console.log("get All Query To search in Course DATA Table:", courses);

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
    setSelectedId(null);
    setBatchDetail(false);
    setBatchData(null);
  };

  const handleEditLab = (item: any) => {
    setSelectedId(item.id);
    setBatchDetail(true);
    setBatchData(item);
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[900px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">
            {/* ERP Style Table Header */}
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Course Name
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Duration Weeks
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Course Amount
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Edit
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {courses && courses.length > 0 ? (
                courses.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <TableCell className="px-3 py-1.5">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                        {item.name}
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.durationMonths} Weeks
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {new Intl.NumberFormat("en-IN").format(
                        item.courseFeeStructure?.totalAmount ?? 0
                      )}{" "}
                      INR
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Tooltip
                        className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5"
                        content="Edit Course"
                      >
                        <button
                          className="rounded p-0.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => handleEditLab(item)}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Course found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals Container */}
      {modalType === "createNew" && selectedEnquiryId !== null && (
        <CreateNewFollowUpOnEnquiryModal
          enquiryId={selectedEnquiryId}
          title="Create Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "complete" && selectedFollowUpId !== null && selectedEnquiryId !== null && (
        <CompleteFollowUpModal
          enquiryId={selectedEnquiryId}
          title="Complete Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {selectedId !== null && batchDetail === true && (
        <EditCourseForm onCloseModal={handleCloseModal} batchData={batchData} />
      )}
    </div>
  );
}