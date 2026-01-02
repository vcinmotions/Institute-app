"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getBatch, getCourse, getFaculty } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { setCourses } from "@/store/slices/courseSlice";
import FacultyForm from "@/components/form/form-elements/FacultyCreateForm";
import FacultyDataTable from "@/components/tables/FacultyDataTable";
import { setFaculties } from "@/store/slices/facultySlice";
import { setBatches } from "@/store/slices/batchSlice";
import StudentCard from "@/components/common/StudentCard";

export default function FacultyTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const faculties = useSelector((state: RootState) => state.faculty.faculties);
  const courses = useSelector((state: RootState) => state.course.courses);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("createdAt");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const leadStatusOptions = [null, "HOT", "WARM", "COLD"] as const;

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // useEffect(() => {
  //       const handleKeyDown = (e: KeyboardEvent) => {
  //         if (e.key === "F10") {
  //           e.preventDefault();
  //           setShowForm(prev => !prev); // ✅ FIXED toggle
  //         }

  //         if (e.key === "Escape") {
  //         e.preventDefault();
  //         setShowForm(false);
  //       }
  //       };
      
  //       window.addEventListener("keydown", handleKeyDown);
  //       return () => window.removeEventListener("keydown", handleKeyDown);
  //     }, []);

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
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus, // 👈 Add this
        });

        console.log("geting faculty Details:", response.faculty);

        const responseCourse = await getCourse({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus, // 👈 Add this
        });

        dispatch(setCourses(responseCourse.course));

        const responseLab = await getBatch({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus, // 👈 Add this
        });

        dispatch(setBatches(responseLab.batch));

        dispatch(setFaculties(response.faculty || []));
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching faculty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus]);

  console.log("faculty Query data:", currentPage, searchQuery, totalPages);

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

  const handleCreateClick = () => {
    setShowForm(!showForm);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  const handleSort = (field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setLeadStatus(leadStatus);
  };

  const handleLeadStatus = (field: string) => {
    const currentIndex = leadStatusOptions.indexOf(leadStatus);
    const nextStatus =
      leadStatusOptions[(currentIndex + 1) % leadStatusOptions.length];
    setLeadStatus(nextStatus);
    setCurrentPage(1); // Reset pagination on status change
  };

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Faculty Lists" onCreateClick={handleCreateClick}>
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
            onSort={handleSort}
            onLeadStatus={handleLeadStatus}
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

      {showForm && (
        <FacultyForm
          onCloseModal={handleCloseModal}
          courses={courses}
          batch={batch}
        />
      )}
    </div>
  );
}
