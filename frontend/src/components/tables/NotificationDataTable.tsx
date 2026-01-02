import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";

import { useSelector } from "react-redux";

import { useFetchEnquiry } from "@/hooks/useGetEnquiries";

import { RootState } from "@/store";
import { useUpdateNotification } from "@/hooks/useUpdateNotification";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";

type ActivityDataTableProps = {
  notifications: any[];
  loading: boolean;
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onLeadStatus: (field: string) => void;
};

export default function NotificaionDataTable({
  notifications,
  loading,
  onSort,
  onLeadStatus,
  sortField,
  sortOrder,
}: ActivityDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [selectedEnquiryData, setSelectedEnquiryData] = useState<any>(null); // You can strongly type this
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filteredEnquiriesData = useSelector(
    (state: RootState) => state.enquiry.filteredEnquiries,
  );
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null,
  );
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(
    null,
  );
  const { mutate: fetchEnquiries, data } = useFetchEnquiry();
  const { mutate: updateNotification } = useUpdateNotification();

  console.log(
    "get All Query To search Activity notifications data Table:",
    notifications,
  );

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

  const handleNotificationUpdate = async (id: any) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      await updateNotification(id);
    } catch (error) {
      console.error("Error in Uodating Notification:", error);
    }
  };

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
                  Action
                </TableCell>

                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Message
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
                  Update
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {notifications && notifications.length > 0 ? (
                notifications.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start sm:px-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                            {item.followUpId
                              ? "Follow-Up"
                              : item.enquiryId
                                ? "Enquiry"
                                : "Payment"}
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
                      <Badge
                        size="sm"
                        color={item.seen === true ? "success" : "error"}
                      >
                        {item.seen === true ? "DONE" : "PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {item.message}
                    </TableCell>
                    <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => handleNotificationUpdate(item.id)}
                        size="sm"
                        className={
                          item.seen === true
                            ? "cursor-not-allowed rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                            : "rounded bg-gray-800 px-4 py-2 text-sm text-white transition hover:bg-gray-900"
                        }
                      >
                        Update
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
                    No Notification Logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
