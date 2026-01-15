"use client";
import React, { useState, useEffect } from "react";
import ModalCard from "@/components/common/ModalCard";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import CreateFollowUpModal from "@/components/form/form-elements/CreateFollowUpModal";
import { PencilIcon } from "@/icons";
import EditFollowUpModal from "@/components/form/form-elements/EditFollowUpModal";
interface TimelineDatatableProps {
  onClose: () => void;
  followUpData: any;
  enquiryId: string;
  onCreateFollowUpForFollowUp: (followUpId: string) => void;
}

export default function TimelineDatatable({
  onClose,
  followUpData,
  enquiryId,
  onCreateFollowUpForFollowUp,
}: TimelineDatatableProps) {
  const options = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "indeed", label: "Indeed" },
    { value: "instagram", label: "Instagram" },
    { value: "other", label: "Other" },
  ];
  const [triggered, setTriggered] = useState(false);
  const { enquiries, loading } = useSelector(
    (state: RootState) => state.enquiry,
  );
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
      null,
    );
    const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
      null,
    );
    const [showCreateNextModal, setShowCreateNextModal] = useState(false);
    const [showEditNextModal, setShowEditNextModal] = useState(false);
    
  //const followups = followUpsByEnquiry[enquiryId] || [];
  const { followupDetails, isLoading, refetch } = useFollowUp(enquiryId);

  const refetchFollowup = () => {
    refetch();
  }

  console.log("get Enquiry data in tmeline", enquiries);
  // const fineEnquiryById = enquiries.find(
  //   (data: { id: any | null }) => data.id === enquiryId,
  // );

  const fineEnquiryById = React.useMemo(
    () => enquiries.find(e => e.id === enquiryId),
    [enquiries, enquiryId]
  );

  console.log("get Enquiry data in tmeline bt Id", fineEnquiryById);
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  console.log("get UPDATED Folow Up data in tmeline", followUpData);
  console.log(
    "get UPDATED Folow Up data in tmeline by using UseQuery:",
    followupDetails,
  );

  //   const followups = followUpData?.followup ?? [];

  // const followups = (followUpData?.followup ?? [])
  // .sort(
  //     (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  // );

  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setSelectedEnquiryId(enquiryId)
    setShowCreateNextModal(true)
    console.log(
      "GetTing Follow Up Details After Creating Follow-Up Component Logic:",
      followupDetails,
    );
  };

    const handleEditFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setSelectedEnquiryId(enquiryId)
    setShowEditNextModal(true)

  };

  console.log("get Folow Up data in tmeline", followupDetails);

  // const followups = followUpData?.followup ?? [];

  // const followups = (followUpData?.followup ?? []).sort(
  //     (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt  ).getTime()
  // );

  // const followups = [...(followUpsByEnquiry[enquiryId] || [])].sort(
  //   (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  // );

  const followups = [...(followupDetails?.followup || [])].sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // useEffect(() => {
  //   setTriggered(false)
  // }, [enquiryId]); // allows the state to reset for modal to reopen.

  // useEffect(() => {
  //   if (followups.length === 0 && enquiryId !== null && !triggered) {
  //     onCreateFollowUpForEnquiry(enquiryId);
  //     setTriggered(true);  // prevent repeated calls
  //   }
  // }, [followups, enquiryId, onCreateFollowUpForEnquiry, triggered]);

  if (!followups.length) return null;

  // Separate first, middle, last
  const firstItem = followups[0];
  const lastItem = followups[followups.length - 1];
  const middleItems = followups.slice(1, -1);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  console.log("get middle follow up", middleItems);
  console.log("get last follow up", lastItem?.id);

  return (
    <ModalCard title="Follow-Up " oncloseModal={onClose}>
      <div>
        {/* <PageBreadcrumb pageTitle="Blank Page" /> */}
        {/* <div className="mb-4 h-max rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto w-full max-w-[900px] text-center">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              Enquiry Details
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-800 dark:text-white/90">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-2 pr-2 text-xs text-gray-500 dark:text-gray-400">
                      First Name
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {fineEnquiryById?.name}
                    </td>
                    <td className="py-2 pr-2 text-xs text-gray-500 dark:text-gray-400">
                      Admission
                    </td>
                    <td className="py-2 font-medium">
                      {fineEnquiryById?.isConverted === false ? "Nil" : "Done"}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pr-2 text-xs text-gray-500 dark:text-gray-400">
                      Email Address
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {fineEnquiryById?.email ? fineEnquiryById?.email : "-"}
                    </td>
                    <td className="py-2 pr-2 text-xs text-gray-500 dark:text-gray-400">
                      Phone
                    </td>
                    <td className="py-2 font-medium">
                      {" "}
                      +91 {fineEnquiryById?.contact}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 pr-2 text-xs text-gray-500 dark:text-gray-400">
                      Course
                    </td>
                    <td className="py-2 pr-4 font-medium">
                      {fineEnquiryById?.enquiryCourse.map((cr: any, index: number) => (
                        <span key={index}>{cr.course?.name}</span>
                      ))}
                    </td>
                    <td className="py-2 pr-2 text-xs text-gray-500 dark:text-gray-400">
                      Source
                    </td>
                    <td className="py-2 font-medium">
                      {fineEnquiryById?.source ? fineEnquiryById?.source : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> */}

       <div className="mb-6 rounded-3xl border border-gray-200/60 bg-white px-8 py-10 shadow-sm dark:border-gray-800/60 dark:bg-white/[0.02]">
        <h4 className="mb-6 text-center text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Enquiry Details
        </h4>

        <div className="relative mx-auto max-w-4xl">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-700" />

          {/* ===== BASIC DETAILS ===== */}
          <div className="relative mb-14 flex gap-8">
            {/* Step Indicator */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white dark:bg-white dark:text-gray-900">
              1
            </div>

            {/* Card */}
            <div className="w-full rounded-3xl bg-gray-50/80 p-7 ring-1 ring-gray-200/60 dark:bg-gray-900/40 dark:ring-gray-700/60">
              <h5 className="mb-6 text-base font-semibold text-gray-900 dark:text-white">
                Basic Details
              </h5>

              <div className="grid grid-cols-1 gap-x-10 gap-y-4 text-sm sm:grid-cols-2">
                {[
                  ["Enquiry ID", fineEnquiryById?.srNo],
                  ["Name", fineEnquiryById?.name],
                  ["Email", fineEnquiryById?.email || "-"],
                  ["DOB", fineEnquiryById?.dob?.split("T")[0]],
                  ["Contact", ` ${fineEnquiryById?.contact}`],
                  ["Alternate", ` ${fineEnquiryById?.alternateContact}`],
                  ["Gender", fineEnquiryById?.gender || "-"],
                  ["Location", fineEnquiryById?.location || "-"],
                  ["Source", fineEnquiryById?.source || "-"],
                  ["Referred By", fineEnquiryById?.referedBy || "-"],
                ].map(([label, value], idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs font-medium tracking-wide text-gray-500">
                      {label}
                    </span>
                    <span className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                      {value}
                    </span>
                  </div>
                ))}

                {/* Follow-up Status */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Follow-Up Status
                  </span>
                  <span
                    className={`mt-1 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      fineEnquiryById?.leadStatus === "WON"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {fineEnquiryById?.leadStatus === "WON" ? "Completed" : "Pending"}
                  </span>
                </div>

                {/* Conversion Status */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Conversion Status
                  </span>
                  <span
                    className={`mt-1 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      fineEnquiryById?.isConverted
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {fineEnquiryById?.isConverted ? "Done" : "Nil"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== COURSE DETAILS ===== */}
          <div className="relative flex gap-8">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white dark:bg-white dark:text-gray-900">
              2
            </div>

            <div className="w-full rounded-3xl bg-gray-50/80 p-7 ring-1 ring-gray-200/60 dark:bg-gray-900/40 dark:ring-gray-700/60">
              <h5 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                Courses Interested
              </h5>

              <div className="flex flex-wrap gap-2">
                {fineEnquiryById?.enquiryCourse?.length ? (
                  fineEnquiryById.enquiryCourse.map((cr: any, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-gray-900 capitalize"
                    >
                      {cr.course?.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* ===== FOLLOW-UP & ASSIGNMENT ===== */}
            {/* <div className="relative mb-10 flex gap-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white font-semibold">
                3
              </div>

              <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                <h5 className="mb-4 font-semibold text-gray-800 dark:text-white">
                  Follow-up & Assignment
                </h5>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <p><span className="text-gray-500">Assigned To:</span> {fineEnquiryById?.assignedTo?.name || "-"}</p>
                  <p><span className="text-gray-500">Follow-up Date:</span> {fineEnquiryById?.followUpDate
                    ? new Date(fineEnquiryById.followUpDate).toLocaleDateString()
                    : "-"}</p>
                  <p><span className="text-gray-500">Created At:</span> {new Date(fineEnquiryById?.createdAt).toLocaleString()}</p>
                  <p><span className="text-gray-500">Last Updated:</span> {new Date(fineEnquiryById?.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div> */}

            {/* ===== REMARKS ===== */}
            {/* <div className="relative flex gap-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white font-semibold">
                4
              </div>

              <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                <h5 className="mb-4 font-semibold text-gray-800 dark:text-white">
                  Remarks / Notes
                </h5>

                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {fineEnquiryById?.remarks || "No remarks added."}
                </p>
              </div>
            </div> */}
          {/* </div>
        </div> */}


        {/* <path
  fillRule="evenodd"
  d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 8.53 7.47a.75.75 0 00-1.06 1.06L8.94 10l-1.47 1.47a.75.75 0 101.06 1.06L10 11.06l1.47 1.47a.75.75 0 101.06-1.06L11.06 10l1.47-1.47z"
  clipRule="evenodd"
/> */}

        <div className="h-max rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto w-full max-w-[630px] text-center">
            <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
              Follow-Up Timeline
            </h4>
            <ul className="timeline timeline-vertical w-full sm:ml-[-160px] lg:ml-[-150px]">
              <li>
                <div className="timeline-middle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className="h-5 w-5 fill-gray-700 dark:fill-gray-50"
                  >
                    {firstItem.followUpStatus === "PENDING" && (
                      // ⏳ Pending Icon (Inverted i)
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9.75a.75.75 0 01.75.75v4.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0-2.25a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    )}

                    {firstItem.followUpStatus === "COMPLETED" && (
                      // ✅ Complete Icon (Checkmark)
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    )}

                    {firstItem.followUpStatus === "MISSED" && (
                      // ❌ Missed Icon (X inside circle)
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 8.53 7.47a.75.75 0 00-1.06 1.06L8.94 10l-1.47 1.47a.75.75 0 101.06 1.06L10 11.06l1.47 1.47a.75.75 0 101.06-1.06L11.06 10l1.47-1.47z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                </div>
                {/* <div className="timeline-end timeline-box">First Macintosh computer</div> */}
                 <div className="timeline-end w-full max-w-none rounded-3xl bg-white/90 p-6 ring-1 ring-gray-200/60 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-900/40 dark:ring-gray-700/60">
                  {/* Header */}
                  <div className="mb-2 flex w-full items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white capitalize">
                      {firstItem.remark}
                    </h4>

                    {fineEnquiryById?.leadStatus !== "WON" && fineEnquiryById?.leadStatus !== "LOST" && <button
                      onClick={() => handleEditFollowUpForFollowUp(firstItem.id)}
                      className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                      aria-label="Edit follow-up"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>}
                  </div>

                  {/* Status */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">:</span>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        firstItem.followUpStatus.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : firstItem.followUpStatus.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : firstItem.followUpStatus.toLowerCase() === "missed"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {firstItem.followUpStatus}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">Scheduled</span>
                      <span>:</span>
                      <span>
                        {formatDate(firstItem.scheduledAt) || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">Completed</span>
                      <span>:</span>
                      <span>{formatDate(firstItem.doneAt) || "—"}</span>
                    </div>
                  </div>
                </div>
                <hr className="dark:bg-gray-400" />
              </li>

              {middleItems.map((item: any, index: number) => {
                return (
                  <li key={item.id || index}>
                    <hr className="dark:bg-gray-400" />
                    <div className="timeline-middle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        className="h-5 w-5 fill-gray-700 dark:fill-gray-50"
                      >
                        {item.followUpStatus === "PENDING" && (
                          // ⏳ Pending Icon (Inverted i)
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9.75a.75.75 0 01.75.75v4.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0-2.25a1 1 0 100 2 1 1 0 000-2z"
                            clipRule="evenodd"
                          />
                        )}

                        {item.followUpStatus === "COMPLETED" && (
                          // ✅ Complete Icon (Checkmark)
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        )}

                        {item.followUpStatus === "MISSED" && (
                          // ❌ Missed Icon (X inside circle)
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 8.53 7.47a.75.75 0 00-1.06 1.06L8.94 10l-1.47 1.47a.75.75 0 101.06 1.06L10 11.06l1.47 1.47a.75.75 0 101.06-1.06L11.06 10l1.47-1.47z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </div>
                     <div className="timeline-end w-full max-w-none rounded-3xl bg-white/90 p-6 ring-1 ring-gray-200/60 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-900/40 dark:ring-gray-700/60">
                        {/* Header */}
                        <div className="mb-2 flex w-full items-center justify-between gap-4">
                          <h4 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white capitalize">
                            {item.remark}
                          </h4>

                        {fineEnquiryById?.leadStatus !== "WON" && fineEnquiryById?.leadStatus !== "LOST" &&
                          <button
                            onClick={() => handleEditFollowUpForFollowUp(item.id)}
                            className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                            aria-label="Edit follow-up"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        }
                        </div>

                        {/* Status */}
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Status
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">:</span>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              item.followUpStatus.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : item.followUpStatus.toLowerCase() === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : item.followUpStatus.toLowerCase() === "missed"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {item.followUpStatus}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500">Scheduled</span>
                            <span>:</span>
                            <span>{formatDate(item.scheduledAt) || "—"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500">Completed</span>
                            <span>:</span>
                            <span>{formatDate(item.doneAt) || "—"}</span>
                          </div>
                        </div>
                      </div>

                    <hr className="dark:bg-gray-400" />
                  </li>
                );
              })}

              {followups.length > 1 && (
                <li>
                  <hr className="dark:bg-gray-400" />
                  <div className="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      className="h-5 w-5 fill-gray-700 dark:fill-gray-50"
                    >
                      {lastItem.followUpStatus === "PENDING" && (
                        // ⏳ Pending Icon (Inverted i)
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9.75a.75.75 0 01.75.75v4.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0-2.25a1 1 0 100 2 1 1 0 000-2z"
                          clipRule="evenodd"
                        />
                      )}

                      {lastItem.followUpStatus === "COMPLETED" && (
                        // ✅ Complete Icon (Checkmark)
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      )}

                      {lastItem.followUpStatus === "MISSED" && (
                        // ❌ Missed Icon (X inside circle)
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 8.53 7.47a.75.75 0 00-1.06 1.06L8.94 10l-1.47 1.47a.75.75 0 101.06 1.06L10 11.06l1.47 1.47a.75.75 0 101.06-1.06L11.06 10l1.47-1.47z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                  </div>
                   <div className="timeline-end w-full max-w-none rounded-3xl bg-white/90 p-6 ring-1 ring-gray-200/60 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-900/40 dark:ring-gray-700/60">
                      {/* Header */}
                      <div className="mb-2 flex w-full items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white capitalize">
                          {lastItem.remark}
                        </h4>

                      {fineEnquiryById?.leadStatus !== "WON" && fineEnquiryById?.leadStatus !== "LOST" &&
                        <button
                          onClick={() => handleEditFollowUpForFollowUp(lastItem.id)}
                          className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                          aria-label="Edit follow-up"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      }
                      </div>

                      {/* Status */}
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Status
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">:</span>

                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            lastItem.followUpStatus.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : lastItem.followUpStatus.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : lastItem.followUpStatus.toLowerCase() === "missed"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {lastItem.followUpStatus}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        {lastItem.followUpStatus !== "COMPLETED" && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500">Scheduled</span>
                            <span>:</span>
                            <span>{formatDate(lastItem.scheduledAt) || "—"}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500">Completed</span>
                          <span>:</span>
                          <span>{formatDate(lastItem.doneAt) || "—"}</span>
                        </div>
                      </div>
                    </div>
                </li>
              )}
              {/* 🎯 Render buttons only if follow-up is NOT completed */}
              {/* {lastItem.followUpStatus !== "COMPLETED" && (
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-black transition hover:bg-gray-100"
                    onClick={() => handleCreateFollowUpForFollowUp(lastItem.id)} // just call the prop here
                  >
                    Create Next Follow-Up
                  </button>
                </div>
              )} */}
              {/* 🎯 Render button only if follow-up is NOT completed AND enquiry is NOT LOST */}
              {lastItem.followUpStatus !== "COMPLETED" &&
                fineEnquiryById?.leadStatus !== "LOST" && (
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-black transition hover:bg-gray-100"
                      onClick={() => handleCreateFollowUpForFollowUp(lastItem.id)}
                    >
                      Create Next Follow-Up
                    </button>
                  </div>
              )}          
            </ul>
          </div>
        </div>
         {showCreateNextModal &&
                selectedFollowUpId !== null &&
                selectedEnquiryId !== null && (
                  <CreateFollowUpModal
                    enquiryId={selectedEnquiryId}
                    followUpId={selectedFollowUpId}
                    title="Create Next Follow-Up"
                    onClose={() => setShowCreateNextModal(false)} // only closes child
                    onSuccess={async () => {
                      refetchFollowup(); // wait for new follow-ups
                      console.log("Updated follow-ups after refetch:", followupDetails);
                    }}
                  />
                )}

                 {showEditNextModal &&
                selectedFollowUpId !== null &&
                selectedEnquiryId !== null && (
                  <EditFollowUpModal
                    enquiryId={selectedEnquiryId}
                    followUpId={selectedFollowUpId}
                    title="Edit Follow-Up"
                    onClose={() => setShowEditNextModal(false)} // only closes child
                    onSuccess={async () => {
                      refetchFollowup(); // wait for new follow-ups
                      console.log("Updated follow-ups after refetch:", followupDetails);
                    }}
                  />
                )}
      </div>
    </ModalCard>
  );
}
