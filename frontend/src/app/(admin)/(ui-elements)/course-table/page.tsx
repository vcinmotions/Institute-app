"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getBatch, getCourse, getEnquiry } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import CourseDataTable from "@/components/tables/CourseDataTable";
import CourseForm from "@/components/form/form-elements/CreateNewCourseForm";
import { setCourses, setCurrentPage, setSearchQuery, setSort, setTotal, setTotalPages } from "@/store/slices/courseSlice";
import StudentCard from "@/components/common/StudentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";

export default function CourseTable() {
  const [showForm, setShowForm] = useState(false);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const batch = useSelector((state: RootState) => state.batch.batches ?? []);
  const courses = useSelector((state: RootState) => state.course.courses ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentPage, total, totalPages, searchQuery, sortField, sortOrder } = useSelector((state: RootState) => state.course);
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  };

  // Debounce effect: update searchQuery 1 second after user stops typing
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
        const response = await getCourse({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
        });

        console.log("COURSE IN COURSE TABLE:", response);

        dispatch(setCourses(response.course || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 0));
      } catch (error) {
        console.error("Error fetching Courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder]);


  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

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

  const handleCreateClick = () => {
    setShowForm(!showForm);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Course Lists" onCreateClick={handleCreateClick}>
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <CourseDataTable
            courses={courses}
            batch={batch}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={total}
            title="Courses"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>

      {showForm && <CourseForm onCloseModal={handleCloseModal} batch={batch} />}
    </div>
  );
}
