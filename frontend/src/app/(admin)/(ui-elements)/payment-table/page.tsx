"use client";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";


import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import FilterBox from "@/components/form/input/FilterBox";
import PaymentDataTable from "@/components/tables/PaymentDataTable";
import OpeningBalanceForm from "@/components/form/form-elements/OpeningBalanceCreateForm";

import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import {
  setCurrentPage,
  setFilters,
  setSearchQuery,
  setSort
} from "@/store/slices/paymentSlice";
import { useFetchPayment } from "@/hooks/queries/useQueryFetchPayment";

export default function PaymentTable() {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [paymentType, setPaymentType] = useState<"ONE_TIME" | "INSTALLMENT" | null>(null);
  const paymentTypeOptions = [null, "ONE_TIME", "INSTALLMENT"] as const;

  // 1. Get query parameters from Redux UI Slice
  const { searchQuery, sortField, sortOrder, currentPage, filters } = useSelector(
    (state: RootState) => state.payment
  );

  // 2. React Query Hook replaces local loading states and manual dispatch useEffects
  const {
    data,
    isLoading,
    isError,
    error
  } = useFetchPayment({
    currentPage,
    searchQuery,
    sortField,
    sortOrder,
    filters,
  });

  // Extract variables safely from React Query's cached response data object
  const paymentsList = data?.data || [];
  console.log("PAYMENTS DATA IN PAYENT TABLE:", paymentsList)
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // 3. Debounce search handling
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  };

  const debouncedSearchTerm = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // 4. Handlers (memoized)
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
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  const handlePaymentType = (field: string) => {
    const currentIndex = paymentTypeOptions.indexOf(paymentType);
    const nextType = paymentTypeOptions[(currentIndex + 1) % paymentTypeOptions.length];
    setPaymentType(nextType);
    dispatch(setCurrentPage(1));
  };

  const handleCreateClick = () => setShowForm(!showForm);
  const handleCloseModal = () => setShowForm(false);

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between">
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <div className="flex gap-2">
            <FilterBox
              onFilterChange={handleFilters}
              filterFields={[
                {
                  label: "Payment Status",
                  key: "paymentStatus",
                  type: "select",
                  options: [
                    { label: "SUCCESS", value: "SUCCESS" },
                    { label: "PENDING", value: "PENDING" },
                    { label: "FAILED", value: "FAILED" },
                  ],
                },
                {
                  label: "Payment Mode",
                  key: "paymentMode",
                  type: "select",
                  options: [
                    { label: "Cash", value: "CASH" },
                    { label: "UPI", value: "UPI" },
                    { label: "Card", value: "CARD" },
                  ],
                },
                { label: "From Date", key: "fromDate", type: "date" },
                { label: "To Date", key: "toDate", type: "date" },
              ]}
            />

            <button
              type="button"
              onClick={handleCreateClick}
              className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              + Create Record
            </button>
          </div>
        </div>

        {isError && (
          <div className="text-red-500 text-xs p-2 bg-red-50 dark:bg-red-950/30 rounded">
            Error fetching payments: {(error as Error).message}
          </div>
        )}

        <PaymentDataTable
          payment={paymentsList}
          loading={isLoading} // React Query handles this natively now
          onPaymentType={handlePaymentType}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          limit={PAGE_SIZE}
          totalCount={totalCount}
          title="Student Payments"
          onPageChange={handlePagination}
        />
      </div>
      {showForm && <OpeningBalanceForm onCloseModal={handleCloseModal} />}
    </div>
  );
}