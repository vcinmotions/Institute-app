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
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/button/Button";
import { useFetchFollowUps } from "@/hooks/useFetchFollowUps";

import { useCreateAdmission } from "@/hooks/useCreateAdmission";

import { useDeleteEnquiry } from "@/hooks/useDeleteEnquiry";

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";
import AdmissionForm from "../form/form-elements/AdmissionForm";
import { useFollowUp } from "@/hooks/useQueryFetchFollow";

import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import Avatar from "../common/Avatar";

type FollowUpModalType =
  | "createNew"
  | "update"
  | "complete"
  | "hold"
  | "lost"
  | null;

type AdmissionDataTableProps = {
  enquiries: any[];
  courses: any[];
  batch: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onLeadStatus: (field: string) => void;
};

export default function AdmissionDataTable({
  enquiries,
  courses,
  batch,
  loading,
  onSort,
  onLeadStatus,
  sortField,
  sortOrder,
}: AdmissionDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const dispatch = useDispatch();
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [enquiryDetail, setEnquiryDetail] = useState(false);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null); // You can strongly type this
  const [newEnquiry, setNewEnquiry] = React.useState({
    name: "",
    email: "",
    courseId: "",
    source: "",
    contact: "",
  });
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filteredEnquiriesData = useSelector(
    (state: RootState) => state.enquiry.filteredEnquiries,
  );
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

  console.log("get All Query To search ENQUIRY:", enquiries);

  console.log("get All Query To search COURSE:", courses);
  console.log("get All Query To search BATCH:", batch);
  console.log(
    "Get Enquiries to Proceed With Admission:",
    filteredEnquiriesData,
  );

  const handleReopenEnquiry = (enquiry: any, status: "LOST" | "HOLD") => {
    setSelectedEnquiryId(enquiry.id);
    setSelectedEnquiryData(enquiry);
    setShowForm(true); // You can use this to show your EnquiryDetails or UpdateEnquiryModal
    console.log(`Reopening enquiry ${enquiry.name} as ${status}`);
  };

  const handleEditAdmission = (id: string) => {
    // router.push(`/dashboard/admission/edit/${id}`);
    router.push(`/dashboard/admission/edit?id=${id}`);
  };

  const handleCloseAdmissionModal = () => {
    setShowAdmissionForm(false);
    setSelectedEnquiryData(null);
  };

  const { mutate: followUp, error, isSuccess, isPending } = useFetchFollowUps();
  const { mutate: admissionStudent } = useCreateAdmission();
  const { mutate: deleteEnquiry } = useDeleteEnquiry();

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

    const { name, email, contact, courseId } = enquiryData;

    // ✅ Save ID and data to state
    setSelectedEnquiryId(id);
    setSelectedEnquiryData({ name, email, contact, courseId });

    console.log("Get Enquiry Id in HandleAdmission:", selectedEnquiryId);
    console.log("Get Enquiry DATA in HandleAdmission:", selectedEnquiryData);
    setShowAdmissionForm(true);
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
                  User
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
                  Course
                </TableCell>
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
                  Admission
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredEnquiriesData && filteredEnquiriesData.length > 0 ? (
                filteredEnquiriesData.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          {/* <Image
                            width={40}
                            height={40}
                            src="/images/user/user-21.jpg"
                            alt="/images/user/user-21.jpg"
                          /> */}
                                                    <Avatar name={item.name} size={38} />
                          
                        </div>
                        <div>
                          <span className="text-theme-sm capitalize block font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                          <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.email ? item.email : "-"}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.enquiryCourse.map((cr: any, index: number) => (
                        <span key={index}>{cr.course.name}</span>
                      ))}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          item.leadStatus === "COLD"
                            ? "primary"
                            : item.leadStatus === "HOT"
                              ? "error"
                              : item.leadStatus === "WARM"
                                ? "warning"
                                : item.leadStatus === "WON"
                                  ? "success"
                                  : item.leadStatus === "HOLD"
                                    ? "info"
                                    : "error"
                        }
                      >
                        {item.leadStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleEditAdmission(item.id)}
                        size="sm"
                        className="rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        Admission
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Admission found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* === Follow-Up Timeline modal === */}
      {showAdmissionForm &&
        selectedEnquiryData &&
        selectedEnquiryId !== null && (
          <AdmissionForm
            onCloseModal={handleCloseAdmissionModal} // Function to close timeline modal
            enquiryData={selectedEnquiryData} // Pass follow-up data fetched from API
            enquiryId={selectedEnquiryId} // Pass current enquiry ID (number, not null)
            courses={courses}
            batch={batch}
          />
        )}
    </div>
  );
}
