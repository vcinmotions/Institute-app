"use client";

import Search from "@/components/form/input/Search";

import Pagination from "@/components/tables/Pagination";
import { getBatch, getLab } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";

import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import BatchDataTable from "@/components/tables/BatchDataTable";
import BatchForm from "@/components/form/form-elements/BatchCreateForm";
import { setCurrentPage, setSearchQuery, setSort, } from "@/store/slices/batchSlice";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import { useFetchBatch } from "@/hooks/queries/useFetchBatch";
import { useFetchLab } from "@/hooks/queries/useFetchLab";

export default function BatchTable() {
  const [showForm, setShowForm] = useState(false);
  const { currentPage, searchQuery, sortField, sortOrder, } = useSelector((state: RootState) => state.batch)

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

  // 2. sync debounced value to Redux
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // 3. Fire TanStack Query hook instead of a manual useEffect
  const { data, isLoading, isError } = useFetchBatch({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchQuery,
  });

  console.log("BATCH DATA IN BATCH TABLE:", data?.batch);

  const batch = data?.batch || [];
  const totalPages = data?.totalPages || [];
  const total = data?.total || [];

  // 3. Fire TanStack Query hook instead of a manual useEffect
  const { data: labData, isLoading: isLabLoading, isError: isLabError } = useFetchLab({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchQuery,
  });

  console.log("LAB DATA IN BATCH TABLE:", labData);

  const labs = labData?.labs || []

  // --- Handlers (memoized)

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
  }, [dispatch, totalPages]);

  const handleSort = useCallback((field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);

  const handleCreateClick = () => {
    setShowForm(!showForm);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  return (
    <div>
      <div className="space-y-6">

        <div className="flex justify-between">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>

        <BatchDataTable
          batch={batch}
          loading={isLoading}
        />

        <Pagination
          currentPage={currentPage}
          limit={PAGE_SIZE}
          totalPages={totalPages}
          title="Bathes"
          totalCount={total}
          onPageChange={handlePagination}
        />

      </div>

      {showForm && <BatchForm onCloseModal={handleCloseModal} labs={labs} />}
    </div>
  );
}
