"use client";

import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getBatch, getCourse, getEnquiry, getWonEnquiry } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import AdmissionDataTable from "@/components/tables/AdmissionDataTable";
import StudentCard from "@/components/common/StudentCard";
import { setCourses } from "@/store/slices/courseSlice";
import { setBatches } from "@/store/slices/batchSlice";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import { setCurrentPage, setAdmissions, setFilters, setSearchQuery, setSort, setTotal, setTotalPages } from "@/store/slices/admissionSlice";

export default function AdmissionTable() {
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const admission = useSelector((state: RootState) => state.admission.admissions);
  const total = useSelector((state: RootState) => state.admission.total);
  const totalPages = useSelector((state: RootState) => state.admission.totalPages);
  const [loading, setLoading] = useState<boolean>(false);
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );
  const {
      currentPage,
      searchQuery,
      sortOrder,
      sortField,
    } = useSelector((state: RootState) => state.admission);

  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const leadStatusOptions = [null, "HOT", "WARM", "COLD"] as const;

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
        const response = await getWonEnquiry({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus, // 👈 Add this
        });

        console.log("RESPONSE IN Admission USEEFFECT:", response);

        dispatch(setAdmissions(response.data || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 0))
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus]);

  useEffect(() => {
    const fetchMeta = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token missing from sessionStorage");
        return;
      }
      try {
        const responseCourse = await getCourse({
          token,
        });

        dispatch(setCourses(responseCourse.course));

        const responseBatch = await getBatch({
          token,
        });

        dispatch(setBatches(responseBatch.batch));
      } catch (error) {}
    };

    fetchMeta();
  }, []);

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

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Admission Lists">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <AdmissionDataTable
            admissions={admission}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            title="Pending Admissions"
            totalCount={total}
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
