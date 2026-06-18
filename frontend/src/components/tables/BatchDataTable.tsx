import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

type CourseDataTableProps = {
  batch: any[];
};

export default function BatchDataTable({ batch }: CourseDataTableProps) {
  console.log("get All Query To search:", batch);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[1102px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">
            {/* ERP Style Table Header */}
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Batch Name
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Start Time
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  End Time
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Days
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Faculty
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Available PCs
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {batch && batch.length > 0 ? (
                batch.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <TableCell className="px-3 py-1.5">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.labTimeSlot?.startTime ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.labTimeSlot?.endTime ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.labTimeSlot?.day ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.faculty ? item.faculty.name : "Not Assigned"}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.labTimeSlot?.availablePCs ?? "0"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Batches found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}