import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import AssignBatchFacultyForm from "../form/form-elements/AssignbatchToFacultyForm";
import Button from "../ui/button/Button";
import EditFacultyForm from "../form/form-elements/EditfacultyForm";
import { Tooltip } from "@heroui/react";

type FacultyDataTableProps = {
  faculties: any[];
  courses: any[];
  batch: any[];
  loading: boolean;
};

export default function FacultyDataTable({
  faculties,
  courses,
  batch,
  loading,
}: FacultyDataTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [facultyDetail, setFacultyDetail] = useState<boolean>(false);
  const [facultyData, setFacultyData] = useState<any>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

  const handleAssignBatchClick = (item: any) => {
    setSelectedFaculty(item);
    setShowAssignModal(true);
  };

  const handleEditClick = (item: any) => {
    setSelectedId(item.id);
    setFacultyDetail(true);
    setFacultyData(item);
  };

  const handleCloseModal = () => {
    setFacultyDetail(false);
    setSelectedId(null);
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[1102px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">
            {/* ERP Style Table Header */}
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Faculty Name
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact No.
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Joining Date
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Batch Assignment
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {faculties && faculties.length > 0 ? (
                faculties.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <TableCell className="px-3 py-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
                          Faculty Member
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.email}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.contact ?? "—"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.joiningDate ? new Date(item.joiningDate).toISOString().split("T")[0] : "—"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleAssignBatchClick(item)}
                        variant="nobg"
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 dark:text-slate-50 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 hover:text-slate-900"
                      >
                        Assign Batch
                      </Button>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Tooltip className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5" content="Edit Faculty">
                        <button
                          className="rounded p-0.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          onClick={() => handleEditClick(item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    colSpan={6}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Faculty found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Overlays / Forms */}
      {selectedFaculty !== null && showAssignModal && (
        <AssignBatchFacultyForm
          faculty={selectedFaculty}
          title="Assign New Batch"
          onCloseModal={() => {
            setSelectedFaculty(null);
            setShowAssignModal(false);
          }}
          courses={courses}
          batch={batch}
        />
      )}

      {selectedId !== null && facultyDetail === true && (
        <EditFacultyForm
          onCloseModal={handleCloseModal}
          facultyData={facultyData}
          batch={batch}
          course={courses}
        />
      )}
    </div>
  );
}