"use client";

import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import CourseDataTable from "@/components/tables/CourseDataTable";
import CourseForm from "@/components/form/form-elements/CreateNewCourseForm";
import { setCurrentPage, setSearchQuery, setSort } from "@/store/slices/courseSlice";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";

export default function CourseTable() {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // 1. Gather global UI parameters from Redux
  const { currentPage, searchQuery, sortField, sortOrder } = useSelector(
    (state: RootState) => state.course
  );

  // 2. Handle Search Debounce Input
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // 3. Connect TanStack Query Hook
  const { data, isLoading, isError } = useFetchCourse({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchQuery,
  });

  // Extract variables with safe structural fallbacks 
  const coursesList = data?.course ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.total ?? 0;

  // --- Handlers ---
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
  }, [dispatch, totalPages]);


  const handleCloseModal = () => {
    setShowForm(false);
  };

  if (isError) return <p className="text-red-500 p-4">Error loading courses.</p>;

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
            href="/dashboard/course/create"
            className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            + Create Record
          </Link>
        </div>

        <CourseDataTable
          courses={coursesList}
          loading={isLoading}
        />

        <Pagination
          currentPage={currentPage}
          limit={PAGE_SIZE}
          totalPages={totalPages}
          totalCount={totalCount}
          title="Courses"
          onPageChange={handlePagination}
        />
      </div>

      {showForm && <CourseForm onCloseModal={handleCloseModal} />}
    </div>
  );
}