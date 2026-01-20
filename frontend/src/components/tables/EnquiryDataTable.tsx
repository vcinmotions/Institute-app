import React, { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { useDispatch } from "react-redux";
import Button from "../ui/button/Button";
import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";
import TimelineDatatable from "@/app/(admin)/(ui-elements)/timeline/TimelineComponent";

import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";

import { addFollowUpsForEnquiry } from "@/store/slices/followUpSlice";
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";

import { useFollowUp } from "@/hooks/queries/useQueryFetchFollow";
import HoldEnquiryModal from "../form/form-elements/HoldEnquiryForm";
import LostEnquiryModal from "../form/form-elements/LostEnquiryForm";

import EditEnquiryForm from "../form/form-elements/EditEnquiryForm";
import { Tooltip } from "@heroui/react";
import ShowForRoles from "@/app/utils/ShowForRoles";
import { STATUS_COLOR_MAP } from "../common/BadgeStatus";
import { canEditEnquiry, canHoldEnquiry, canMarkLost, canMarkWon } from "@/domain/enquiry/rules";

type FollowUpModalType =
  | "createNew"
  | "update"
  | "complete"
  | "hold"
  | "lost"
  | "editenquiry"
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
  onLeadStatus,
  sortField,
  sortOrder,
}: EnquiryDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null); // You can strongly type this

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null,
  );
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
    null,
  );
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showCreateNextModal, setShowCreateNextModal] = useState(false);

  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  const { followupDetails, isLoading, isError, refetch } =
    useFollowUp(selectedId);

  // Dispatch server-side fetch
  const handleSort = (field: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const order: "asc" | "desc" =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";

    fetchEnquiries({
      token,
      sortField: field,
      sortOrder: order,
    });
  };

  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setShowCreateNextModal(true)
    refetch();
    console.log(
      "GetTing Follow Up Details After Creating Follow-Up Component Logic:",
      followupDetails,
    );
  };

  const handleCompleteFollowUpHandler = (EnqiuryId: string) => {
    setSelectedEnquiryId(EnqiuryId);
    setModalType("complete");
    console.log(
      "GetTing Follow Up Details After Completing Follow-Up Component Logic:",
      followupDetails,
    );
  };

  const handleHoldEnquiryHandler = (EnqiuryId: string) => {
    setSelectedEnquiryId(EnqiuryId);
    setModalType("hold");
    console.log(
      "GetTing Follow Up Details After Completing Follow-Up Component Logic:",
      followupDetails,
    );
  };

  const handleLostEnquiryHandler = (EnqiuryId: string) => {
    setSelectedEnquiryId(EnqiuryId);
    setModalType("lost");
    console.log(
      "GetTing Follow Up Details After Completing Follow-Up Component Logic:",
      followupDetails,
    );
  };

  const { mutate: followUp, error, isSuccess, isPending } = useFetchFollowUps();

  // const handleFollowUp = (enquiryId: string) => {
  //   const token = sessionStorage.getItem("token");
  //   if (!token) {
  //     console.error("No token found in sessionStorage");
  //     return;
  //   }

  //   setSelectedId(enquiryId);
  //   setSelectedEnquiryId(enquiryId);
    

  //   followUp(
  //     { token, id: enquiryId },
  //     {
  //       onSuccess: async (data) => {
  //         const followUps = data.followup || [];

  //         // Save to Redux
  //         dispatch(
  //           addFollowUpsForEnquiry({
  //             enquiryId,
  //             followUps,
  //           }),
  //         );

  //         await refetch();

  //         if (followUps.length > 0) {
  //           // Show the Timeline Modal if follow-ups exist
  //           setFollowUpData(followupDetails);
  //           setShowForm(true); // This triggers TimelineDatatable
  //           setShowTimelineModal(true)
  //           setModalType(null);
  //         } else {
  //           // Show Create Follow-Up Modal if no follow-ups
  //           setModalType("createNew");
  //         }
  //       },
  //     },
  //   );
  // };

  const handleFollowUp = useCallback((enquiryId: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setSelectedId(enquiryId);
    setSelectedEnquiryId(enquiryId);

    followUp(
      { token, id: enquiryId },
      {
        onSuccess: async (data) => {
          const followUps = data.followup || [];

          dispatch(
            addFollowUpsForEnquiry({
              enquiryId,
              followUps: data.followup ?? [],
            }),
          );

          console.log("FOLLOW_UP IN HANDLE FOLLOW UP HANDLER:", data);

          await refetch();
          if (followUps.length > 0) {
              // Show the Timeline Modal if follow-ups exist
              setFollowUpData(followupDetails);
              setShowForm(true); // This triggers TimelineDatatable
              setShowTimelineModal(true)
              setModalType(null);
            } else {
              // Show Create Follow-Up Modal if no follow-ups
              setModalType("createNew");
            }
        },
      },
    );
  }, [dispatch, followUp, refetch]);

  const handleEditEnquiry = (item: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }
    setSelectedEnquiryData(item);
    setModalType("editenquiry");
    setSelectedId(item.id);
    setSelectedEnquiryId(item.id);
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
                  Sr No.
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Enquires
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Course
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onSort("createdAt")}
                  >
                    Created At
                   <span>
                    {sortField !== "createdAt"
                      ? "↑↓"       // neutral
                      : sortOrder === "asc"
                      ? "↑"
                      : "↓"}
                  </span>
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <span className="flex items-center gap-1">
                   Status
                  <Tooltip
                    className="rounded bg-gray-200 text-[10px] mb-1.5"
                    content="WARM: Create Initial Follow-Up"
                  >
                    <span className="cursor-pointer text-xl text-gray-600">
                      🛈
                    </span>
                  </Tooltip>
                  </span>
                </TableCell>
                <ShowForRoles allowedRoles={["ADMIN", "FACULTY"]}>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Follow-Up
                  </TableCell>
                </ShowForRoles>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Actions
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Edit
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {enquiries && enquiries.length > 0 ? (
                enquiries.map((item: any) => {
                  // ✅ DOMAIN RULES – ONE PLACE
                  const canWon = canMarkWon(item.leadStatus);
                  const canHold = canHoldEnquiry(item.leadStatus);
                  const canLost = canMarkLost(item.leadStatus);
                  const canEdit = canEditEnquiry(item.leadStatus);
                
                  return (
                  <TableRow key={item.id}>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.srNo}
                    </TableCell>
                    <TableCell className="px-5 py-2 text-start sm:px-6">
                      <div className="flex items-center">
                        <div className="overflow-hidden rounded-full">
                          {/* <Avatar name={item.name} size={30} /> */}
                        </div>
                        <div>
                          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90 capitalize">
                            {item.name}
                          </span>
                          <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                            {item.email ? item.email : ""}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      <span>
                        {item.enquiryCourse.map((c: any, index: any) => (
                          <div className="capitalize" key={index}>{c.course.name}</div>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                      </span>
                    </TableCell>
                    <TableCell className="text-theme-sm px-5 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={STATUS_COLOR_MAP[item.leadStatus] ?? "error"}
                      >
                        {item.leadStatus}
                      </Badge>
                    </TableCell>
                    <ShowForRoles allowedRoles={["ADMIN", "FACULTY"]}>
                      <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                        <Button
                          onClick={() => handleFollowUp(item.id)}
                          size="sm"
                          variant="primary"
                          allowedRoles={["ADMIN", "FACULTY", "ACCOUNTANT"]} // hide for others
                          className="rounded bg-gray-100 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
                        >
                          Follow-up
                        </Button>
                      </TableCell>
                    </ShowForRoles>

                    <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">
                        {/* 🟢 WON Button */}
                        <Tooltip
                          isDisabled={!canWon}
                          className="rounded bg-gray-200 text-[10px]"
                          content="WON"
                        >
                          <span
                            className={`text-lg text-green-800 active:opacity-50 dark:text-green-200 ${!canWon
                                ? "pointer-events-none cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!canMarkWon(item.leadStatus)) return;
                              handleCompleteFollowUpHandler(item.id);
                            }}
                            aria-disabled={!canWon}
                          >
                            {/* <TaskIcon /> */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="24"
                              height="24"
                              viewBox="0,0,256,256"
                            >
                              <g
                                fill="#1cc24c"
                                fillRule="nonzero"
                                stroke="none"
                                strokeWidth="1"
                                strokeLinecap="butt"
                                strokeLinejoin="miter"
                                strokeMiterlimit="10"
                                strokeDasharray=""
                                strokeDashoffset="0"
                                fontFamily="none"
                                fontWeight="none"
                                fontSize="none"
                              >
                                <g transform="scale(10.66667,10.66667)">
                                  <path
                                    d="M5.3,10.8c-1,-1 -2.6,-1 -3.5,0c-0.9,1 -1,2.6 0,3.5l4.6,4.6c1.4,1.4 3.8,1.4 5.2,0l0.9,-0.9z"
                                    opacity="0.35"
                                  ></path>
                                  <path d="M22.3,4.7c-1,-1 -2.6,-1 -3.5,0l-9.8,9.8l3.5,3.5l9.7,-9.7c1,-1 1,-2.6 0.1,-3.6z"></path>
                                </g>
                              </g>
                            </svg>
                          </span>
                        </Tooltip>

                        <Tooltip
                          isDisabled={!canHold}
                          className="rounded bg-gray-200 text-[10px]"
                          color="danger"
                          content="HOLD"
                        >
                          <span
                            className={`text-lg text-yellow-400 active:opacity-50 dark:text-yellow-200 ${!canHold
                                ? "pointer-events-none cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!canHoldEnquiry(item.leadStatus)) return;
                              handleHoldEnquiryHandler(item.id);
                            }}
                            aria-disabled={!canHold}
                          >
                            {/* <TrashBinIcon /> */}
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 8.00008V12.0001M12 16.0001H12.01M3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7985 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586V7.94153C21 7.59889 21 7.42756 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7985 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42756 3 7.59889 3 7.94153Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </Tooltip>

                        <Tooltip
                          isDisabled={!canLost}
                          className="rounded bg-gray-200 text-[10px]"
                          content="LOST"
                        >
                          <span
                            className={`text-lg text-red-600 active:opacity-50 dark:text-red-200 ${!canLost
                                ? "pointer-events-none cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!canMarkLost(item.leadStatus)) return;
                              handleLostEnquiryHandler(item.id);
                            }}
                          >
                            {/* <PencilIcon /> */}
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M9.5 12L14.5 17M14.5 12L9.5 17M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </Tooltip>
                      </div>
                    </TableCell>

                    <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                      <Tooltip
                        className="rounded bg-gray-200 text-[10px]"
                        content="Edit Enquiry"
                      >
                        <span
                          className = {`text-lg text-gray-800 active:opacity-50 dark:text-gray-200 ${!canEdit 
                            ? "pointer-events-none cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!canEditEnquiry(item.leadStatus)) return;
                            handleEditEnquiry(item);
                          }}
                          aria-disabled={!canEdit}
                        >
                          {/* <PencilIcon /> */}
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 18L19.9999 19.094C19.4695 19.6741 18.7502 20 18.0002 20C17.2501 20 16.5308 19.6741 16.0004 19.094C15.4693 18.5151 14.75 18.1901 14.0002 18.1901C13.2504 18.1901 12.5312 18.5151 12 19.094M3.00003 20H4.67457C5.16376 20 5.40835 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21663 19.7053C6.41846 19.5816 6.59141 19.4086 6.93732 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59139 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Enquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Follow-Up Timeline modal === */}
      {showTimelineModal && followUpData && selectedId !== null && (
        <TimelineDatatable
          onClose={() => setShowTimelineModal(false)}
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

      {modalType === "editenquiry" && selectedEnquiryId !== null && (
        <EditEnquiryForm
          enquiryData={selectedEnquiryData}
          onCloseModal={() => setModalType(null)}
          courses={[]}
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
          title="Hold Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "lost" && selectedEnquiryId !== null && (
        <LostEnquiryModal
          enquiryId={selectedEnquiryId}
          title="Lost Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
