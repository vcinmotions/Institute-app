"use client";
import Search from "@/components/form/input/Search";

import Pagination from "@/components/tables/Pagination";
import { getBatch, getCourse, getStudent } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import StudentCard from "@/components/common/StudentCard";
import StudentDataTable from "@/components/tables/StudentDataTable";
import { setCurrentPage, setFilters, setSearchQuery, setSort, setStudents, setTotal } from "@/store/slices/studentSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import FilterBox from "@/components/form/input/FilterBox";
import { Tooltip } from "@heroui/react";

export default function StudentTable() {
  const [showForm, setShowForm] = useState(false);
  //const [filters, setFilters] = useState<Record<string, string | null>>({});
  //const [searchQuery, setSearchQuery] = useState("");
  //const currentPage = useSelector((state: RootState) => state.student.currentPage);
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const { students, error } = useSelector((state: RootState) => state.student);
  const totalCount = useSelector((state: RootState) => state.student.total);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const [loading, setLoading] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState(0);
  //const [sortField, setSortField] = useState("admissionDate");
  //const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
  //   null,
  // );
  //const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const leadStatusOptions = [null, "HOT", "WARM", "COLD"] as const;

  const {
    currentPage,
    searchQuery,
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
  
    useEffect(() => {
      if (courseData?.course) {
        dispatch(setCourses(courseData.course));
      }
    }, [currentPage, courseData, dispatch]);

    console.log("GET COURSE DATA in Add Course To Studemt:", course);

    const courseOptions = course.map(course => ({
    label: course.name,   // what user sees
    value: course.id,     // what backend uses
  }));

  // Debounce effect: update searchQuery 1 second after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      // setSearchQuery(searchInput);
      dispatch(setSearchQuery(searchInput));
      dispatch(setCurrentPage(1)); // reset page when search changes
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchBatch();
  }, [currentPage]);

  const fetchBatch = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token missing from sessionStorage");
      return;
    }

    setLoading(true);
    try {
      const response = await getBatch({
        token,
        page: currentPage,
        limit: 5,
        search: searchQuery,
        sortField,
        sortOrder,
      });

      dispatch(setBatches(response.batch || []));
    } catch (error) {
      console.error("Error fetching Courses:", error);
    } finally {
      setLoading(false);
    }
  };

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
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters
        });

        dispatch(setStudents(response.student || []));
        setTotalPages(response.totalPages || 1);
        dispatch(setCurrentPage(currentPage)); // reset page when search changes
        dispatch(setTotal(response.totalCount || 0));
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, filters, reloadKey]);

  console.log("Query data:", currentPage, searchQuery, totalPages);

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  // called when filters applied
  const handleFilters = (selectedFilters: Record<string, string | null>) => {
    // console.log("Selected filters:", selectedFilters);
    // dispatch(setFilters(selectedFilters));
    // dispatch(setCurrentPage(1));
    dispatch(setFilters(selectedFilters));
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1)); // Reset to first page when searching
  };

  const handlePagination = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setCurrentPage(page));
  };

  const handleSort = (field: string) => {
    //const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    // setSortField(field);
    // setSortOrder(order);
    // setLeadStatus(leadStatus);
    const order =
    field === sortField && sortOrder === "asc" ? "desc" : "asc";

    dispatch(setSort({ field, order }));
  };

  console.log("CUrrent page in student table:", currentPage);

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
                            setReloadKey(prev => prev + 1); // 👈 force reload
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
