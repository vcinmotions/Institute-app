"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import StudentCourseDataTable from "@/components/tables/StudentCourseDataTable";
import {
  setStudentCourse,
  setStudentDetail,
  setTotal,
  setTotalPages,
  setCurrentPage,
  setFilters,
  setSearchQuery,
  setSort
} from "@/store/slices/studentCourseSlice";
import FilterBox from "@/components/form/input/FilterBox";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { setFaculties } from "@/store/slices/facultySlice";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { useFetchAllCourses, useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchFaculty } from "@/hooks/queries/useQueryFetchFaculty";
import { useFetchStudentCourses } from "@/hooks/queries/useQueryFetchStudentCourse"; // 👈 Import our hook

export default function StudentCourseTable() {
  const dispatch = useDispatch();

  const { searchQuery, currentPage, filters, sortField, sortOrder } = useSelector(
    (state: RootState) => state.studentCourse,
  );

  const [searchInput, setSearchInput] = useState("");

  // Supporting layout structural selections queries
  const { data: courseData } = useFetchAllCourses();
  const { data: batchData } = useFetchAllBatches();
  const { data: facultyData } = useFetchFaculty();

  // 1. Core Server State Query Integration Hook
  const { data: studentCourseData, isLoading } = useFetchStudentCourses({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchQuery,
    sortField,
    sortOrder,
    filters,
  });

  console.log("GET STUDENT COURSE DATA IN STUDENT COURSE TABLE:", studentCourseData)

  const courseList = courseData?.course || [];
  const batchList = batchData?.batch || [];
  const facultyList = facultyData?.faculty || [];
  const studentDetails = studentCourseData?.studentCourses || [];
  const totalPages = studentCourseData?.totalPages || [];
  const total = studentCourseData?.total || [];

  // Sync debounced search values string down to data store layers
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

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

  const handleFilters = useCallback((selectedFilters: Record<string, string | null>) => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch]);

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <FilterBox
            onFilterChange={handleFilters}
            filterFields={[
              {
                label: "Course",
                key: "courseId",
                type: "select",
                options: courseList.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                })),
              },
              {
                label: "Batch",
                key: "batchId",
                type: "select",
                options: batchList.map((b: any) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              },
              {
                label: "Faculty",
                key: "facultyId",
                type: "select",
                options: facultyList.map((f) => ({
                  label: f.name,
                  value: f.id.toString(),
                })),
              },
            ]}
          />
        </div>

        {/* Mapped loading flag directly back to React Query status state */}
        <StudentCourseDataTable
          studentCourse={studentDetails}
          loading={isLoading}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          limit={PAGE_SIZE}
          totalCount={total}
          title="Student Courses"
          onPageChange={handlePagination}
        />
      </div>
    </div>
  );
}