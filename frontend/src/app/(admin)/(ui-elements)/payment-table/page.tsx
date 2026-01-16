"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getPayment } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect, useCallback } from "react";
import StudentCard from "@/components/common/StudentCard";
import { setCurrentPage, setFilters, setPayment, setSearchQuery, setSort, setTotal, setTotalPages } from "@/store/slices/paymentSlice";
import PaymentDataTable from "@/components/tables/PaymentDataTable";
import FilterBox from "@/components/form/input/FilterBox";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";

export default function PaymentTable() {
  const studentDetails = useSelector(
    (state: RootState) => state.studentCourse.studentDetails,
  );
  const { payment, searchQuery, sortField, sortOrder, currentPage, filters, total, totalPages } = useSelector((state: RootState) => state.payment);
  const [loading, setLoading] = useState<boolean>(false);

  const [paymentType, setPaymentType] = useState<
    "ONE_TIME" | "INSTALLMENT" | null
  >(null);

  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const paymentTypeOptions = [null, "ONE_TIME", "INSTALLMENT"] as const;

  // called when filters applied

  console.log("Get all payment:", payment);

  console.log("get All Students Deails;", studentDetails);

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
        const response = await getPayment({
          token,
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters, // 👈 send filters to API
        });

        dispatch(setPayment(response.data || []));
        dispatch(setTotalPages(response.totalPages || 1));
        dispatch(setTotal(response.total || 1));
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);


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
      dispatch(setCurrentPage(1));
    }, [dispatch]);

  const handlePaymentType = (field: string) => {
    const currentIndex = paymentTypeOptions.indexOf(paymentType);
    const nextType =
      paymentTypeOptions[(currentIndex + 1) % paymentTypeOptions.length];
    setPaymentType(nextType);
    setCurrentPage(1); // Reset pagination on status change
  };

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Student Payment Lists">
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
          </div>

          <PaymentDataTable
            payment={payment}
            loading={loading}
            onPaymentType={handlePaymentType}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={total}
            title="Student Payments"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
