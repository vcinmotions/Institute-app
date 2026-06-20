"use client";

import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

// Components & UI Elements
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import StudentDataTable from "@/components/tables/StudentDataTable";
import FilterBox from "@/components/form/input/FilterBox";

// Hooks & Store Reducers
import useDebounce from "@/hooks/useDebounce";
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { PAGE_SIZE } from "@/constants/pagination";
import {
  setCurrentPage,
  setFilters,
  setSearchQuery,
  setSort
} from "@/store/slices/studentSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { useFetchStudent } from "@/hooks/queries/useQueryFetchStudent";

export default function StudentTable() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchInput, setSearchInput] = useState("");

  // 1. Grab metadata arrays directly out of state slices
  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);

  // 2. Pull operational search and pagination query dependencies from slice
  const {
    currentPage,
    searchQuery,
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.student);

  // Safe Token retrieval block
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  // 3. Bind master student query data mapping seamlessly to your hook
  const {
    data: studentApiResponse,
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

  // 4. Fetch metadata using React Query parallel executions
  const { data: courseData } = useFetchCourse();
  const { data: batchData } = useFetchAllBatches({ onlyAvailable: true });

  // Sync Course metadata into slice when fetched
  useEffect(() => {
    if (courseData?.course) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  // Sync Batch metadata into slice when fetched
  useEffect(() => {
    if (batchData?.batch) {
      dispatch(setBatches(batchData.batch));
    }
  }, [batchData, dispatch]);

  // Handle immediate keyboard input feedback loop
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Sync debounced string value down to search controller parameters
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // Generate clean select field configurations for the filter box
  const courseOptions = course.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  // --- Memoized Handler Actions ---
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (studentApiResponse?.totalPages && page >= 1 && page <= studentApiResponse.totalPages) {
      dispatch(setCurrentPage(page));
    }
  }, [dispatch, studentApiResponse?.totalPages]);

  const handleSort = useCallback((field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);

  const handleFilters = useCallback((selectedFilters: Record<string, string | null>) => {
    dispatch(setFilters(selectedFilters));
    dispatch(setCurrentPage(1)); // Reset back to baseline pagination page on filter shifts
  }, [dispatch]);

  // Pull out safely initialized values from React Query mapping boundaries
  // Note: Depending on your backend response shape, adjust `studentApiResponse?.student` 
  // to `studentApiResponse?.data` if your endpoint wraps paginated listings inside an inner block.
  const recordsList = (studentApiResponse as any)?.data || studentApiResponse?.student || [];
  const totalCount = studentApiResponse?.total || 0;
  const computedTotalPages = studentApiResponse?.totalPages || 1;

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
          batch={batch}
          course={course}
          loading={isStudentLoading}
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