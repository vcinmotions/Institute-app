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

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";

import Button from "../ui/button/Button";
import EditFacultyForm from "../form/form-elements/EditfacultyForm";
import EditSourceForm from "../form/form-elements/EditSourceForm";


type SourceDataTableProps = {
  sources: any[];
  loading: boolean;
};

export default function FacultyDataTable({
  sources,
  loading,
}: SourceDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [facultyDetail, setFacultyDetail] = useState<boolean>(false);
  const [sourceData, setSourceData] = useState<any>(null);

 const handleCloseModal = () => {
    setShowForm(false);
    setFacultyDetail(false);
  };

  const hanldleEdit = (item: any) => {
    setSelectedId(item.id);
    setFacultyDetail(true);
    setSourceData(item);
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[500px] min-w-[1102px] overflow-y-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Name
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Update
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sources && sources.length > 0 ? (
                sources.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                          {/* <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Faculty
                          </span> */}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-start">
                      <Button
                        onClick={() => hanldleEdit(item)}
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Source found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedId !== null && facultyDetail === true && (
        <EditSourceForm
          onCloseModal={handleCloseModal}
          sourceData={sourceData}
        />
      )}
    </div>
  );
}
