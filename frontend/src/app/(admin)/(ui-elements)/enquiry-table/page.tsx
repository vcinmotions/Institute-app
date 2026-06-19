"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";
import StudentCard from "@/components/common/StudentCard";
import Search from "@/components/form/input/Search";
import FilterBox from "@/components/form/input/FilterBox";
import EnquiryDataTable from "@/components/tables/EnquiryDataTable";
import Pagination from "@/components/tables/Pagination";
import useDebounce from "@/hooks/useDebounce";
import { Tooltip } from "@heroui/react";

import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";

import {
  setCurrentPage,
  setEnquiries,
  setFilters,
  setLeadStatus,
  setLoading,
  setSearchQuery,
  setSort,
  setTotal,
  setTotalPages,
} from "@/store/slices/enquirySlice";
import { setCourses } from "@/store/slices/courseSlice";
import { LEAD_STATUS_FILTER_OPTIONS } from "@/components/common/LeadStatus";
import { LEAD_STATUS_OPTIONS } from "@/domain/enquiry/leadStatus";
import { useFetchEnquiry } from "@/hooks/queries/useQueryFetchEnquiry";
import { PAGE_SIZE } from "@/constants/pagination";

export default function EnquiryTable() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    enquiries,
    sortField,
    sortOrder,
    leadStatus,
    filters,
    loading,
    searchQuery,
    currentPage,
    totalPages,
    total
  } = useSelector((state: RootState) => state.enquiry);

  const [searchInput, setSearchInput] = useState("");

  const courses = useSelector((state: RootState) => state.course.courses ?? []);
  const { data: courseData, isLoading: courseLoading } = useFetchCourse();

  const token = useSelector((state: RootState) => state.auth.token);

  const { data, isLoading, isFetching } = useFetchEnquiry({
    token,
    currentPage,
    searchQuery,
    limit: PAGE_SIZE,
    sortField,
    sortOrder,
    leadStatus,
    filters,
  });

  // Use data directly instead of pulling 'enquiries' from Redux!
  const enquiriesList = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPagesCount = data?.totalPages || 1;

  // ✅ Reset page to 1 on navigation (mount)
  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  useEffect(() => {
    console.log("useFetchEnquiry TRIGGERED IN ENQUIRY-TABLE", data)
    if (data) {
      dispatch(setEnquiries(data.data || []));
      dispatch(setTotal(data.total || 0));
      dispatch(setTotalPages(data.totalPages || 1));
    }
  }, [data, dispatch]);

  // --- Load courses into Redux
  useEffect(() => {
    if (courseData?.course?.length) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  // --- Debounced search and Set delay time according to your needs
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // 2. sync debounced value to Redux
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // --- Handlers (memoized)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleReload = useCallback(() => {
    dispatch(setCurrentPage(1));
    dispatch(setSearchQuery(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const handlePagination = useCallback((page: number) => {
    const safePage = clamp(page, 1, totalPages);
    dispatch(setCurrentPage(safePage));
  }, [dispatch, totalPages]);

  const handleSort = useCallback((field: string) => {
    console.log("SORTORDER IN ENQUIRY TABLE:", sortField, sortOrder, field);
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);

  const handleFilters = useCallback((selectedFilters: Record<string, string | null>) => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch]);

  const getNextLeadStatus = useCallback((status: typeof LEAD_STATUS_OPTIONS[number]) => {
    return LEAD_STATUS_OPTIONS[(LEAD_STATUS_OPTIONS.indexOf(status) + 1) % LEAD_STATUS_OPTIONS.length];
  }, []);

  const handleLeadStatus = useCallback(() => {
    const nextStatus = getNextLeadStatus(leadStatus);
    dispatch(setLeadStatus(nextStatus));
  }, [leadStatus, dispatch, getNextLeadStatus]);

  // --- Course options for filter (memoized)
  const courseOptions = useMemo(() => {
    return courses.map(c => ({ label: c.name, value: c.id }));
  }, [courses]);

  console.log("get ENQUURY SEARCH DATA:", searchQuery);

  return (
    <div>
      <div className="space-y-6">
        {/* <StudentCard title="Enquiry Lists"> */}
        <div className="flex justify-between items-end w-full">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
          <div className="flex items-center gap-3">
            <FilterBox
              onFilterChange={handleFilters}
              filterFields={[
                { label: "Lead Status", key: "leadStatus", type: "select", options: LEAD_STATUS_FILTER_OPTIONS },
                { label: "Course", key: "courseId", type: "select", options: courseOptions },
                { label: "Create Date", key: "createDate", type: "date" },
              ]}
            />
          </div>
        </div>

        <EnquiryDataTable
          enquiries={enquiriesList}
          loading={isLoading || isFetching}
          onSort={handleSort}
          onLeadStatus={handleLeadStatus}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Pagination
          currentPage={currentPage}
          totalCount={total}
          limit={PAGE_SIZE}
          totalPages={totalPages}
          title="Enquiries"
          onPageChange={handlePagination}
        />
        {/* </StudentCard> */}
      </div>
    </div>
  );
}

