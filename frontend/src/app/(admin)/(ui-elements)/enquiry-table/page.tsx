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
import { getEnquiry } from "@/lib/api";

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
import { selectEnquiries, selectEnquiryPage, selectEnquiryTotal, selectEnquiryTotalPages, selectFilters, selectLeadStatus, selectLoading, selectSearchQuery, selectSortField, selectSortOrder } from "@/store/selectors/enquirySelectors";
import { LEAD_STATUS_FILTER_OPTIONS } from "@/components/common/LeadStatus";
import { LEAD_STATUS_OPTIONS } from "@/domain/enquiry/leadStatus";
import { useFetchEnquiry } from "@/hooks/queries/useQueryFetchEnquiry";

export default function EnquiryTable() {
  const dispatch = useDispatch<AppDispatch>();

  // --- State
  const enquiries = useSelector(selectEnquiries);
  const sortField = useSelector(selectSortField);
  const sortOrder = useSelector(selectSortOrder);
  const leadStatus = useSelector(selectLeadStatus);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const searchQuery = useSelector(selectSearchQuery);
  const currentPage = useSelector(selectEnquiryPage);
  const totalPages = useSelector(selectEnquiryTotalPages);
  const total = useSelector(selectEnquiryTotal);
  const [searchInput, setSearchInput] = useState("");

  const courses = useSelector((state: RootState) => state.course.courses ?? []);
  const { data: courseData, isLoading: courseLoading } = useFetchCourse();

  const token = useSelector((state: RootState) => state.auth.token);

  const { data, isLoading } = useFetchEnquiry({
  token,
  currentPage,
  searchQuery,
  limit: 5,
  sortField,
  sortOrder,
  leadStatus,
  filters,
});

  // ✅ Reset page to 1 on navigation (mount)
  useEffect(() => {
   dispatch(setCurrentPage(1));
  }, []);

  useEffect(() => {
    console.log("USEFFFECT TRIGGERED IN ENQUIRY-TABLE")
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

  // --- Fetch enquiries
  // useEffect(() => {
  //   const fetchEnquiries = async () => {
  //     const token = sessionStorage.getItem("token");
  //     if (!token) return;

  //     dispatch(setLoading(true));
  //     try {
  //       const res = await getEnquiry({
  //         token,
  //         page: currentPage,
  //         limit: 5,
  //         search: searchQuery,
  //         sortField,
  //         sortOrder,
  //         leadStatus,
  //         ...filters,
  //       });

  //       console.log("RESULTTTTT for the ENQUIRES:", res);

  //       dispatch(setEnquiries(res.data || []));
  //       dispatch(setTotal(res.total || 0));
  //       dispatch(setTotalPages(res.totalPages || 1));
  //     } catch (err) {
  //       console.error("Error fetching enquiries:", err);
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   };

  //   fetchEnquiries();
  // }, [currentPage, searchQuery, sortField, sortOrder, leadStatus, filters]);

  // --- Handlers (memoized)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
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

  // --- Course options for filter
  // const courseOptions = courses.map(c => ({ label: c.name, value: c.id }));

  // --- Course options for filter (memoized)
  const courseOptions = useMemo(() => {
    return courses.map(c => ({ label: c.name, value: c.id }));
  }, [courses]);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Enquiry Lists">
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
              <span
                className="cursor-pointer"
                onClick={() => { dispatch(setCurrentPage(1)); dispatch(setSearchQuery(searchQuery)); }}
              >
                <Tooltip content="Reload" className="rounded bg-gray-200 text-[10px]">
                  <div className="items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                    <svg className="dark:text-gray-300" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43511 18.2543 3.35177 14.5M2 10V4M2 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Tooltip>
              </span>
            </div>
          </div>

          <EnquiryDataTable
            enquiries={enquiries}
            loading={loading}
            onSort={handleSort}
            onLeadStatus={handleLeadStatus}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalCount={total}
            totalPages={totalPages}
            title="Enquiries"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}

