"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import EnquiryForm from "@/components/form/form-elements/EnquiryForm";
import Search from "@/components/form/input/Search";
import EnquiryDataTable from "@/components/tables/EnquiryDataTable";
import Pagination from "@/components/tables/Pagination";
import { getEnquiry } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import {
  setCurrentPage,
  setEnquiries,
  setFilteredEnquiries,
} from "@/store/slices/enquirySlice";
import React, { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react";
import StudentCard from "@/components/common/StudentCard";

export default function EnquiryTable() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const enquiries = useSelector((state: RootState) => state.enquiry.enquiries);
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("createdAt");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | null>(
    null,
  );

  const searchRef = useRef<HTMLInputElement>(null);
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
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     switch (e.key) {
  //       case "F2":
  //         e.preventDefault();
  //         setShowForm(!showForm);
  //         break;

  //       // case "F4":
  //       //   e.preventDefault();
  //       //   router.push("/dashboard/batch");
  //       //   break;

  //       // case "F8":
  //       //   e.preventDefault();
  //       //   router.push("/dashboard/lab");
  //       //   break;

  //       // case "F9":
  //       //   e.preventDefault();
  //       //   router.push("/dashboard/course");
  //       //   break;
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, []);

    // useEffect(() => {
    //   const handleKeyDown = (e: KeyboardEvent) => {
    //     if (e.key === "F2") {
    //       e.preventDefault();
    //       setShowForm(prev => !prev);
    //     }

    //     if (e.key === "Escape") {
    //       e.preventDefault();
    //       setShowForm(false);
    //     }
    //   };

    //   window.addEventListener("keydown", handleKeyDown);
    //   return () => window.removeEventListener("keydown", handleKeyDown);
    // }, []);


  // Debounce effect: update searchQuery 1 second after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      dispatch(setCurrentPage(1)); // reset page when search changes
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Focus on "K" press
// Focus on "K" press
// useEffect(() => {
//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (document.activeElement !== searchRef.current && e.key.toLowerCase() === "k") {
//       e.preventDefault();
//       searchRef.current?.focus();
//     }
//   };
//   window.addEventListener("keydown", handleKeyDown);
//   return () => window.removeEventListener("keydown", handleKeyDown);
// }, []);


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
        const response = await getEnquiry({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus, // 👈 Add this
        });

        dispatch(setEnquiries(response.enquiry || []));
        dispatch(setFilteredEnquiries(response.filteredEnquiries)); // filtered ones
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus]);

  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePagination = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setCurrentPage(page));
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

  console.log("GET ENQUIRY SERACH INPUT:", searchInput, searchQuery);
  console.log("GET ENQUIRY CURRENT PAAGE:", currentPage);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Enquiry Lists" onCreateClick={handleCreateClick}>
          <Search
            ref={searchRef}
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <EnquiryDataTable
            enquiries={enquiries}
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

      {showForm && <EnquiryForm onCloseModal={handleCloseModal} courses={[]} />}
    </div>
  );
}
