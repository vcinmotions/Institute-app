"use client";
import Search from "@/components/form/input/Search";

import Pagination from "@/components/tables/Pagination";
import { getStudent } from "@/lib/api";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import StudentCard from "@/components/common/StudentCard";
import StudentDataTable from "@/components/tables/StudentDataTable";
import { setCurrentPage, setFilters, setSearchQuery, setSort, setStudents, setTotal, setTotalPages } from "@/store/slices/studentSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import FilterBox from "@/components/form/input/FilterBox";
import { Tooltip } from "@heroui/react";
import useDebounce from "@/hooks/useDebounce";
import { useFetchAllBatches } from "@/hooks/queries/useQueryFetchBatchData";
import { PAGE_SIZE } from "@/constants/pagination";

export default function StudentTable() {
  const { students, error } = useSelector((state: RootState) => state.student);
  const totalCount = useSelector((state: RootState) => state.student.total);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const {
    currentPage,
    searchQuery,
    totalPages,
    filters,
    sortField,
    sortOrder,
  } = useSelector((state: RootState) => state.student);

  console.log("Get Student All:", students);

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  };

  const {
      data: courseData,
      isLoading: courseLoading,
      isError: courseError,
    } = useFetchCourse();

    const {
      data: batchData,
      isLoading: batchLoading,
      isError: batchError,
    } = useFetchAllBatches({ onlyAvailable: true });
  
    useEffect(() => {
      if (courseData?.course) {
        dispatch(setCourses(courseData.course));
      }
    }, [courseData, dispatch]);

    useEffect(() => {
      if (batchData?.batch) { 
        dispatch(setBatches(batchData.batch));
      };
    }, [batchData, dispatch]);

    console.log("GET COURSE DATA in STUDENT TABLE:", course);
    console.log("GET BATCH DATA in STUDENT TABLE:", batch);

    const courseOptions = course.map(course => ({
    label: course.name,   // what user sees
    value: course.id,     // what backend uses
  }));

  // --- Debounced search and Set delay time according to your needs
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // 2. sync debounced value to Redux
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);


  // Fetch data on mount or when filters change
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token missing from sessionStorage");
        return;
      }

      setLoading(true);
      try {
        const response = await getStudent({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters
        });

        dispatch(setStudents(response.data || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setCurrentPage(currentPage || 1)); // reset page when search changes
        dispatch(setTotal(response.total || 0));
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);

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

  const handleFilters = useCallback((selectedFilters: Record<string, string | null>) => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch]);

  console.log("student redux data:", currentPage, searchQuery, totalPages, totalCount);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Students Lists">
          <div className="flex justify-between w-full items-end">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

        <div className="flex justify-centre items-center gap-3">
          <FilterBox
              onFilterChange={handleFilters}
              filterFields={[
                {
                  label: "Course",
                  key: "courseId", // 🔑 important
                  type: "select",
                  options: courseOptions,
                },
                { label: "Admission Date", key: "admissionDate", type: "date" },
              ]}
            />
            <span
              className="cursor-pointer"
              onClick={() => {
                dispatch(setCurrentPage(1));       // 👈 reset to page 1
                dispatch(setSearchQuery(searchQuery)); 
              }}
            >
              <Tooltip
                className="rounded bg-gray-200 text-[10px]"
                content="Reload"
              >
                <div className="items-center rounded-lg border border-gray-200 bg-gray-50 px-[10px] py-[10px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <svg
                    className="dark:text-gray-300"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43511 18.2543 3.35177 14.5M2 10V4M2 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Tooltip>
            </span>
          </div>      
        </div>

          <StudentDataTable
            students={students}
            batch={batch}
            course={course}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            title="Students"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
