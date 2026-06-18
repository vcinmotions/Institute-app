"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getBatch, getCourse, getFaculty } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import { setCourses } from "@/store/slices/courseSlice";
import FacultyForm from "@/components/form/form-elements/FacultyCreateForm";
import FacultyDataTable from "@/components/tables/FacultyDataTable";
import { setCurrentPage, setFaculties, setSearchQuery, setTotal, setTotalPages } from "@/store/slices/facultySlice";
import { setBatches } from "@/store/slices/batchSlice";
import StudentCard from "@/components/common/StudentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";

export default function FacultyTable() {
  const [showForm, setShowForm] = useState(false);

  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const faculties = useSelector((state: RootState) => state.faculty.faculties);
  const { total, totalPages, currentPage, searchQuery } = useSelector((state: RootState) => state.faculty);
  const courses = useSelector((state: RootState) => state.course.courses);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
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
        const response = await getFaculty({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,

        });

        console.log("geting faculty Details:", response.faculty);

        const responseCourse = await getCourse({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
        });

        dispatch(setCourses(responseCourse.course));

        const responseLab = await getBatch({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
        });

        dispatch(setBatches(responseLab.batch));

        dispatch(setFaculties(response.faculty || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.totalCount || 0));
      } catch (error) {
        console.error("Error fetching faculty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery]);

  console.log("faculty Query data:", currentPage, searchQuery, totalPages);

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
  }, [dispatch, totalPages]);


  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Faculty Lists">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <FacultyDataTable
            faculties={faculties}
            courses={courses}
            batch={batch}
            loading={loading}
          />

          <Pagination
            currentPage={currentPage}
            limit={PAGE_SIZE}
            totalPages={totalPages}
            title="Faculties"
            totalCount={total}
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>

    </div>
  );
}
