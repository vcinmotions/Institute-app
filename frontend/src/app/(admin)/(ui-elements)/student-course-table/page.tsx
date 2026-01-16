"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import {
  getBatch,
  getCourse,
  getFaculty,
  getStudentCourse,
} from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import StudentCard from "@/components/common/StudentCard";
import StudentCourseDataTable from "@/components/tables/StudentCourseDataTable";
import {
  setStudentCourse,
  setStudentDetail,
  setTotal,
  setTotalPages, setCurrentPage, setFilters,
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

export default function StudentCourseTable() {

  const { studentCourse, searchQuery, totalPages, currentPage, filters, total, sortField, sortOrder } = useSelector(
    (state: RootState) => state.studentCourse,
  );
  const studentDetails = useSelector(
    (state: RootState) => state.studentCourse.studentDetails,
  );
  useSelector((state: RootState) => state.studentCourse);
  const [loading, setLoading] = useState<boolean>(false);
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const faculty = useSelector((state: RootState) => state.faculty.faculties);

  console.log("Get all studentCourse:", studentCourse);

  console.log("get All Students Deails;", studentDetails);

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchCourse();

  const {
    data: batchData,
    isLoading: batchLoading,
    isError: batchError,
  } = useFetchAllBatches();

  const {
    data: facultyData,
    isLoading: facultyLoading,
    isError: facultyError,
  } = useFetchFaculty();

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

  useEffect(() => {
    if (facultyData?.faculty) {
      dispatch(setFaculties(facultyData.faculty));
    }
  }, [facultyData, dispatch]);

  console.log("GET COURSE DATA in STUDENT TABLE:", course);
  console.log("GET BATCH DATA in STUDENT TABLE:", batch);
  console.log("GET FACULTY DATA in STUDENT TABLE:", faculty);

  // --- Debounced search and Set delay time according to your needs
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // 2. sync debounced value to Redux
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // useEffect(() => {
  //   fetchBatchCourse();
  // }, []);

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
        const response = await getStudentCourse({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters, // 👈 send filters to API
        });

        dispatch(setStudentCourse(response.data || []));
        dispatch(setStudentDetail(response.detailedCourses || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 0));
      } catch (error) {
        console.error("Error fetching student course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);

  // const fetchBatchCourse = async () => {
  //   const token = sessionStorage.getItem("token");
  //   if (!token) {
  //     console.error("Token missing from sessionStorage");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const responseBatch = await getBatch({
  //       token,
  //       page: currentPage,
  //       limit: 5,
  //       search: searchQuery,
  //       sortField,
  //       sortOrder,
  //       ...filters, // 👈 send filters to API
  //     });

  //     const responseCourse = await getCourse({
  //       token,
  //       page: currentPage,
  //       limit: 5,
  //       search: searchQuery,
  //       sortField,
  //       sortOrder,
  //       ...filters, // 👈 send filters to API
  //     });

  //     const responsefaculty = await getFaculty({
  //       token,
  //       page: currentPage,
  //       limit: 5,
  //       search: searchQuery,
  //       sortField,
  //       sortOrder,
  //       ...filters, // 👈 send filters to API
  //     });

  //     dispatch(setBatches(responseBatch.batch || []));
  //     dispatch(setCourses(responseCourse.course || []));
  //     dispatch(setFaculties(responsefaculty.faculty || []));
  //   } catch (error) {
  //     console.error("Error fetching enquiries:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



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
      const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
      dispatch(setSort({ field, order }));
    }, [dispatch, sortField, sortOrder]);
  
    const handleFilters = useCallback((selectedFilters: Record<string, string | null>) => {
      dispatch(setFilters(selectedFilters));
    }, [dispatch]);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Student Course Lists">
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
                  })), // ✅ dynamic
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

          <StudentCourseDataTable
            studentCourse={studentDetails}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={total}
            title="Student Courses"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
