"use client";

import React, { useMemo, useState } from "react";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import CreateFollowUpModal from "@/components/form/form-elements/CreateFollowUpModal";
import EditFollowUpModal from "@/components/form/form-elements/EditFollowUpModal";

import { PencilIcon } from "@/icons";
import { canEditFollowUp } from "@/domain/enquiry/rules";
import {
  showCompletedFollowUpIcon,
  showMissedFollowUpIcon,
  showPendingFollowUpIcon,
} from "@/domain/follow-up/rules";
import { formatDate } from "@/components/common/Formatdate";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useFetchEnquiryById } from "@/hooks/queries/useQueryFetchEnquiry";
import CreateNewFollowUpOnEnquiryModal from "@/components/form/form-elements/CreateNewFollowUpOnEnquiry";

interface TimelineDatatableProps {
  enquiryId: string;
}

export default function TimelineDatatable({ enquiryId }: TimelineDatatableProps) {
  // 1. Redux state access
  const { enquiries } = useSelector((state: RootState) => state.enquiry);

  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);
  const [showCreateNextModal, setShowCreateNextModal] = useState(false);
  const [showEditNextModal, setShowEditNextModal] = useState(false);
  const [showInitialCreateModal, setShowInitialCreateModal] = useState(false); // Modal control overlay for initial WARM leads

  // 2. TanStack Query: Fetch timeline lifecycle actions
  const { followupDetails, refetch, isLoading: isTimelineLoading } = useFollowUp(enquiryId);

  // 3. TanStack Query: Fetch real-time fallback data
  const reduxEnquiry = useMemo(() => {
    return enquiries.find((e) => e.id === enquiryId);
  }, [enquiries, enquiryId]);

  const { data: apiEnquiry, isLoading: isEnquiryLoading } = useFetchEnquiryById(enquiryId);

  // Combine data sources seamlessly (Prioritize real-time hook data over store snapshots)
  const fineEnquiryById = useMemo(() => {
    return apiEnquiry?.enquiry || apiEnquiry || reduxEnquiry;
  }, [apiEnquiry, reduxEnquiry]);

  const followups = useMemo(() => {
    const rawList = followupDetails?.followup || [];
    return [...rawList].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [followupDetails]);

  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setShowCreateNextModal(true);
  };

  const handleEditFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setShowEditNextModal(true);
  };

  const getStatusColor = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50";
    if (s === "completed") return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
    if (s === "missed") return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
    return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  };

  // Centralized full-page loading skeleton
  if ((isTimelineLoading || isEnquiryLoading) && !followups.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <span className="text-sm text-gray-500">Loading timeline and master profile info...</span>
      </div>
    );
  }

  const lastItem = followups[followups.length - 1];

  // CRITICAL STATUS CHECKS
  const isEnquiryClosed = fineEnquiryById?.leadStatus === "WON" || fineEnquiryById?.leadStatus === "LOST";
  const isEnquiryWarm = fineEnquiryById?.leadStatus === "WARM";

  return (
    <div>
      <PageBreadcrumb pageTitle="Enquiry " />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header Description */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">
              Follow Up
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
              Define the automated sequence and format for new enquiry follow up.
            </p>
          </div>

          {/* ENQUIRY SUMMARY DASHBOARD */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center dark:border-gray-800">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {fineEnquiryById?.name || "Unknown Lead"}
                </h4>
                <p className="text-sm text-gray-500">ID: {fineEnquiryById?.srNo || "—"}</p>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${fineEnquiryById?.leadStatus === "WON" ? "bg-green-50 text-green-700 border-green-200" : fineEnquiryById?.leadStatus === "LOST" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                  {fineEnquiryById?.leadStatus === "WON" ? "Converted (WON)" : fineEnquiryById?.leadStatus === "LOST" ? "Dropped (LOST)" : `Active Lead (${fineEnquiryById?.leadStatus || "WARM"})`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Contact</span>
                <span className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{fineEnquiryById?.contact || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Email</span>
                <span className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{fineEnquiryById?.email || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Source</span>
                <span className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {typeof fineEnquiryById?.source === "object" && fineEnquiryById?.source !== null
                    ? fineEnquiryById.source.name || fineEnquiryById.source.slug || "—"
                    : fineEnquiryById?.source || "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Location</span>
                <span className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{fineEnquiryById?.location || "—"}</span>
              </div>
            </div>

            {/* Courses Tags */}
            <div className="mt-6 flex flex-col">
              <span className="mb-2 text-xs text-gray-500">Interested Courses</span>
              <div className="flex flex-wrap gap-2">
                {fineEnquiryById?.enquiryCourse?.length ? (
                  fineEnquiryById.enquiryCourse.map((cr: any, index: number) => (
                    <span
                      key={index}
                      className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {cr.course?.name || "Selected Course"}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>

          {/* VERTICAL TIMELINE */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <h4 className="mb-8 text-base font-semibold text-gray-900 dark:text-white">
              Follow-Up Timeline
            </h4>

            {!followups.length ? (
              <div className="py-6 text-center text-sm text-gray-500">
                <p>No history timeline details available for this enquiry.</p>

                {/* Show Initial Action if status is WARM and timeline is empty */}
                {isEnquiryWarm && (
                  <div className="mt-8 flex justify-end border-t border-gray-100 pt-6 dark:border-gray-800">
                    <button
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
                      onClick={() => setShowInitialCreateModal(true)}
                    >
                      + Create Initial Follow-Up
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative ml-4 border-l-2 border-gray-100 dark:border-gray-800">
                {followups.map((item: any, index: number) => (
                  <div key={item.id || index} className="relative mb-8 last:mb-0 ml-8">
                    <span className="absolute -left-[49px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-gray-900 dark:ring-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-4 w-4 fill-gray-600 dark:fill-gray-300">
                        {showPendingFollowUpIcon(item.followUpStatus) && (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9.75a.75.75 0 01.75.75v4.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0-2.25a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        )}
                        {showCompletedFollowUpIcon(item.followUpStatus) && (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        )}
                        {showMissedFollowUpIcon(item.followUpStatus) && (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 8.53 7.47a.75.75 0 00-1.06 1.06L8.94 10l-1.47 1.47a.75.75 0 101.06 1.06L10 11.06l1.47 1.47a.75.75 0 101.06-1.06L11.06 10l1.47-1.47z" clipRule="evenodd" />
                        )}
                      </svg>
                    </span>

                    <div className="group rounded-xl border border-gray-100 bg-gray-50/50 p-5 transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/20 dark:hover:bg-gray-800/40">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-3">
                            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.followUpStatus)}`}>
                              {item.followUpStatus}
                            </span>
                            {item.followUpStatus !== "COMPLETED" && (
                              <span className="text-xs text-gray-500">
                                Scheduled: <span className="font-medium text-gray-900 dark:text-gray-300">{formatDate(item.scheduledAt) || "—"}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize mt-2">
                            {item.remark || "No remarks provided"}
                          </h4>
                          {item.followUpStatus === "COMPLETED" && (
                            <span className="mt-2 block text-xs text-gray-500">
                              Completed on: <span className="font-medium text-gray-900 dark:text-gray-300">{formatDate(item.doneAt) || "—"}</span>
                            </span>
                          )}
                        </div>

                        {!isEnquiryClosed && canEditFollowUp(fineEnquiryById?.leadStatus) && (
                          <button
                            onClick={() => handleEditFollowUpForFollowUp(item.id)}
                            className="rounded-md p-2 text-gray-400 opacity-0 transition-all hover:bg-white hover:text-blue-600 hover:shadow-sm group-hover:opacity-100 dark:hover:bg-gray-700"
                            title="Edit Follow-up"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hides sequence append buttons completely if status is WON or LOST */}
            {followups.length > 0 && !isEnquiryClosed && lastItem?.followUpStatus !== "COMPLETED" && (
              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6 dark:border-gray-800">
                <button
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-sm"
                  onClick={() => handleCreateFollowUpForFollowUp(lastItem.id)}
                >
                  + Create Next Follow-Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INITIAL WARM INTAKE ACTIONS OVERLAY MAP */}
      {showInitialCreateModal && (
        <CreateNewFollowUpOnEnquiryModal
          enquiryId={enquiryId}
          title="Create Follow-Up"
          onClose={() => setShowInitialCreateModal(false)}
          onSuccess={async () => {
            // ✅ Explicitly forces TanStack Query to synchronize UI views immediately
            refetch();
          }}
        />
      )}

      {/* SUB-FORM ACTION MODALS */}
      {showCreateNextModal && selectedFollowUpId !== null && (
        <CreateFollowUpModal
          enquiryId={enquiryId}
          followUpId={selectedFollowUpId}
          title="Create Next Follow-Up"
          onClose={() => setShowCreateNextModal(false)}
          onSuccess={async () => {
            refetch();
          }}
        />
      )}

      {showEditNextModal && selectedFollowUpId !== null && (
        <EditFollowUpModal
          enquiryId={enquiryId}
          followUpId={selectedFollowUpId}
          title="Edit Follow-Up"
          onClose={() => setShowEditNextModal(false)}
          onSuccess={async () => {
            refetch();
          }}
        />
      )}
    </div>
  );
}