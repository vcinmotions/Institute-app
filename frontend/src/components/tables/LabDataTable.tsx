import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";

import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/button/Button";
import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";
import TimelineDatatable from "@/app/(admin)/(ui-elements)/timeline/TimelineComponent";
import { useCreateAdmission } from "@/hooks/useCreateAdmission";

import { useDeleteEnquiry } from "@/hooks/useDeleteEnquiry";


import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";
import EnquiryDetails from "../ui/enquiry/EnquiryDetails";
import { addFollowUpsForEnquiry } from "@/store/slices/followUpSlice";
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";

import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import HoldEnquiryModal from "../form/form-elements/HoldEnquiryForm";
import LostEnquiryModal from "../form/form-elements/LostEnquiryForm";
import { RootState } from "@/store";
import EditLabForm from "../form/form-elements/EditLabForm";
import { useFetchLab } from "@/hooks/useFetchLab";

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
  onSort: (field: LabSortField) => void; // ✅ FIX
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
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const dispatch = useDispatch();
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [enquiryDetail, setEnquiryDetail] = useState(false);
  const [labDetail, setLabDetail] = useState(false);
  const [labData, setLabData] = useState<any>(null);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null); // You can strongly type this
  const [newEnquiry, setNewEnquiry] = React.useState({
    name: "",
    email: "",
    courseId: "",
    source: "",
    contact: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null,
  );
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
    null,
  );
  const { mutate: fetchLab, data } = useFetchLab();
  const { followupDetails, isLoading, isError, refetch } =
    useFollowUp(selectedId);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleExpanded = (lab: any) => {
    setExpandedRowId((prev) => (prev === lab.id ? null : lab.id));
  };


  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setModalType("update");
    refetch();
    console.log(
      "GetTing Follow Up Details After Creating Follow-Up Component Logic:",
      followupDetails,
    );
  };
  const handleCloseModal = () => {
    setSelectedId(null);
    setLabDetail(false);
  };


  const handleEditLab = (item: any) => {
    console.log("Get LAB ID to EDIt LAB", item.id);
    setSelectedId(item.id);
    setSelectedLabId(item.id);
    setLabDetail(true);
    setLabData(item);
  };

  console.log("get ModalType", modalType);
  console.log("get selectedEnquiryId", selectedEnquiryId);
  console.log("get selectedFollowUpId", selectedFollowUpId);
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
                  Labs
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Total Pcs
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("isActive")}
                  >
                    Status
                    <span>
                      {sortField === "isActive" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Admission
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
              {lab && lab.length > 0 ? (
                lab.map((item: any) => (
                  <React.Fragment key={item.id}>
                    <TableRow>
                      <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                              {item.name}
                            </span>
                            <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                              {item.createdAt}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                        {item.totalPCs}
                      </TableCell>
                      <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={item.isActive ? "error" : "primary"}
                        >
                          {item.isActive ? "HOT" : "COLD"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                        <Button
                          onClick={() => toggleExpanded(item)}
                          size="sm"
                          className="rounded bg-gray-800 px-4 py-2 text-sm text-white"
                        >
                          {expandedRowId === item.id ? "Hide" : "Show"}
                        </Button>
                      </TableCell>

                      <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                        <Button
                          onClick={() => handleEditLab(item)}
                          size="sm"
                          className="rounded bg-gray-800 px-4 py-2 text-sm text-white"
                        >
                          Edit Lab
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedRowId === item.id && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="bg-gray-50 px-6 py-5 text-sm text-gray-800 transition-all dark:bg-gray-900 dark:text-gray-200"
                        >
                          <div className="flex flex-col gap-4">
                            {/* Lab Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                  🧪 {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  📍 {item.location} • {item.totalPCs} PCs total
                                </p>
                              </div>

                              {item.isActive ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                                  Inactive
                                </span>
                              )}
                            </div>

                            {/* Time Slots Grid */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {item.timeSlots.map((slot: any) => {
                                const free = slot.availablePCs;
                                const total = slot.totalPCs;
                                const isFull = free === 0;
                                const isHalf = free <= total / 2 && free > 0; // 🟡 Yellow condition

                                let slotColor = "";
                                if (isFull) {
                                  slotColor =
                                    "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300";
                                } else if (isHalf) {
                                  slotColor =
                                    "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300";
                                } else {
                                  slotColor =
                                    "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300";
                                }

                                return (
                                  <div
                                    key={slot.id}
                                    className={`rounded-lg border p-3 text-xs font-medium shadow-sm transition-all ${slotColor}`}
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex justify-between">
                                        <span className="font-semibold">
                                          🕒 {slot.startTime}–{slot.endTime}
                                        </span>
                                        <span className="text-[10px] opacity-80">
                                          {slot.day}
                                        </span>
                                      </div>

                                      <div className="mt-1 flex items-center gap-1">
                                        {isFull ? (
                                          <span className="text-[11px] font-semibold">
                                            No PCs available ❌
                                          </span>
                                        ) : (
                                          <span className="text-[11px] font-semibold">
                                            {free}/{total} Available
                                          </span>
                                        )}
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
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                    colSpan={4}
                  >
                    No Lab found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Follow-Up Timeline modal === */}
      {showForm && followUpData && selectedId !== null && (
        <TimelineDatatable
          onClose={handleCloseModal} // Function to close timeline modal
          followUpData={followupDetails} // Pass follow-up data fetched from API
          enquiryId={selectedId} // Pass current enquiry ID (number, not null)
 
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
