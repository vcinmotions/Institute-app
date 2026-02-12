"use client";

import Pagination from "@/components/tables/Pagination";
import { getNotification } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import StudentCard from "@/components/common/StudentCard";

import NotificaionDataTable from "@/components/tables/NotificationDataTable";
import { setCurrentPage, setNotifications, setTotalPages } from "@/store/slices/notificationSlice";
import { PAGE_SIZE } from "@/constants/pagination";

export default function NotificationTable() {
  const [searchQuery, setSearchQuery] = useState("");
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const { currentPage, totalPages } = useSelector((state: RootState) => state.notification);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("createdAt");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const dispatch = useDispatch();

  // Fetch data on mount or when filters change
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token missing from sessionStorage");
        return;
      }

      setLoading(true);
      try {
        const response = await getNotification({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
        });

        dispatch(setNotifications(response.notification || []));
        dispatch(setTotalPages(response.totalPages || 1));
      } catch (error) {
        console.error("Error fetching notification:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder]);

  console.log("notification Query data:", currentPage, searchQuery, totalPages)

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePagination = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setCurrentPage(page));
  };

  const handleSort = (field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setLeadStatus(leadStatus)
  };

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Task Lists">
          {/* <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          /> */}

          <NotificaionDataTable
            notifications={notifications}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            noTotal
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
