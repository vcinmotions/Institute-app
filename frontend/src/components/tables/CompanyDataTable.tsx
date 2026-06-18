import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Button from "../ui/button/Button";
import ShowEncryptedPassword from "../form/form-elements/ShowPasswordModal";

type CompanyDataTableProps = {
  company: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function CompanyDataTable({
  company,
  loading,
  onSort,
  sortField,
  sortOrder,
}: CompanyDataTableProps) {
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const handleShowPassword = (item: string) => {
    setSelectedId(item);
    setPassword(item);
  };

  const handleCloseShowPassword = () => {
    setSelectedId(null);
    setPassword(null);
  };

  console.log("get All Query To search in company Table:", company);

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
                  Sr No.
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Institute Name
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Username / Email
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                  // onClick={() => onSort("createdAt")}
                  >
                    Published Date
                    <span className="text-[9px] opacity-70">
                      {sortField !== "createdAt" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>

                {/* <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Actions
                </TableCell> */}
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {company && company.length > 0 ? (
                company.map((item: any, index: number) => (
                  <TableRow
                    key={item.id || index}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-400 dark:text-slate-500">
                      {index + 1}
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
                          Company
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.email}
                    </TableCell>

                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "—"}
                    </TableCell>

                    {/* <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleShowPassword(item.originalPassword)}
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Show Password
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Company found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedId !== null && password !== null && (
        <ShowEncryptedPassword
          onCloseModal={handleCloseShowPassword}
          encryptedPassword={password}
        />
      )}
    </div>
  );
}