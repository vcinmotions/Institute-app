"use client";

import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

// Components & UI Layout Elements
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import AdmissionDataTable from "@/components/tables/AdmissionDataTable";

// Hooks & Actions
import useDebounce from "@/hooks/useDebounce";
import { useFetchWonAdmissions, useFetchAdmissionMetadata } from "@/hooks/queries/useAdmissionQueries";
import { setCourses } from "@/store/slices/courseSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { PAGE_SIZE } from "@/constants/pagination";
import {
  setCurrentPage,
  setSearchQuery,
  setSort,
} from "@/store/slices/admissionSlice";

export default function AdmissionTable() {
  const dispatch = useDispatch();

  // Local state for layout selections
  const [searchInput, setSearchInput] = useState("");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(null);

  // Extract Pagination & Filtering parameters from Redux
  const { currentPage, searchQuery, sortOrder, sortField } = useSelector(
    (state: RootState) => state.admission
  );

  // 1. Handle Debounced Search Typing
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 2. Primary Data Fetch via React Query Hook
  const {
    data: wonData,
    isLoading: isAdmissionsLoading,
    isFetching: isAdmissionsFetching
  } = useFetchWonAdmissions({
    page: currentPage,
    search: searchQuery,
    sortField,
    sortOrder,
    leadStatus,
  });

  // 3. Metadata Fetch Hook (Courses, Batches)
  const { data: metaData } = useFetchAdmissionMetadata();

  // Sync loaded metadata parameters into Redux slices safely if needed by other sections
  useEffect(() => {
    if (metaData) {
      dispatch(setCourses(metaData.courses));
      dispatch(setBatches(metaData.batches));
    }
  }, [metaData, dispatch]);

  // Extract safe runtime variables out of our cached response payload envelopes
  const admissionsList = wonData?.data || [];
  const totalRecords = wonData?.total || 0;
  const totalPagesCount = wonData?.totalPages || 1;

  // --- Handlers (Memoized)
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPagesCount) {
      dispatch(setCurrentPage(page));
    }
  }, [dispatch, totalPagesCount]);

  const handleSort = useCallback((field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>

        <AdmissionDataTable
          admissions={admissionsList}
          loading={isAdmissionsLoading}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Pagination
          currentPage={currentPage}
          limit={PAGE_SIZE}
          totalPages={totalPagesCount}
          title="Pending Admissions"
          totalCount={totalRecords}
          onPageChange={handlePagination}
        />
      </div>
    </div>
  );
}