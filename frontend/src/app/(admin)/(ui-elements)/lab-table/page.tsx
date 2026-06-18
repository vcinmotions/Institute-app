"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getLab } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
//import LabDataTable from "@/components/tables/LabDataTable";
import { setCurrentPage, setLab, setSearchQuery, setSort, setTotal, setTotalPages } from "@/store/slices/labSlice";
import LabForm from "@/components/form/form-elements/LabCreateForm";
import dynamic from "next/dynamic";
import StudentCard from "@/components/common/StudentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";

const LabDataTable = dynamic(
  () => import("@/components/tables/LabDataTable"),
  { ssr: false }
);

export default function LabTable() {
  const [showForm, setShowForm] = useState(false);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const lab = useSelector((state: RootState) => state.lab.labs);
  const courses = useSelector((state: RootState) => state.course.courses);
  const [loading, setLoading] = useState<boolean>(false);
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );
  const { currentPage, searchQuery, totalPages, sortField, sortOrder, total } = useSelector((state: RootState) => state.lab)
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  console.log("TOTAL", total);

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
        const response = await getLab({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
        });

        dispatch(setLab(response.labs || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 0));
        console.log("LOG LAB DATA:", response);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder]);

  console.log("Lab Query data:", currentPage, searchQuery, totalPages, sortField, sortOrder);

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleCreateClick = () => {
    setShowForm(!showForm);
  };

  const handleCloseModal = () => {
    setShowForm(false);
  };

  // const handleSort = (field: "isActive") => {
  //   const order =
  //     sortField === field && sortOrder === "desc" ? "asc" : "desc";

  //   setSortField(field);
  //   setSortOrder(order);
  //   dispatch(setCurrentPage(1));
  // };

  // --- Handlers (memoized)

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePagination = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
  }, [dispatch, totalPages]);

  const handleSort = useCallback((field: "isActive") => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    dispatch(setSort({ field, order }));
  }, [dispatch, sortField, sortOrder]);


  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Lab Lists" onCreateClick={handleCreateClick}>
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <LabDataTable
            lab={lab}
            loading={loading}
            courses={courses}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            limit={PAGE_SIZE}
            totalPages={totalPages}
            totalCount={total}
            title="Labs"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
      {showForm && <LabForm onCloseModal={handleCloseModal} />}
    </div>
  );
}
