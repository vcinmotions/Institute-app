"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getMasterUser, getTenant } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import CompanyDataTable from "@/components/tables/CompanyDataTable";
import { setTenant, setToken } from "@/store/slices/authSlice";
import CompanyForm from "@/components/form/form-elements/CompanyCreateForm";
import StudentCard from "@/components/common/StudentCard";

export default function CompanyTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const company = useSelector((state: RootState) => state.auth.tenant);
  
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
  //         const handleKeyDown = (e: KeyboardEvent) => {
  //           if (e.key === "F11") {
  //             e.preventDefault();
  //             setShowForm(prev => !prev); // ✅ FIXED toggle
  //           }

  //           if (e.key === "Escape") {
  //         e.preventDefault(); 
  //         setShowForm(false);
  //       }
  //         };
        
  //         window.addEventListener("keydown", handleKeyDown);
  //         return () => window.removeEventListener("keydown", handleKeyDown);
  //       }, []);

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

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.warn("No token found.");
        return; // ✅ return early to prevent `getUser(null)`
      }

      try {
        const data = await getTenant({token, page: currentPage, search: searchInput});
        setLoading(false); // ✅ All good, show dashboard
        console.log("👤 Get Master User Data in CompanyTable:", data);
        dispatch(setTenant(data.tenant));
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };

    fetchUser();
  }, [searchQuery, currentPage]);

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

  console.log("Get Search Input in mater-table", searchInput);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Companies Lists" onCreateClick={handleCreateClick}>
          <Search
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <CompanyDataTable
            company={company}
            loading={loading}
            onSort={handleSort}
            onLeadStatus={handleLeadStatus}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            title="Companies"
            totalCount={totalCount}
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>

      {showForm && <CompanyForm onCloseModal={handleCloseModal} />}
    </div>
  );
}
