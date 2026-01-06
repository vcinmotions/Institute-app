"use client";
import React, { useState, useEffect } from "react";
import ModalCard from "@/components/common/ModalCard";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useFollowUp } from "@/hooks/useQueryFetchFollow";
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
  const fineEnquiryById = enquiries.find(
    (data: { id: any | null }) => data.id === enquiryId,
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
        <div className="mb-4 h-max rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
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
        </div>

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
            <ul className="timeline timeline-vertical sm:ml-[-160px] lg:ml-[-200px]">
              <li>
                <div className="timeline-middle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className="h-5 w-5 fill-gray-700 dark:fill-white"
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
                <div className="timeline-end flex flex-col items-start justify-center rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {/* Remark / Title */}
                  {/* <p className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                    {firstItem.remark}
                  </p> */}

                  <div className="flex justify-between gap-4">
                      <p className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                        {firstItem.remark}
                      </p>

                      <button className="mb-2"><PencilIcon onClick={() => handleEditFollowUpForFollowUp(firstItem.id)} /></button>
                      </div>

                  {/* Status Badge */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Status:
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        firstItem.followUpStatus.toLowerCase() === "pending"
                          ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                          : firstItem.followUpStatus.toLowerCase() ===
                              "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                            : firstItem.followUpStatus.toLowerCase() ===
                                "missed"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
                              : ""
                      }`}
                    >
                      {firstItem.followUpStatus}
                    </span>
                  </div>

                  {/* Scheduled At */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Scheduled at:</span>{" "}
                    {new Date(firstItem.scheduledAt).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>

                  {/* Scheduled At */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Done at:</span>{" "}
                    {formatDate(firstItem.doneAt)}
                  </div>
                </div>

                <hr />
              </li>

              {middleItems.map((item: any, index: number) => {
                return (
                  <li key={item.id || index}>
                    <hr />
                    <div className="timeline-middle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        className="h-5 w-5 fill-gray-700 dark:fill-white"
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
                    <div className="timeline-end flex flex-col items-start justify-center rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {/* Remark / Title */}
                      <div className="flex justify-between gap-4">
                      <p className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                        {item.remark}
                      </p>

                      <button className="mb-2"><PencilIcon onClick={() => handleEditFollowUpForFollowUp(item.id)} /></button>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Status:
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.followUpStatus.toLowerCase() === "pending"
                              ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                              : item.followUpStatus.toLowerCase() ===
                                  "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
                          }`}
                        >
                          {item.followUpStatus}
                        </span>
                      </div>

                      {/* Scheduled At */}
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Scheduled at:</span>{" "}
                        {new Date(item.scheduledAt).toLocaleString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>

                      {/* Scheduled At */}
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">Done at:</span>{" "}
                                            {formatDate(item.doneAt)}

                      </div>
                    </div>

                    <hr />
                  </li>
                );
              })}

              {followups.length > 1 && (
                <li>
                  <hr />
                  <div className="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      className="h-5 w-5 fill-gray-700 dark:fill-white"
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
                  <div className="timeline-end flex flex-col items-start justify-center rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {/* Remark / Title */}
                    <div className="flex justify-between items-centre gap-4">
                    <p className="mb-2 text-base font-semibold text-gray-800 dark:text-white">
                      {lastItem.remark}
                    </p>

                    <button className="mb-2"><PencilIcon onClick={() => handleEditFollowUpForFollowUp(lastItem.id)} /></button>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Status:
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          lastItem.followUpStatus.toLowerCase() === "pending"
                            ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                            : lastItem.followUpStatus.toLowerCase() ===
                                "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
                        }`}
                      >
                        {lastItem.followUpStatus}
                      </span>
                    </div>

                    {/* Done At */}
                    {lastItem.followUpStatus !== "COMPLETED" && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">scheduled at:</span>{" "}
                        {new Date(lastItem.scheduledAt).toLocaleString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </div>
                    )}

                    {/* Done At */}
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">Done at:</span>{" "}
                                                                  {formatDate(lastItem.doneAt)}

                    </div>
                  </div>
                </li>
              )}
              {/* 🎯 Render buttons only if follow-up is NOT completed */}
              {lastItem.followUpStatus !== "COMPLETED" && (
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-black transition hover:bg-gray-100"
                    onClick={() => handleCreateFollowUpForFollowUp(lastItem.id)} // just call the prop here
                  >
                    Create Next Follow-Up
                  </button>
                  {/* <button
                    className="rounded bg-gray-800 px-4 py-2 text-white text-sm hover:bg-gray-900 transition"
                    onClick={() => onCompleteFollowUp(lastItem.id)}
                    >
                    Complete Follow-Up
                    </button> */}
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
