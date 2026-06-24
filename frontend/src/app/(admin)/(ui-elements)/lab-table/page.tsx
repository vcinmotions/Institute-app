"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
//import LabDataTable from "@/components/tables/LabDataTable";
import { setCurrentPage, setSearchQuery, setSort, setTotal, setTotalPages } from "@/store/slices/labSlice";
import LabForm from "@/components/form/form-elements/LabCreateForm";
import dynamic from "next/dynamic";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import { useFetchLab } from "@/hooks/queries/useFetchLab";

const LabDataTable = dynamic(
  () => import("@/components/tables/LabDataTable"),
  { ssr: false }
);

export default function LabTable() {
  const [showForm, setShowForm] = useState(false);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  // const lab = useSelector((state: RootState) => state.lab.labs);
  const courses = useSelector((state: RootState) => state.course.courses);
  const [loading, setLoading] = useState<boolean>(false);
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );
  const { currentPage, searchQuery, sortField, sortOrder } = useSelector((state: RootState) => state.lab)
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Debounce effect: update searchQuery 1 second after user stops typing
  // --- Debounced search and Set delay time according to your needs
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // 2. sync debounced value to Redux
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // Fetch data on mount or when filters change
  // 3. Fire TanStack Query hook instead of a manual useEffect
  const { data: labData, isLoading: isLabLoading, isError: isLabError } = useFetchLab({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchQuery,
  });

  console.log("LAB DATA IN LAB TABLE:", labData);

  const lab = labData?.labs || [];
  const totalPages = labData?.totalPages || [];
  const total = labData?.total || [];

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
  }, [dispatch, totalPages]);

  const handleSort = useCallback((field: "isActive") => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);


  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <Link
            href="/dashboard/lab/create"
            className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            + Create Record
          </Link>
        </div>

        <LabDataTable
          lab={lab}
          loading={isLabLoading}
          courses={courses}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Pagination
          currentPage={currentPage}
          limit={PAGE_SIZE}
          totalPages={totalPages}
          totalCount={total}
          title="Labs"
          onPageChange={handlePagination}
        />
      </div>
      {showForm && <LabForm onCloseModal={handleCloseModal} />}
    </div>
  );
}
