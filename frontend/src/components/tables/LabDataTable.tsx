import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useDispatch } from "react-redux";
import Button from "../ui/button/Button";
import TimelineDatatable from "@/app/(admin)/(ui-elements)/timeline/TimelineComponent";
import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";
import EnquiryDetails from "../ui/enquiry/EnquiryDetails";
import HoldEnquiryModal from "../form/form-elements/HoldEnquiryForm";
import LostEnquiryModal from "../form/form-elements/LostEnquiryForm";
import EditLabForm from "../form/form-elements/EditLabForm";
import { useFetchLab } from "@/hooks/useFetchLab";
import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import { Tooltip } from "@heroui/react";

type LabSortField = "isActive";

type FollowUpModalType =
  | "createNew"
  | "update"
  | "complete"
  | "hold"
  | "lost"
  | null;

type LabDataTableProps = {
  lab: any[];
  courses: any[];
  loading: boolean;
  onSort: (field: LabSortField) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function LabDataTable({
  lab,
  courses,
  loading,
  onSort,
  sortField,
  sortOrder,
}: LabDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [enquiryDetail, setEnquiryDetail] = useState(false);
  const [labDetail, setLabDetail] = useState(false);
  const [labData, setLabData] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);

  const { mutate: fetchLab, data } = useFetchLab();
  const { followupDetails, refetch } = useFollowUp(selectedId);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleExpanded = (labItem: any) => {
    setExpandedRowId((prev) => (prev === labItem.id ? null : labItem.id));
  };

  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setModalType("update");
    refetch();
  };

  const handleCloseModal = () => {
    setSelectedId(null);
    setLabDetail(false);
  };

  const handleEditLab = (item: any) => {
    setSelectedId(item.id);
    setSelectedLabId(item.id);
    setLabDetail(true);
    setLabData(item);
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
                  Labs
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Pcs
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => onSort("isActive")}
                  >
                    Status
                    <span className="text-[9px] opacity-70">
                      {sortField !== "isActive" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Admission
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* High Density Data Cells */}
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {lab && lab.length > 0 ? (
                lab.map((item: any) => (
                  <React.Fragment key={item.id}>
                    <TableRow className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <TableCell className="px-3 py-1.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
                            {item.createdAt}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {item.totalPCs}
                      </TableCell>

                      <TableCell className="px-3 py-1.5">
                        <Badge
                          size="sm"
                          color={item.isActive ? "error" : "primary"}
                        >
                          {item.isActive ? "HOT" : "COLD"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-3 py-1.5">
                        <Button
                          onClick={() => toggleExpanded(item)}
                          size="sm"
                          className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {expandedRowId === item.id ? "Hide" : "Show"}
                        </Button>
                      </TableCell>

                      <TableCell className="px-3 py-1.5">
                        <Tooltip className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5" content="Edit Lab">
                          <button
                            className="rounded p-0.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                            onClick={() => handleEditLab(item)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Content Sub-Table Layout */}
                    {expandedRowId === item.id && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="bg-slate-50/50 p-3 text-xs text-slate-800 dark:bg-slate-900/30 dark:text-slate-200"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 dark:border-slate-800">
                              <div>
                                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                                  🧪 {item.name}
                                </h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  📍 {item.location} • {item.totalPCs} PCs total
                                </p>
                              </div>
                              {item.isActive ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                                  Inactive
                                </span>
                              )}
                            </div>

                            {/* Time Slots Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                              {item.timeSlots?.map((slot: any) => {
                                const free = slot.availablePCs;
                                const total = slot.totalPCs;
                                const isFull = free === 0;
                                const isHalf = free <= total / 2 && free > 0;

                                let slotColor = "";
                                if (isFull) {
                                  slotColor = "bg-rose-50/60 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400";
                                } else if (isHalf) {
                                  slotColor = "bg-amber-50/60 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400";
                                } else {
                                  slotColor = "bg-emerald-50/60 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400";
                                }

                                return (
                                  <div
                                    key={slot.id}
                                    className={`rounded border p-2 text-[11px] shadow-sm transition-all ${slotColor}`}
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex justify-between font-medium">
                                        <span>🕒 {slot.startTime}–{slot.endTime}</span>
                                        <span className="text-[9px] opacity-70">{slot.day}</span>
                                      </div>
                                      <div className="mt-0.5 font-semibold">
                                        {isFull ? "No PCs available ❌" : `${free}/${total} Available`}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                    colSpan={5}
                  >
                    No Lab found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Modals Unchanged for Logical Flow Integrity === */}
      {showForm && followUpData && selectedId !== null && (
        <TimelineDatatable
          onClose={handleCloseModal}
          followUpData={followupDetails}
          enquiryId={selectedId}
          onCreateFollowUpForFollowUp={handleCreateFollowUpForFollowUp}
        />
      )}

      {modalType === "createNew" && selectedEnquiryId !== null && (
        <CreateNewFollowUpOnEnquiryModal
          enquiryId={selectedEnquiryId}
          title="Create Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "complete" && selectedEnquiryId !== null && (
        <CompleteFollowUpModal
          enquiryId={selectedEnquiryId}
          title="Complete Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "hold" && selectedEnquiryId !== null && (
        <HoldEnquiryModal
          enquiryId={selectedEnquiryId}
          title="hold Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "lost" && selectedEnquiryId !== null && (
        <LostEnquiryModal
          enquiryId={selectedEnquiryId}
          title="lost Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {selectedId !== null && enquiryDetail === true && (
        <EnquiryDetails onClose={handleCloseModal} enquiryId={selectedId} />
      )}

      {selectedLabId !== null && labDetail === true && (
        <EditLabForm onCloseModal={handleCloseModal} labData={labData} />
      )}
    </div>
  );
}