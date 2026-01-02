"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getPayment } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import StudentCard from "@/components/common/StudentCard";
import { setPayment } from "@/store/slices/paymentSlice";
import PaymentDataTable from "@/components/tables/PaymentDataTable";
import FilterBox from "@/components/form/input/FilterBox";

export default function PaymentTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const studentDetails = useSelector(
    (state: RootState) => state.studentCourse.studentDetails,
  );
  const { payment } = useSelector((state: RootState) => state.payment);
  useSelector((state: RootState) => state.student);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("paymentDate");
  const [paymentType, setPaymentType] = useState<
    "ONE_TIME" | "INSTALLMENT" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const [filterInput, setFilterInput] = useState("");
  const dispatch = useDispatch();
  const paymentTypeOptions = [null, "ONE_TIME", "INSTALLMENT"] as const;
  const [filters, setFilters] = useState<Record<string, string | null>>({});

  // called when filters applied
  const handleFilters = (selectedFilters: Record<string, string | null>) => {
    console.log("Selected filters:", selectedFilters);
    setFilters(selectedFilters);
    setCurrentPage(1);
  };

  console.log("Get all payment:", payment);

  console.log("get All Students Deails;", studentDetails);

  // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
  // Update searchInput immediately on typing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

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
        const response = await getPayment({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          ...filters, // 👈 send filters to API
        });

        dispatch(setPayment(response.studentPayment || []));
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, filters]);

  console.log("Query data:", currentPage, searchQuery, totalPages, filters);

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

  const handleSort = (field: string) => {
    const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setPaymentType(paymentType);
  };

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
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}
