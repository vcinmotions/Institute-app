import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import EditSourceForm from "../form/form-elements/EditSourceForm";

type SourceDataTableProps = {
  sources: any[];
  loading: boolean;
};

export default function SourceDataTable({
  sources,
  loading,
}: SourceDataTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sourceDetail, setSourceDetail] = useState<boolean>(false);
  const [sourceData, setSourceData] = useState<any>(null);

  const handleCloseModal = () => {
    setSelectedId(null);
    setSourceDetail(false);
    setSourceData(null);
  };

  const handleEdit = (item: any) => {
    setSelectedId(item.id);
    setSourceDetail(true);
    setSourceData(item);
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
                  Name
                </TableCell>

                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Update
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sources && sources.length > 0 ? (
                sources.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <TableCell className="px-3 py-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-3 py-1.5">
                      <Button
                        onClick={() => handleEdit(item)}
                        size="sm"
                        className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Source found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedId !== null && sourceDetail === true && (
        <EditSourceForm
          onCloseModal={handleCloseModal}
          sourceData={sourceData}
        />
      )}
    </div>
  );
}