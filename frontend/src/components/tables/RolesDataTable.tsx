import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch } from "react-redux";
import EditRolesForm from "../form/form-elements/EditRoleForm";
import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";
import { Tooltip } from "@heroui/react";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

type RolesDataTableProps = {
  roles: any[];
  loading: boolean;
};

export default function RolesDataTable({
  roles,
  loading,
}: RolesDataTableProps) {
  const [roleDetail, setRoleDetail] = useState<boolean>(false);
  const [roleData, setRoleData] = useState<any>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);

  const handleCloseModal = () => {
    setSelectedId(null);
    setRoleDetail(false);
    setRoleData(null);
  };

  const hanldleEdit = (item: any) => {
    setSelectedId(item.id);
    setRoleDetail(true);
    setRoleData(item);
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
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {roles && roles.length > 0 ? (
                roles.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                  >
                    <TableCell className="px-3 py-1.5">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {item.email}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {item.role}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : "—"}
                    </TableCell>
                    <TableCell className="px-3 py-1.5">
                      <Tooltip
                        className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5"
                        content="Edit Role"
                      >
                        <button
                          className="rounded p-0.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          onClick={() => hanldleEdit(item)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                    colSpan={5}
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    No Roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Logical Modals === */}
      {modalType === "createNew" && selectedEnquiryId !== null && (
        <CreateNewFollowUpOnEnquiryModal
          enquiryId={selectedEnquiryId}
          title="Create Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "complete" &&
        selectedFollowUpId !== null &&
        selectedEnquiryId !== null && (
          <CompleteFollowUpModal
            enquiryId={selectedEnquiryId}
            title="Complete Follow-Up"
            onClose={() => setModalType(null)}
          />
        )}

      {selectedId !== null && roleDetail === true && (
        <EditRolesForm onCloseModal={handleCloseModal} roleData={roleData} />
      )}
    </div>
  );
}