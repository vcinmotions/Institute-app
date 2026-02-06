"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getRoles } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import RolesDataTable from "@/components/tables/RolesDataTable";
import { setCurrentPage, setRoles, setSearchQuery, setTotal, setTotalPages } from "@/store/slices/rolesSlices";
import RolesForm from "@/components/form/form-elements/RolesForm";
import StudentCard from "@/components/common/StudentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";

export default function RolesTable() {
  const [showForm, setShowForm] = useState(false);
  const { currentPage, totalPages, searchQuery, total } = useSelector((state: RootState) => state.role);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const roles = useSelector((state: RootState) => state.role.roles);
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
         const response = await getRoles(
            token,
            currentPage,
            PAGE_SIZE, // limit
            searchQuery
          );

        dispatch(setRoles(response.roles || []));
        dispatch(setTotalPages(response.totalPages || 0));
        dispatch(setTotal(response.totalCount || 0));
      } catch (error) {
        console.error("Error fetching Courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus]);

  console.log("Query data:", currentPage, searchQuery, totalPages);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setCurrentPage(1));
      }, [dispatch]);
    
      const handlePagination = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
      }, [dispatch, totalPages]);


  console.log("GET ROLE SEARCH:", searchQuery, searchInput, totalPages);
  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Role User Lists">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <RolesDataTable
            roles={roles}
            loading={loading}

          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>

    </div>
  );
}
