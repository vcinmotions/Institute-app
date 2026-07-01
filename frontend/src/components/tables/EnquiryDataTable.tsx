import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "@heroui/react";

// Components & UI Elements
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import TimelineDatatable from "@/app/(admin)/(ui-elements)/timeline/TimelineComponent";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";
import HoldEnquiryModal from "../form/form-elements/HoldEnquiryForm";
import LostEnquiryModal from "../form/form-elements/LostEnquiryForm";
import EditEnquiryForm from "../form/form-elements/EditEnquiryForm";

// Hooks & Redux Actions
import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";
import { addFollowUpsForEnquiry } from "@/store/slices/followUpSlice";
import ShowForRoles from "@/app/utils/ShowForRoles";
import { STATUS_COLOR_MAP } from "../common/BadgeStatus";
import { canEditEnquiry, canHoldEnquiry, canMarkLost, canMarkWon } from "@/domain/enquiry/rules";
import { formatDate } from "../common/Formatdate";
import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import { useRouter } from "next/navigation";

type FollowUpModalType =
  | "createNew"
  | "update"
  | "complete"
  | "hold"
  | "lost"
  | "editenquiry"
  | "timeline" // Added explicit timeline action type
  | null;

type EnquiryDataTableProps = {
  enquiries: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onLeadStatus: (field: string) => void;
};

export default function EnquiryDataTable({
  enquiries,
  loading,
  onSort,
  sortField,
  sortOrder,
}: EnquiryDataTableProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  // Local Component States
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null);

  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showCreateNextModal, setShowCreateNextModal] = useState(false);

  // TanStack React Query Hooks
  const { data: followupDetails, refetch: refetchFollowUps, isFetching } = useFetchFollowUps(selectedId);

  // Sync React Query cache data updates with UI state parameters
  useEffect(() => {
    // 🛡️ CRITICAL GUARD: Only evaluate timeline positioning if the user explicitly clicked "Follow-up"
    if (followupDetails && selectedId && modalType === "timeline") {
      const followUpsList = followupDetails.followup || [];

      dispatch(
        addFollowUpsForEnquiry({
          enquiryId: selectedId,
          followUps: followUpsList,
        })
      );

      if (followUpsList.length > 0) {
        setShowTimelineModal(true);
        setModalType(null); // Clear modal type string to avoid modal layering bugs
      } else {
        setShowTimelineModal(false);
        setModalType("createNew");
      }
    }
  }, [followupDetails, selectedId, modalType, dispatch]);

  // const handleFollowUp = useCallback(async (enquiryId: string) => {
  //   const currentEnquiry = enquiries.find((e) => e.id === enquiryId);
  //   setSelectedEnquiryData(currentEnquiry || null);

  //   setSelectedId(enquiryId);
  //   setSelectedEnquiryId(enquiryId);
  //   setModalType("timeline"); // Set intent explicitly to handle the follow-up flow

  //   setTimeout(() => {
  //     refetchFollowUps();
  //   }, 10);
  // }, [refetchFollowUps, enquiries]);

  // Unified cleanup sequence resetting tracking coordinates back to baseline values

  const handleCloseModal = () => {
    setModalType(null);
    setShowTimelineModal(false);
    setSelectedId(null);
    setSelectedEnquiryId(null);
    setSelectedEnquiryData(null);
  };

  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setShowCreateNextModal(true);
    refetchFollowUps();
  };

  const handleCompleteFollowUpHandler = (EnqiuryId: string) => {
    setSelectedEnquiryId(EnqiuryId);
    setModalType("complete");
  };

  const handleHoldEnquiryHandler = (EnqiuryId: string) => {
    setSelectedEnquiryId(EnqiuryId);
    setModalType("hold");
  };

  const handleLostEnquiryHandler = (EnqiuryId: string) => {
    setSelectedEnquiryId(EnqiuryId);
    setModalType("lost");
  };

  const handleEditEnquiry = (item: any) => {
    setSelectedEnquiryData(item);
    setModalType("editenquiry"); // Explicitly tell the system we are editing, not following up
    setSelectedId(null);         // Clear selectedId to prevent useFetchFollowUps hook from firing automatically
    setSelectedEnquiryId(item.id);
  };

  const handleFollowUp = useCallback((enquiryId: string) => {
    // Directly navigate to the timeline route page layout
    router.push(`/dashboard/enquiry/${enquiryId}/timeline`);
  }, [router]);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-full overflow-x-auto">
        <div className="max-h-[550px] min-w-[1102px] overflow-y-auto">
          <Table className="w-full border-collapse text-left">
            <TableHeader className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <TableRow>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sr No.</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Enquiries</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Course</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contact</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <button type="button" className="flex items-center gap-1 font-semibold uppercase hover:text-slate-700 dark:hover:text-slate-200" onClick={() => onSort("createdAt")}>
                    Enquiry Date
                    <span className="text-[9px] opacity-70">
                      {sortField !== "createdAt" ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </button>
                </TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    Status
                    <Tooltip className="rounded bg-slate-800 text-[10px] text-white px-2 py-0.5" content="WARM: Create Initial Follow-Up">
                      <span className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">🛈</span>
                    </Tooltip>
                  </span>
                </TableCell>
                <ShowForRoles allowedRoles={["ADMIN", "FACULTY"]}>
                  <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Follow-Up</TableCell>
                </ShowForRoles>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</TableCell>
                <TableCell isHeader className="h-9 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Edit</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-3 text-center text-xs text-slate-400">Loading master records...</TableCell>
                </TableRow>
              ) : enquiries && enquiries.length > 0 ? (
                enquiries.map((item: any) => {
                  const canWon = canMarkWon(item.leadStatus);
                  const canHold = canHoldEnquiry(item.leadStatus);
                  const canLost = canMarkLost(item.leadStatus);
                  const canEdit = canEditEnquiry(item.leadStatus);

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-400 dark:text-slate-500">{item.srNo}</TableCell>
                      <TableCell className="px-3 py-1.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 capitalize">{item.name}</span>
                          {item.email && <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">{item.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="space-y-0.5">
                          {item.enquiryCourse?.map((c: any, index: number) => (
                            <div key={index} className="truncate max-w-[150px]">{c.course?.name}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-400">{item.contact ?? "—"}</TableCell>
                      <TableCell className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(item.enquiryDate)}</TableCell>
                      <TableCell className="px-3 py-1.5">
                        <Badge size="sm" color={STATUS_COLOR_MAP[item.leadStatus] ?? "error"}>{item.leadStatus}</Badge>
                      </TableCell>
                      <ShowForRoles allowedRoles={["ADMIN", "FACULTY"]}>
                        <TableCell className="px-3 py-1.5">
                          <Button
                            onClick={() => handleFollowUp(item.id)}
                            disabled={isFetching && selectedId === item.id}
                            variant="nobg"
                            className="h-6 rounded-[4px] border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 dark:text-slate-50 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 hover:text-slate-900"
                          >
                            {isFetching && selectedId === item.id ? "Loading..." : "Follow-up"}
                          </Button>
                        </TableCell>
                      </ShowForRoles>

                      <TableCell className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <Tooltip isDisabled={!canWon} className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5" content="WON">
                            <button disabled={!canWon} className={`rounded p-0.5 transition ${!canWon ? "opacity-30 cursor-not-allowed text-slate-400" : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"}`} onClick={() => canWon && handleCompleteFollowUpHandler(item.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </button>
                          </Tooltip>

                          <Tooltip isDisabled={!canHold} className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5" content="HOLD">
                            <button disabled={!canHold} className={`rounded p-0.5 transition ${!canHold ? "opacity-30 cursor-not-allowed text-slate-400" : "text-amber-500 hover:bg-amber-50 dark:text-amber-400"}`} onClick={() => canHold && handleHoldEnquiryHandler(item.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </button>
                          </Tooltip>

                          <Tooltip isDisabled={!canLost} className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5" content="LOST">
                            <button disabled={!canLost} className={`rounded p-0.5 transition ${!canLost ? "opacity-30 cursor-not-allowed text-slate-400" : "text-rose-600 hover:bg-rose-50 dark:text-rose-400"}`} onClick={() => canLost && handleLostEnquiryHandler(item.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                          </Tooltip>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-1.5">
                        <Tooltip className="rounded bg-slate-800 text-[10px] text-white px-1.5 py-0.5" content="Edit Enquiry">
                          <button disabled={!canEdit} className={`rounded p-0.5 transition ${!canEdit ? "opacity-30 cursor-not-allowed text-slate-400" : "text-slate-500 hover:bg-slate-100"}`} onClick={() => canEdit && handleEditEnquiry(item)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">No Enquiries found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Render Timeline View Overlay */}
      {/* {showTimelineModal && (
        <TimelineDatatable
          onClose={handleCloseModal}
          followUpData={followupDetails}
          enquiryId={selectedEnquiryId || ""}
          enquiryData={selectedEnquiryData}
          onCreateFollowUpForFollowUp={handleCreateFollowUpForFollowUp}
        />
      )} */}

      {/* Form Action Routing Layer */}
      {modalType === "createNew" && selectedEnquiryId !== null && (
        <CreateNewFollowUpOnEnquiryModal
          enquiryId={selectedEnquiryId}
          title="Create Follow-Up"
          onClose={handleCloseModal}
        />
      )}
      {modalType === "editenquiry" && selectedEnquiryId !== null && (
        <EditEnquiryForm enquiryData={selectedEnquiryData} onCloseModal={handleCloseModal} />
      )}
      {modalType === "complete" && selectedEnquiryId !== null && (
        <CompleteFollowUpModal enquiryId={selectedEnquiryId} title="Complete Follow-Up" onClose={handleCloseModal} />
      )}
      {modalType === "hold" && selectedEnquiryId !== null && (
        <HoldEnquiryModal enquiryId={selectedEnquiryId} title="Hold Follow-Up" onClose={handleCloseModal} />
      )}
      {modalType === "lost" && selectedEnquiryId !== null && (
        <LostEnquiryModal enquiryId={selectedEnquiryId} title="Lost Follow-Up" onClose={handleCloseModal} />
      )}
    </div>
  );
}