import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Button from "../ui/button/Button";
import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";
import TimelineDatatable from "@/app/(admin)/(ui-elements)/timeline/TimelineComponent";
import { useCreateAdmission } from "@/hooks/useCreateAdmission";
import { useCreateEnquiry } from "@/hooks/useCreateEnquiry";
import { TrashBinIcon } from "@/icons";
import { useDeleteEnquiry } from "@/hooks/useDeleteEnquiry";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";

import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";
import EnquiryDetails from "../ui/enquiry/EnquiryDetails";
import { addFollowUpsForEnquiry } from "@/store/slices/followUpSlice";
import { getEnquiry } from "@/lib/api";
import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import AdmissionForm from "../form/form-elements/AdmissionForm";
import { useFollowUp } from "@/hooks/useQueryFetchFollow";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

type EnquiryDataTableProps = {
  enquiries: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onLeadStatus: (field: string) => void;
};

export default function MasterDataTable({
  enquiries,
  loading,
  onSort,
  onLeadStatus,
  sortField,
  sortOrder,
}: EnquiryDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const dispatch = useDispatch();
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [showCreateFollowUp, setShowCreateFollowUp] = useState(false);
  const [enquiryDetail, setEnquiryDetail] = useState(false);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null); // You can strongly type this
  const [newEnquiry, setNewEnquiry] = React.useState({
    name: "",
    email: "",
    course: "",
    source: "",
    contact: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null,
  );
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
    null,
  );
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  const { followupDetails, isLoading, isError, refetch } =
    useFollowUp(selectedId);
  //const { enquiries, loading } = useSelector((state: RootState) => state.enquiry);

  // const [sortField, setSortField] = useState<string>("createdAt");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  console.log("get All Query To search:", enquiries);
  console.log("Get New Follow-Up data to Update Timeline:", followupDetails);

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

  const openDeleteModal = (id: string) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedId(null);
    setShowModal(false);
  };

  const handleCreateClick = () => {
    setShowForm(!showForm);
  };

  const handleCreateFollowUpForEnquiry = (enquiryId: string) => {
    setSelectedEnquiryId(enquiryId);
    setModalType("createNew");
  };

  const handleCreateFollowUpForFollowUp = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setModalType("update");
    refetch();
  };

  const handleCompleteFollowUpHandler = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setModalType("complete");
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEnquiryDetail(false);
  };

  const handleCloseAdmissionModal = () => {
    setShowAdmissionForm(false);
    setSelectedEnquiryData(null);
  };

  const { mutate: followUp, error, isSuccess, isPending } = useFetchFollowUps();
  const { mutate: admissionStudent } = useCreateAdmission();
  const { mutate: deleteEnquiry } = useDeleteEnquiry();

  // if (!enquiries) {
  //   return <div>Loading enquiries...</div>; // or a spinner
  // }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEnquiry({ ...newEnquiry, [e.target.name]: e.target.value });
  };

  // const handleFollowUp = (id: any) => {
  //   const token = sessionStorage.getItem("token");
  //   if (!token) {
  //       console.error("No token found in sessionStorage");
  //       return;
  //   }

  //   console.log("Get EnquiryId to Fetch Follow Up", id);
  //   setSelectedId(id);
  //   setSelectedEnquiryId(id);
  //   followUp(
  //       { token, id },
  //       {
  //       onSuccess: (data) => {
  //           //setFollowUpData(data);
  //           console.log("Fetched follow-up data in hanldeFollowUp:", data);

  //           // ✅ Save to Redux instead of useState
  //           // ✅ Instead, save follow-ups keyed by enquiryId
  //           dispatch(addFollowUpsForEnquiry({
  //             enquiryId: id,
  //             followUps: data.followup,
  //           }));

  //           setFollowUpData(data);   // ✅ Save follow-up data
  //           setShowForm(true);       // ✅ Show the modal
  //       },
  //       }
  //   );
  // };

  const handleFollowUp = (enquiryId: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }

    setSelectedId(enquiryId);
    setSelectedEnquiryId(enquiryId);

    followUp(
      { token, id: enquiryId },
      {
        onSuccess: async (data) => {
          const followUps = data.followup || [];

          // Save to Redux
          dispatch(
            addFollowUpsForEnquiry({
              enquiryId,
              followUps,
            }),
          );

          await refetch();

          if (followUps.length > 0) {
            // Show the Timeline Modal if follow-ups exist
            setFollowUpData(followupDetails);
            setShowForm(true); // This triggers TimelineDatatable
            setModalType(null);
          } else {
            // Show Create Follow-Up Modal if no follow-ups
            setModalType("createNew");
          }
        },
      },
    );
  };

  const handleAdmission = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }

    console.log("Get EnquiryId to Admission Handle:", id);

    const enquiryData = enquiries.find((item) => item.id === id);

    console.log("Get Enquity Data in Handle Admission:", enquiryData);

    if (!enquiryData) {
      console.error("No enquiry data found for this ID");
      return;
    }

    const { name, email, contact, course } = enquiryData;

    // ✅ Save ID and data to state
    setSelectedEnquiryId(id);
    setSelectedEnquiryData({ name, email, contact, course });

    console.log("Get Enquiry Id in HandleAdmission:", selectedEnquiryId);
    console.log("Get Enquiry DATA in HandleAdmission:", selectedEnquiryData);
    setShowAdmissionForm(true);
  };

  // const handleDeleted = (id: any) => {
  //   const token = sessionStorage.getItem("token");
  //   if (!token) {
  //       console.error("No token found in sessionStorage");
  //       return;
  //   }

  //   console.log("Get EnquiryId to Deleted Enquiry", id);

  //   deleteEnquiry(
  //       { token, id },
  //       {
  //       onSuccess: (data) => {
  //           console.log("Deleted Enquiry:", data);
  //           setFollowUpData(data);   // ✅ Save follow-up data
  //       },
  //       }
  //   );

  //   setShowForm(false);
  // }

  const handleDeleted = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }

    console.log("Get EnquiryId to Deleted Enquiry", id);

    deleteEnquiry(
      { token, id },
      {
        onSuccess: (data) => {
          console.log("Deleted Enquiry:", data);
          setFollowUpData(null); // Optional: Clear data if needed
          setShowModal(false); // ✅ Close the modal
          setSelectedId(null); // ✅ Reset selectedId
        },
        onError: (err) => {
          console.error("Delete failed:", err);
          alert("Something went wrong while deleting");
        },
      },
    );
  };

  const handleEnquiryDetail = (id: any) => {
    console.log("Get EnquiryId to Deleted Enquiry", id);
    setSelectedId(id);
    setEnquiryDetail(true);
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
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-9999 border-b border-gray-100 bg-white dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  User
                </TableCell>
                {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => handleSort("name")}
                  >
                    User
                    {sortField === "name" && (
                      <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                </TableCell> */}

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Course
                </TableCell>
                {/* <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell> */}
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={() => onLeadStatus("leadStatus")}
                  >
                    Status
                    <span>
                      {sortField === "leadStatus" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
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
                      {sortField === "createdAt" && sortOrder === "asc"
                        ? "▲"
                        : "▼"}
                    </span>
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Folow-Up
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
                  Delete
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            {/* <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {enquiries?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src="/images/user/user-21.jpg"
                          alt="/images/user/user-21.jpg"
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {item.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {item.createdAt}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.course}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        item.leadStatus === "COLD"
                            ? "success"
                            : item.leadStatus === "HOT"
                            ? "warning"
                            : item.leadStatus === "WARM"
                            ? "info" // or any color name you support
                            : "error"
                        }
                    >
                      {item.leadStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(item.createdAt).toISOString().split("T")[0]}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button onClick={() => handleFollowUp(item.id)} size="sm" className="rounded bg-gray-800 px-4 py-2 text-white text-sm hover:bg-gray-900 transition">Follow-Up</Button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Button onClick={() => handleAdmission(item.id)} size="sm" className="rounded bg-gray-800 px-4 py-2 text-white text-sm hover:bg-gray-900 transition">Admission</Button>
                  </TableCell>
                 <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div>
                      <div
                        onClick={() => openDeleteModal(item.id)}
                        className="px-4 py-2 text-black cursor-pointer hover:text-red-700 hover:dark:text-red-700 dark:text-white text-sm"
                      >
                        <TrashBinIcon />
                      </div>

                      {showModal && (
                        console.log("confirmation modal is open"),
                        <ConfirmDeleteModal
                          title="Are you sure?"
                          message="Do you really want to delete this enquiry? This action cannot be undone."
                          onConfirm={() => handleDeleted(item.id)}
                          onClose={closeDeleteModal} 
                          isOpen={showModal && selectedId === item.id}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody> */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {enquiries && enquiries.length > 0 ? (
                enquiries.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src="/images/user/user-21.jpg"
                            alt="/images/user/user-21.jpg"
                          />
                        </div>
                        <div>
                          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                          <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                            {item.createdAt}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.email}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.course}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          item.leadStatus === "COLD"
                            ? "success"
                            : item.leadStatus === "HOT"
                              ? "warning"
                              : item.leadStatus === "WARM"
                                ? "info"
                                : "error"
                        }
                      >
                        {item.leadStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleFollowUp(item.id)}
                        size="sm"
                        className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Follow-Up
                      </Button>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                      {item.leadStatus === "HOT" ||
                      item.leadStatus === "WARM" ? (
                        <Button
                          size="sm"
                          disabled={true}
                          className="cursor-not-allowed rounded bg-yellow-600 px-4 py-2 text-sm text-white"
                        >
                          Pending Follow-Up
                        </Button>
                      ) : item.isConverted === true ? (
                        <Button
                          size="sm"
                          disabled={true}
                          className="cursor-not-allowed rounded bg-green-700 px-4 py-2 text-sm text-white"
                        >
                          Admission Done
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAdmission(item.id)}
                          size="sm"
                          className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                        >
                          Admission
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                      <div>
                        <div
                          onClick={() => openDeleteModal(item.id)}
                          className="cursor-pointer px-4 py-2 text-sm text-black hover:text-red-700 dark:text-white hover:dark:text-red-700"
                        >
                          <TrashBinIcon />
                        </div>

                        {showModal && selectedId === item.id && (
                          <ConfirmDeleteModal
                            title="Are you sure?"
                            message="Do you really want to delete this enquiry? This action cannot be undone."
                            onConfirm={() => handleDeleted(item.id)}
                            onClose={closeDeleteModal}
                            isOpen={true}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    {" "}
                  </TableCell>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    {" "}
                  </TableCell>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    {" "}
                  </TableCell>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    {" "}
                  </TableCell>
                  <TableCell className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No enquiries found.
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

      {selectedId !== null && enquiryDetail === true && (
        <EnquiryDetails onClose={handleCloseModal} enquiryId={selectedId} />
      )}
    </div>
  );
}
