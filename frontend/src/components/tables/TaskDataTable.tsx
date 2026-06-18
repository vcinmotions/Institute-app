import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import { TASK_STATUS } from "../common/BadgeStatus";
import EditTaskForm from "../form/form-elements/EditTaskForm";

type TaskDataTableProps = {
  tasks: any[];
  batch: any[];
  loading: boolean;
};

export default function TaskDataTable({
  tasks,
  batch,
  loading,
}: TaskDataTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [taskDetail, setTaskDetail] = useState(false);
  const [taskData, setTaskData] = useState<any>(null);

  const handleCloseModal = () => {
    setSelectedId(null);
    setTaskDetail(false);
    setTaskData(null);
  };

  const handleEditLab = (item: any) => {
    setSelectedId(item.id);
    setTaskDetail(true);
    setTaskData(item);
  };

  const handlePublish = (item: any) => {
    // TODO: Wire to actual publish mutation/endpoint
    console.log("Publish requested for task:", item.id);
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
                  Task Name
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Batch
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Course
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Publish
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Edit
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tasks && tasks.length > 0 ? (
                tasks.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Task Name */}
                    <TableCell className="px-3 py-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Batch */}
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.batch?.name || "—"}
                    </TableCell>

                    {/* Course */}
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.course?.name || "—"}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="px-3 py-1.5">
                      <Badge
                        size="sm"
                        color={TASK_STATUS[item.status] ?? "error"}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    {/* Publish Action Button */}
                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handlePublish(item)}
                        size="sm"
                        allowedRoles={["ADMIN", "FACULTY", "ACCOUNTANT"]}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Publish
                      </Button>
                    </TableCell>

                    {/* Micro Edit Icon Action */}
                    <TableCell className="px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditLab(item)}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-100 transition dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <svg
                          width="16"
                          height="16"
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Task found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Task Modal Layer */}
      {selectedId !== null && taskDetail === true && (
        <EditTaskForm onCloseModal={handleCloseModal} taskData={taskData} />
      )}
    </div>
  );
}