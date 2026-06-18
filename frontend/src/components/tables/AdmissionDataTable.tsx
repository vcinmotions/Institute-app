import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useSelector } from "react-redux";
import Button from "../ui/button/Button";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import Avatar from "../common/Avatar";
import { STATUS_COLOR_MAP } from "../common/BadgeStatus";
import { formatDate } from "../common/Formatdate";

type AdmissionDataTableProps = {
  admissions: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function AdmissionDataTable({
  admissions,
  loading,
  onSort,
  sortField,
  sortOrder,
}: AdmissionDataTableProps) {
  const router = useRouter();
  const admission = useSelector(
    (state: RootState) => state.admission.admissions,
  );

  console.log(
    "Get Enquiries to Proceed With Admission:",
    admission,
  );

  const handleEditAdmission = (id: string) => {
    router.push(`/dashboard/admission/edit?id=${id}`);
  };

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
                  Enquiry
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
                  Course
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Status
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => onSort("createdAt")}
                  >
                    Enquiry At
                    <span className="text-[9px] opacity-70">
                      {sortField !== "createdAt" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Admission
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {admission && admission.length > 0 ? (
                admission.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <TableCell className="px-3 py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 overflow-hidden rounded-full flex-shrink-0">
                          <Avatar name={item.name} size={28} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
                            {new Date(item.createdAt).toLocaleDateString(
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

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {item.email ? item.email : "-"}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.contact}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="space-y-0.5">
                        {item.enquiryCourse.map((cr: any, index: number) => (
                          <div key={index} className="truncate max-w-[150px]">
                            {cr.course.name}
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Badge
                        size="sm"
                        color={STATUS_COLOR_MAP[item.leadStatus] ?? "error"}
                      >
                        {item.leadStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(item.enquiryDate)}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleEditAdmission(item.id)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Admission found.
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