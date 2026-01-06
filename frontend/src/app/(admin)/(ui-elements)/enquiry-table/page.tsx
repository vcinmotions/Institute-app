"use client";
import EnquiryCard from "@/components/common/EnquiryCard";
import EnquiryForm from "@/components/form/form-elements/EnquiryForm";
import Search from "@/components/form/input/Search";
import EnquiryDataTable from "@/components/tables/EnquiryDataTable";
import Pagination from "@/components/tables/Pagination";
import { getCourse, getEnquiry } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import {
  setCurrentPage,
  setEnquiries,
  setFilteredEnquiries,
  setSearchQuery,
  setTotal,
} from "@/store/slices/enquirySlice";
import React, { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react";
import StudentCard from "@/components/common/StudentCard";
import { PencilIcon } from "@/icons";
import Button from "@/components/ui/button/Button";
import { Tooltip } from "@heroui/react";
import FilterBox from "@/components/form/input/FilterBox";
import { setCourses } from "@/store/slices/courseSlice";
import { useFetchCourse } from "@/hooks/useQueryFetchCourseData";

export default function EnquiryTable() {
  const [showForm, setShowForm] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  //const [enquiries, setEnquiries] = useState<any[]>([]);
  const enquiries = useSelector((state: RootState) => state.enquiry.enquiries);
  const courses = useSelector((state: RootState) => state.course.courses);
  const currentPage = useSelector((state: RootState) => state.enquiry.currentPage);
  const totalCount = useSelector((state: RootState) => state.enquiry.total);
  const searchQuery = useSelector((state: RootState) => state.enquiry.searchQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState("createdAt");
  const [leadStatus, setLeadStatus] = useState<"HOT" | "WARM" | "COLD" | "LOST" | "HOLD" | null>(
    null,
  );

  const [filters, setFilters] = useState<Record<string, string | null>>({});

  const searchRef = useRef<HTMLInputElement>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // 1. Separate state to track immediate input changes
  const [searchInput, setSearchInput] = useState("");
  const dispatch = useDispatch();
  const leadStatusOptions = [null, "HOT", "WARM", "COLD", "LOST", "HOLD"] as const;

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useFetchCourse();

   useEffect(() => {
      if (courseData?.course) {
        dispatch(setCourses(courseData.course));
      }
      setCourses;
    }, [currentPage, courseData, dispatch]);

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
      // setSearchQuery(searchInput);
      dispatch(setSearchQuery(searchInput));
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
          ...filters, // 👈 send filters to API
        });

        console.log("TOTAL PAGES IN GET ENQUIRY IN ENQUIRY TABLE:", response);

        dispatch(setEnquiries(response.enquiry || []));
        dispatch(setFilteredEnquiries(response.filteredEnquiries)); // filtered ones
        setTotalPages(response.totalPages || 1);
        dispatch(setTotal(response.totalCount || 0));
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus, filters]);
  // const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

  const courseOptions = courses.map(course => ({
    label: course.name,   // what user sees
    value: course.id,     // what backend uses
  }));

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

  // called when filters applied
  const handleFilters = (selectedFilters: Record<string, string | null>) => {
    console.log("Selected filters:", selectedFilters);
    setFilters(selectedFilters);
    setCurrentPage(1);
  };

  const handleLeadStatus = (field: string) => {
    const currentIndex = leadStatusOptions.indexOf(leadStatus);
    const nextStatus =
      leadStatusOptions[(currentIndex + 1) % leadStatusOptions.length];
    setLeadStatus(nextStatus);
    dispatch(setCurrentPage(1)); // Reset pagination on status change
  };

  console.log("GET ENQUIRY SERACH INPUT:", searchInput, searchQuery);
  console.log("GET ENQUIRY CURRENT PAAGE:", currentPage);
  console.log("GET COURSES IN ENQUIRY TABLE:", courses);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Enquiry Lists" onCreateClick={handleCreateClick}>
          <div className="flex justify-between w-full items-end">
          <Search
            ref={searchRef}
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

       <div className="flex justify-centre items-center gap-3">
          
          <FilterBox
              onFilterChange={handleFilters}
              filterFields={[
                {
                  label: "Lead Status",
                  key: "leadStatus",
                  type: "select",
                  options: [
                    { label: "WON", value: "WON" },
                    { label: "HOLD", value: "HOLD" },
                    { label: "LOST", value: "LOST" },
                    { label: "WARM", value: "WARM" },
                    { label: "HOT", value: "HOT" },
                  ],
                },
                {
                  label: "Course",
                  key: "courseId", // 🔑 important
                  type: "select",
                  options: courseOptions,
                },
                { label: "Create Date", key: "createDate", type: "date" },
              ]}
            />

            <span
              className="cursor-pointer"
              onClick={() => {
                dispatch(setCurrentPage(1));       // 👈 reset to page 1
              }}
            >
              <Tooltip
                className="rounded bg-gray-200 text-[10px]"
                content="Reload"
              >
                <div className="items-center rounded-lg border border-gray-200 bg-gray-50 px-[10px] py-[10px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <svg
                    className="dark:text-gray-300"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43511 18.2543 3.35177 14.5M2 10V4M2 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Tooltip>

            </span>
            </div>
          
          </div>

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
            totalCount={totalCount}
            title="Enquiries"
            totalPages={totalPages}
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>

      {showForm && <EnquiryForm onCloseModal={handleCloseModal} courses={[]} />}
    </div>
  );
}
