"use client";

import Search from "@/components/form/input/Search";

import Pagination from "@/components/tables/Pagination";
import { getBatch, getLab } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";

import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import BatchDataTable from "@/components/tables/BatchDataTable";
import BatchForm from "@/components/form/form-elements/BatchCreateForm";
import { setBatches, setCurrentPage, setSearchQuery, setTotal, setTotalPages, setSort, setFilters } from "@/store/slices/batchSlice";
import { setLab } from "@/store/slices/labSlice";
import StudentCard from "@/components/common/StudentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";

export default function BatchTable() {
  const [showForm, setShowForm] = useState(false);
  const { currentPage, total, totalPages, searchQuery, sortField, sortOrder,  } = useSelector((state: RootState) => state.batch)
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const batch = useSelector((state: RootState) => state.batch.batches);
  const labs = useSelector((state: RootState) => state.lab.labs);
  const [loading, setLoading] = useState<boolean>(false);
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  };

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
        const response = await getBatch({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
        });

        dispatch(setBatches(response.data || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 0));
      } catch (error) {
        console.error("Error fetching batch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder]);

  useEffect(() => {
    const fetchLab = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token missing from sessionStorage");
        return;
      }

      setLoading(true);
      try {
        const responseLab = await getLab({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
        });

        dispatch(setLab(responseLab.labs));
      } catch (error) {
        console.error("ERROR IN FETCHING LAB DATA IN BATCHTABLE");
      }
    };
    fetchLab();
  }, [totalPages]);

  console.log("Query data:", currentPage, searchQuery, totalPages);

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
        <StudentCard title="Batch Lists" onCreateClick={handleCreateClick}>
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <BatchDataTable
            batch={batch}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            title="Bathes"
            totalCount={total}
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>

      {showForm && <BatchForm onCloseModal={handleCloseModal} labs={labs} />}
    </div>
  );
}
