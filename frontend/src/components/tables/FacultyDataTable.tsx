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
import EnquiryDetails from "../ui/enquiry/EnquiryDetails";

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";

import AssignBatchFacultyForm from "../form/form-elements/AssignbatchToFacultyForm";
import Button from "../ui/button/Button";
import EditFacultyForm from "../form/form-elements/EditfacultyForm";

type FollowUpModalType = "createNew" | "update" | "complete" | null;

type FacultyDataTableProps = {
  faculties: any[];
  courses: any[];
  batch: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onLeadStatus: (field: string) => void;
};

export default function FacultyDataTable({
  faculties,
  courses,
  batch,
  loading,
  onSort,
  onLeadStatus,
  sortField,
  sortOrder,
}: FacultyDataTableProps) {
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
  const [facultyDetail, setFacultyDetail] = useState<boolean>(false);
  const [facultyData, setFacultyData] = useState<any>(null);
  const [modalType, setModalType] = useState<FollowUpModalType>(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null,
  );

  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
    null,
  );
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  //const { enquiries, loading } = useSelector((state: RootState) => state.enquiry);

  // const [sortField, setSortField] = useState<string>("createdAt");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  console.log("get All Query To search in faculty Table:", faculties);

  console.log("get All Query To search in faculty Table:", courses);

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

  const hanldleEdit = (item: any) => {
    setSelectedId(item.id);
    setFacultyDetail(true);
    setFacultyData(item);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setFacultyDetail(false);
  };

  const handleCloseAdmissionModal = () => {
    setShowAdmissionForm(false);
    setSelectedEnquiryData(null);
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
                  Faculty Name
                </TableCell>

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
                  Contact No.
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Joining Date
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Assign New Batch
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
              {faculties && faculties.length > 0 ? (
                faculties.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Faculty
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.email}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.contact}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.joiningDate).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Button
                        onClick={() => {
                          setSelectedFaculty(item);
                          setShowAssignModal(true);
                        }}
                        size="sm"
                        className="rounded bg-gray-800 px-5 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Assign Batch
                      </Button>
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
                    colSpan={5}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Faculty found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedFaculty !== null && showAssignModal && (
        <AssignBatchFacultyForm
          faculty={selectedFaculty}
          title="Assign New Batch"
          onCloseModal={() => {
            setSelectedFaculty(null);
            setShowAssignModal(false);
          }}
          courses={courses}
          batch={batch}
        />
      )}

      {selectedId !== null && facultyDetail === true && (
        <EditFacultyForm
          onCloseModal={handleCloseModal}
          facultyData={facultyData}
          batch={batch}
          course={courses}
        />
      )}
    </div>
  );
}
