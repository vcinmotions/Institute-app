"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getBatch, getCourse, getEnquiry } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import CourseDataTable from "@/components/tables/CourseDataTable";
import CourseForm from "@/components/form/form-elements/CreateNewCourseForm";
import { setCourses } from "@/store/slices/courseSlice";
import { setBatches } from "@/store/slices/batchSlice";
import StudentCard from "@/components/common/StudentCard";

export default function CourseTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const courses = useSelector((state: RootState) => state.course.courses);
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
  //         switch (e.key) {
  //           case "F9":
  //             e.preventDefault();
  //             setShowForm(!showForm);
  //             break;
    
  //           // case "F4":
  //           //   e.preventDefault();
  //           //   router.push("/dashboard/batch");
  //           //   break;
    
  //           // case "F8":
  //           //   e.preventDefault();
  //           //   router.push("/dashboard/lab");
  //           //   break;
    
  //           // case "F9":
  //           //   e.preventDefault();
  //           //   router.push("/dashboard/course");
  //           //   break;
  //         }
  //       };
    
  //       window.addEventListener("keydown", handleKeyDown);
  //       return () => window.removeEventListener("keydown", handleKeyDown);
  //     }, []);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "F8") {
          e.preventDefault();
          setShowForm(prev => !prev); // ✅ FIXED toggle
        }

        if (e.key === "Escape") {
          e.preventDefault();
          setShowForm(false);
        }
      };
    
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

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
        const response = await getCourse({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus, // 👈 Add this
        });

        dispatch(setCourses(response.course || []));
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching Courses:", error);
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

      {showForm && <CourseForm onCloseModal={handleCloseModal} batch={batch} />}
    </div>
  );
}
