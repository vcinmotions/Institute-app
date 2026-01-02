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

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import Button from "../ui/button/Button";
import EditFacultyForm from "../form/form-elements/EditfacultyForm";
import EditRolesForm from "../form/form-elements/EditRoleForm";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

type RolesDataTableProps = {
  roles: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
};

export default function RolesDataTable({
  roles,
  loading,
  onSort,
  sortField,
  sortOrder,
}: RolesDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [roleDetail, setRoleDetail] = useState<boolean>(false);
  const [roleData, setRoleData] = useState<any>(null);
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
  //const { enquiries, loading } = useSelector((state: RootState) => state.enquiry);

  // const [sortField, setSortField] = useState<string>("createdAt");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  console.log("get All Query To search in Course DATA Table:", roles);

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

  const handleCloseModal = () => {
    setSelectedId(null);
    setRoleDetail(false);
    setRoleData(null);
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

    const enquiryData = roles.find((item) => item.id === id);

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

  const hanldleEdit = (item: any) => {
    setSelectedId(item.id);
    setRoleDetail(true);
    setRoleData(item);
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
            <TableHeader className="dark:bg-gray-dark sticky top-0 z-30 border-b border-gray-100 bg-white dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Name
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
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Created At
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
                  Update
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {roles && roles.length > 0 ? (
                roles.map((item: any) => (
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
                      {item.email}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.role}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Button
                        onClick={() => hanldleEdit(item)}
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Roles found.
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

      {selectedId !== null && roleDetail === true && (
        <EditRolesForm onCloseModal={handleCloseModal} roleData={roleData} />
      )}
    </div>
  );
}
