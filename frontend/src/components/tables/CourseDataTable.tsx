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

import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";

import { useCreateAdmission } from "@/hooks/useCreateAdmission";

import { useDeleteEnquiry } from "@/hooks/useDeleteEnquiry";

import CreateFollowUpModal from "../form/form-elements/CreateFollowUpModal";
import CreateNewFollowUpOnEnquiryModal from "../form/form-elements/CreateNewFollowUpOnEnquiry";
import CompleteFollowUpModal from "../form/form-elements/CompleteFollowUp";
import EnquiryDetails from "../ui/enquiry/EnquiryDetails";

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import Button from "../ui/button/Button";
import EditCourseForm from "../form/form-elements/EditCourseForm";
import { Tooltip } from "@heroui/react";
import { PencilIcon } from "@/icons";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

type CourseDataTableProps = {
  courses: any[];
  batch: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onLeadStatus: (field: string) => void;
};

export default function CourseDataTable({
  courses,
  batch,
  loading,
  onSort,
  onLeadStatus,
  sortField,
  sortOrder,
}: CourseDataTableProps) {
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
  const [batchDetail, setBatchDetail] = useState(false);
  const [batchData, setBatchData] = useState<any>(null);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
    null,
  );
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  //const { enquiries, loading } = useSelector((state: RootState) => state.enquiry);

  // const [sortField, setSortField] = useState<string>("createdAt");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  console.log("get All Query To search in Course DATA Table:", courses);

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
  };

  const handleCompleteFollowUpHandler = (followUpId: string) => {
    setSelectedFollowUpId(followUpId);
    setModalType("complete");
  };

  const handleCloseModal = () => {
    setSelectedId(null);
    setBatchDetail(false);
    setBatchData(null);
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

  const handleAdmission = (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }

    console.log("Get EnquiryId to Admission Handle:", id);

    const enquiryData = courses.find((item) => item.id === id);

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

  const handleEditLab = (item: any) => {
    console.log("Get EnquiryId to Deleted Enquiry", item.id);
    console.log("Get EDIT COURSE DATA Enquiry", item);
    setSelectedId(item.id);
    setBatchDetail(true);
    setBatchData(item);
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
                  Course Name
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
                  Duration Weeks
                </TableCell>
                {/* <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Description
                </TableCell> */}
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Course Amount
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
              {courses && courses.length > 0 ? (
                courses.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        {/* <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src="/images/user/user-21.jpg"
                            alt="/images/user/user-21.jpg"
                          />
                        </div> */}
                        <div>
                          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.durationWeeks} Weeks
                    </TableCell>
                    {/* <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.description}
                    </TableCell> */}
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {/* {item.courseFeeStructure.totalAmount
                        ? new Intl.NumberFormat("en-IN").format(
                            item.courseFeeStructure.totalAmount,
                          )
                        : 0}{" "}
                      INR */}
                      {new Intl.NumberFormat("en-IN").format(
                        item.courseFeeStructure?.totalAmount ?? 0,
                      )}{" "}
                      INR
                    </TableCell>
                    {/* <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleEditLab(item)}
                        size="sm"
                        className="rounded bg-gray-800 px-4 py-2 text-sm text-white"
                      >
                        Edit Course
                      </Button>
                    </TableCell> */}
                    <TableCell className="text-theme-sm px-5 py-3 text-gray-500 dark:text-gray-400">
                      <span
                        className={`text-lg text-gray-800 active:opacity-50 dark:text-gray-200 ${"cursor-pointer"}`}
                        onClick={() => handleEditLab(item)}
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Course found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Follow-Up Timeline modal === */}

      {/* === Follow-Up Timeline modal === */}
      {/* {showAdmissionForm && selectedEnquiryData && selectedEnquiryId !== null && (
        <AdmissionForm
          onCloseModal={handleCloseAdmissionModal} // Function to close timeline modal
          enquiryData={selectedEnquiryData} // Pass follow-up data fetched from API
          enquiryId={selectedEnquiryId} // Pass current enquiry ID (number, not null)
         />
      )} */}

      {modalType === "createNew" && selectedEnquiryId !== null && (
        <CreateNewFollowUpOnEnquiryModal
          enquiryId={selectedEnquiryId}
          title="Create Follow-Up"
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "update" &&
        selectedFollowUpId !== null &&
        selectedEnquiryId !== null && (
          <CreateFollowUpModal
            enquiryId={selectedEnquiryId}
            followUpId={selectedFollowUpId}
            title="Update Follow-Up"
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

      {selectedId !== null && batchDetail === true && (
        <EditCourseForm onCloseModal={handleCloseModal} batchData={batchData} />
      )}
    </div>
  );
}
