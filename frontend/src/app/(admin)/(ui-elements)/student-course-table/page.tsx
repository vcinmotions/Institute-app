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
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import StudentCard from "@/components/common/StudentCard";
import StudentCourseDataTable from "@/components/tables/StudentCourseDataTable";
import {
  setStudentCourse,
  setStudentDetail,
} from "@/store/slices/studentCourseSlice";
import FilterBox from "@/components/form/input/FilterBox";
import { setBatches } from "@/store/slices/batchSlice";
import { setCourses } from "@/store/slices/courseSlice";
import { setFaculties } from "@/store/slices/facultySlice";

export default function StudentCourseTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const { studentCourse } = useSelector(
    (state: RootState) => state.studentCourse,
  );
  const studentDetails = useSelector(
    (state: RootState) => state.studentCourse.studentDetails,
  );
  useSelector((state: RootState) => state.student);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("startDate");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const batch = useSelector((state: RootState) => state.batch.batches);
  const course = useSelector((state: RootState) => state.course.courses);
  const faculty = useSelector((state: RootState) => state.faculty.faculties);
  const leadStatusOptions = [null, "HOT", "WARM", "COLD"] as const;

  const [filters, setFilters] = useState<Record<string, string | null>>({});

  // called when filters applied
  const handleFilters = (selectedFilters: Record<string, string | null>) => {
    console.log("Selected filters:", selectedFilters);
    setFilters(selectedFilters);
    setCurrentPage(1);
  };

  console.log("Get all studentCourse:", studentCourse);

  console.log("get All Students Deails;", studentDetails);

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  };

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
    fetchBatchCourse();
  }, []);

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
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters, // 👈 send filters to API
        });

        dispatch(setStudentCourse(response.studentCourse || []));
        dispatch(setStudentDetail(response.detailedCourses || []));
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);

  const fetchBatchCourse = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token missing from sessionStorage");
      return;
    }

    setLoading(true);
    try {
      const responseBatch = await getBatch({
        token,
        page: currentPage,
        limit: 5,
        search: searchQuery,
        sortField,
        sortOrder,
        ...filters, // 👈 send filters to API
      });

      const responseCourse = await getCourse({
        token,
        page: currentPage,
        limit: 5,
        search: searchQuery,
        sortField,
        sortOrder,
        ...filters, // 👈 send filters to API
      });

      const responsefaculty = await getFaculty({
        token,
        page: currentPage,
        limit: 5,
        search: searchQuery,
        sortField,
        sortOrder,
        ...filters, // 👈 send filters to API
      });

      dispatch(setBatches(responseBatch.batch || []));
      dispatch(setCourses(responseCourse.course || []));
      dispatch(setFaculties(responsefaculty.faculty || []));
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("Query data:", currentPage, searchQuery, totalPages);
  console.log(
    "GET BATCH AND COURSE DATA IN SRTUDENYTCOURSE DATA TABLE:",
    batch,
    course,
  );

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
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
