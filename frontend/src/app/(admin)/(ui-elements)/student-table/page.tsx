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
import { setStudents, setTotal } from "@/store/slices/studentSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { useFetchCourse } from "@/hooks/useQueryFetchCourseData";

export default function StudentTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const { students, error } = useSelector((state: RootState) => state.student);
  const totalCount = useSelector((state: RootState) => state.student.total);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("admissionDate");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const leadStatusOptions = [null, "HOT", "WARM", "COLD"] as const;

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
    }, [courseData, dispatch]);

    console.log("GET COURSE DATA in Add Course To Studemt:", course);

  // Debounce effect: update searchQuery 1 second after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // reset page when search changes
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchBatch();
  }, []);

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
        leadStatus, // 👈 Add this
      });

      dispatch(setBatches(response.batch || []));
      setTotalPages(response.totalPages || 1);
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
          leadStatus, // 👈 Add this
        });

        dispatch(setStudents(response.student || []));
        setTotalPages(response.totalPages || 1);
        dispatch(setTotal(response.totalCount || 0));
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus]);

  console.log("Query data:", currentPage, searchQuery, totalPages);

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePagination = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setLeadStatus(leadStatus);
  };

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Students Lists">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

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
