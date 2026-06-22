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
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { useFetchFaculty } from "@/hooks/queries/useQueryFetchFaculty";
import { useFetchStudentCourses } from "@/hooks/queries/useQueryFetchStudentCourse"; // 👈 Import our hook

export default function StudentCourseTable() {
  const dispatch = useDispatch();

  const { searchQuery, totalPages, currentPage, filters, total, sortField, sortOrder } = useSelector(
    (state: RootState) => state.studentCourse,
  );
  const studentDetails = useSelector(
    (state: RootState) => state.studentCourse.studentDetails ?? [],
  );
  const batch = useSelector((state: RootState) => state.batch.batches ?? []);
  const course = useSelector((state: RootState) => state.course.courses ?? []);
  const faculty = useSelector((state: RootState) => state.faculty.faculties ?? []);

  const [searchInput, setSearchInput] = useState("");

  // Supporting layout structural selections queries
  const { data: courseData } = useFetchCourse();
  const { data: batchData } = useFetchAllBatches();
  const { data: facultyData } = useFetchFaculty();

  // 1. Core Server State Query Integration Hook
  const { data: studentCourseData, isLoading: isMainTableLoading } = useFetchStudentCourses({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchQuery,
    sortField,
    sortOrder,
    filters,
  });

  // Hydrate context references selections 
  useEffect(() => {
    if (courseData?.course) dispatch(setCourses(courseData.course));
  }, [courseData, dispatch]);

  useEffect(() => {
    if (batchData?.batch) dispatch(setBatches(batchData.batch));
  }, [batchData, dispatch]);

  useEffect(() => {
    if (facultyData?.faculty) dispatch(setFaculties(facultyData.faculty));
  }, [facultyData, dispatch]);

  // ✅ 2. CRITICAL SYNC EFFECT: Updates Redux when React Query fetches fresh results
  useEffect(() => {
    if (studentCourseData) {
      dispatch(setStudentCourse(studentCourseData.data || []));
      dispatch(setStudentDetail(studentCourseData.detailedCourses || []));
      dispatch(setTotalPages(studentCourseData.totalPages || 1));
      dispatch(setTotal(studentCourseData.total || 0));
    }
  }, [studentCourseData, dispatch]);

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
                options: course.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                })),
              },
              {
                label: "Batch",
                key: "batchId",
                type: "select",
                options: batch.map((b) => ({
                  label: b.name,
                  value: b.id.toString(),
                })),
              },
              {
                label: "Faculty",
                key: "facultyId",
                type: "select",
                options: faculty.map((f) => ({
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
          loading={isMainTableLoading}
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