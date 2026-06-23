"use client";

import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { useDispatch, useSelector } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import FacultyDataTable from "@/components/tables/FacultyDataTable";
import StudentCard from "@/components/common/StudentCard";
import useDebounce from "@/hooks/useDebounce";
import { useFetchSource } from "@/hooks/queries/useQueryFetchSource";
import { AppDispatch, RootState } from "@/store";
import { setCurrentPage, setSearchQuery, setSources, setTotal, setTotalPages } from "@/store/slices/sourceSlice";
import SourceDataTable from "@/components/tables/SourceDataTable";
import ComponentCard from "@/components/common/ComponentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SourceTable() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>();
  const {
    sources,
    loading,
    searchQuery,
    currentPage,
    totalPages,
    total
  } = useSelector((state: RootState) => state.source);

  const { data, isLoading, isError } = useFetchSource();

  console.log("Source in Source Table", data)

  useEffect(() => {
    console.log("useFetchSource TRIGGERED IN SOURCE-TABLE", data)
    if (data) {
      dispatch(setSources(data.source || []));
      dispatch(setTotal(data.totalCount || 0));
      dispatch(setTotalPages(data.totalPages || 1));
    }
  }, [data, dispatch]);

  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");

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
    if (debouncedSearchTerm !== searchInput) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchInput, dispatch]);
  // Fetch data on mount or when filters change

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
  }, [dispatch, totalPages]);

  const handleCreateClick = () => {
    router.push("/dashboard/source/create")
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4">
          <div className="flex justify-between">
            <Search
              value={searchInput}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />

            <Link
              href="/dashboard/source/create"
              className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              + Create Record
            </Link>
          </div>

          <SourceDataTable
            sources={sources}
            loading={loading}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            limit={PAGE_SIZE}
            title="Faculties"
            totalCount={total}
            onPageChange={handlePagination}
          />
        </div>
      </div>

    </div>
  );
}
