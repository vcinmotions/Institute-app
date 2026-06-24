"use client";

import React, { ChangeEvent, useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

// Components & UI Elements
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import StudentDataTable from "@/components/tables/StudentDataTable";
import FilterBox from "@/components/form/input/FilterBox";

// Hooks & Store Reducers
import useDebounce from "@/hooks/useDebounce";
import { useFetchAllCourses } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { PAGE_SIZE } from "@/constants/pagination";
import {
  setCurrentPage,
  setFilters,
  setSearchQuery,
  setSort
} from "@/store/slices/studentSlice";
import { useFetchStudent } from "@/hooks/queries/useQueryFetchStudent";

export default function StudentTable() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchInput, setSearchInput] = useState("");

  // 1. Pull query dependencies from slice
  const {
    currentPage,
    searchQuery,
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.student);

  // Safe Token retrieval block
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  // 2. Main Student API Query
  const {
    data: studentData,
    isLoading: isStudentLoading,
    isFetching: isStudentFetching,
  } = useFetchStudent({
    token,
    currentPage,
    searchQuery,
    limit: PAGE_SIZE,
    sortField,
    sortOrder,
    filters,
  });

  // 3. Metadata Fetch via Parallel React Query Cache Instances
  const { data: courseData } = useFetchAllCourses();
  const { data: batchData } = useFetchAllBatches({ onlyAvailable: true });

  // ✅ FIX: courseData is already a flat array due to your select filter
  const courseList = courseData?.course || [];
  const batchList = batchData?.batch || [];

  // Sync debounced search string parameters down to slice properties
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // ✅ FIX: Use useMemo to safely render filter fields and avoid runtime crash if data is loading
  const courseOptions = useMemo(() => {
    return courseList.map((c) => ({
      label: c.name,
      value: String(c.id),
    }));
  }, [courseList]);

  // --- Handlers ---
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (studentData?.totalPages && page >= 1 && page <= studentData.totalPages) {
      dispatch(setCurrentPage(page));
    }
  }, [dispatch, studentData?.totalPages]);

  const handleSort = useCallback((field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);

  const handleFilters = useCallback((selectedFilters: Record<string, string | null>) => {
    dispatch(setFilters(selectedFilters));
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  // Handle baseline structural records safely out of Api wrappers
  // Safe and explicit mapping to your interface definition
  const recordsList = studentData?.student || [];
  const totalCount = studentData?.total || 0;
  const computedTotalPages = studentData?.totalPages || 1;

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between w-full items-end">
          <div className="flex items-center gap-3 w-full">
            <Search
              value={searchInput}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />
          </div>

          <div className="flex justify-center items-center gap-3">
            <FilterBox
              onFilterChange={handleFilters}
              filterFields={[
                {
                  label: "Course",
                  key: "courseId",
                  type: "select",
                  options: courseOptions,
                },
                { label: "Admission Date", key: "admissionDate", type: "date" },
              ]}
            />
          </div>
        </div>

        <StudentDataTable
          students={recordsList}
          batch={batchList}
          course={courseList}
          loading={isStudentLoading || isStudentFetching}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Pagination
          currentPage={currentPage}
          limit={PAGE_SIZE}
          totalPages={computedTotalPages}
          totalCount={totalCount}
          title="Students"
          onPageChange={handlePagination}
        />
      </div>
    </div>
  );
}