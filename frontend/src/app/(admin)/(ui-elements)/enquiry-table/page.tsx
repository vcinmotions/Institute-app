
// "use client";
// import EnquiryCard from "@/components/common/EnquiryCard";
// import EnquiryForm from "@/components/form/form-elements/EnquiryForm";
// import Search from "@/components/form/input/Search";
// import EnquiryDataTable from "@/components/tables/EnquiryDataTable";
// import Pagination from "@/components/tables/Pagination";
// import { getCourse, getEnquiry } from "@/lib/api";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store"; // Adjust path if needed
// import { useDispatch } from "react-redux";
// import {
//   setCurrentPage,
//   setEnquiries,
//   setFilteredEnquiries,
//   setFilters,
//   setLeadStatus,
//   setSearchQuery,
//   setSort,
//   setTotal,
// } from "@/store/slices/enquirySlice";
// import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
// import StudentCard from "@/components/common/StudentCard";
// import { Tooltip } from "@heroui/react";
// import FilterBox from "@/components/form/input/FilterBox";
// import { setCourses } from "@/store/slices/courseSlice";
// import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";

// export default function EnquiryTable() {
//   const [showForm, setShowForm] = useState(false);
// ;
//   const [totalPages, setTotalPages] = useState(1);

//   const enquiries = useSelector((state: RootState) => state.enquiry.enquiries);
//   const courses = useSelector((state: RootState) => state.course.courses);

//   const totalCount = useSelector((state: RootState) => state.enquiry.total);

//   const [loading, setLoading] = useState<boolean>(false);

//   const {
//     currentPage,
//     searchQuery,
//     filters,
//     sortField,
//     sortOrder,
//     leadStatus,
//   } = useSelector((state: RootState) => state.enquiry);

//   //const [filters, setFilters] = useState<Record<string, string | null>>({});
//   //const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

//   // 1. Separate state to track immediate input changes
//   const [searchInput, setSearchInput] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   const dispatch = useDispatch();
//   const leadStatusOptions = [null, "HOT", "WARM", "COLD", "LOST", "HOLD"] as const;

//   const {
//     data: courseData,
//     isLoading: courseLoading,
//     isError: courseError,
//   } = useFetchCourse();

//    useEffect(() => {
//       if (courseData?.course) {
//         dispatch(setCourses(courseData.course));
//       };
//     }, [courseData, dispatch]);

//   // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
//   // Update searchInput immediately on typing
//   const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setSearchInput(e.target.value.toLocaleLowerCase());
//   };

//   // Debounce effect: update searchQuery 1 second after user stops typing
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       // setSearchQuery(searchInput);

//       if (searchInput !== searchQuery) {
//         dispatch(setSearchQuery(searchInput));
//         dispatch(setCurrentPage(1));
//       }
      
//       // dispatch(setSearchQuery(searchInput));
//       // dispatch(setCurrentPage(1)); // reset page when search changes
//     }, 300);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchInput]);

//   // Fetch data on mount or when filters change
//   useEffect(() => {
//     const fetchData = async () => {
//       const token = sessionStorage.getItem("token");
//       if (!token) {
//         return;
//       }

//       setLoading(true);
//       try {
//         const response = await getEnquiry({
//           token,
//           page: currentPage,
//           limit: 5,
//           search: searchQuery,
//           sortField,
//           sortOrder,
//           leadStatus, // 👈 Add this
//           ...filters, // 👈 send filters to API
//         });


//         dispatch(setEnquiries(response.enquiry || []));
//         dispatch(setFilteredEnquiries(response.filteredEnquiries)); // filtered ones
//         setTotalPages(response.totalPages || 1);
//         dispatch(setTotal(response.totalCount || 0));
//       } catch (error) {
//         console.error("Error fetching enquiries:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [currentPage, searchQuery, sortField, sortOrder, leadStatus, filters, reloadKey]);

//   const courseOptions = courses.map(course => ({
//     label: course.name,   // what user sees
//     value: course.id,     // what backend uses
//   }));

//   const handleSearchSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     dispatch(setCurrentPage(1)); // Reset to first page when searching
//   };

//   const handlePagination = (page: number) => {
//     if (page < 1 || page > totalPages) return;
//     dispatch(setCurrentPage(page));
//   };

//   const handleCreateClick = () => {
//     setShowForm(!showForm);
//   };

//   const handleCloseModal = () => {
//     setShowForm(false);
//   };

//   const handleSort = (field: string) => {
//     //const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
//     // setSortField(field);
//     // setSortOrder(order);
//     // setLeadStatus(leadStatus);

//     const order =
//     field === sortField && sortOrder === "asc" ? "desc" : "asc";

//     dispatch(setSort({ field, order }));
//   };

//   // called when filters applied
//   const handleFilters = (selectedFilters: Record<string, string | null>) => {
//     // console.log("Selected filters:", selectedFilters);
//     // setFilters(selectedFilters);
//     // dispatch(setCurrentPage(1));
//     dispatch(setFilters(selectedFilters));
//   };

//   const handleLeadStatus = (field: string) => {
//     // const currentIndex = leadStatusOptions.indexOf(leadStatus);
//     // const nextStatus =
//     //   leadStatusOptions[(currentIndex + 1) % leadStatusOptions.length];
//     // setLeadStatus(nextStatus);
//     // dispatch(setCurrentPage(1)); // Reset pagination on status change

//     const currentIndex = leadStatusOptions.indexOf(leadStatus);
//     const nextStatus =
//       leadStatusOptions[(currentIndex + 1) % leadStatusOptions.length];

//     dispatch(setLeadStatus(nextStatus));
//   };

//   return (
//     <div>
//       <div className="space-y-6">
//         <StudentCard title="Enquiry Lists" onCreateClick={handleCreateClick}>
//           <div className="flex justify-between w-full items-end">
//           <Search
//             value={searchInput}
//             onChange={handleSearchChange}
//             onSubmit={handleSearchSubmit}
//           />

//        <div className="flex justify-center items-center gap-3">
//           <FilterBox
//               onFilterChange={handleFilters}
//               filterFields={[
//                 {
//                   label: "Lead Status",
//                   key: "leadStatus",
//                   type: "select",
//                   options: [
//                     { label: "WON", value: "WON" },
//                     { label: "HOLD", value: "HOLD" },
//                     { label: "LOST", value: "LOST" },
//                     { label: "WARM", value: "WARM" },
//                     { label: "HOT", value: "HOT" },
//                   ],
//                 },
//                 {
//                   label: "Course",
//                   key: "courseId", // 🔑 important
//                   type: "select",
//                   options: courseOptions,
//                 },
//                 { label: "Create Date", key: "createDate", type: "date" },
//               ]}
//             />

//             <span
//               className="cursor-pointer"
//               onClick={() => {
//                 dispatch(setCurrentPage(1));       // 👈 reset to page 1
//                 setReloadKey(prev => prev + 1); // 👈 force reload
//               }}
//             >
//               <Tooltip
//                 className="rounded bg-gray-200 text-[10px]"
//                 content="Reload"
//               >
//                 <div className="items-center rounded-lg border border-gray-200 bg-gray-50 px-[10px] py-[10px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
//                   <svg
//                     className="dark:text-gray-300"
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <path d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43511 18.2543 3.35177 14.5M2 10V4M2 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </div>
//               </Tooltip>

//             </span>
//             </div>
//           </div>

//           <EnquiryDataTable
//             enquiries={enquiries}
//             loading={loading}
//             onSort={handleSort}
//             onLeadStatus={handleLeadStatus}
//             sortField={sortField}
//             sortOrder={sortOrder}
//           />

//           <Pagination
//             currentPage={currentPage}
//             totalCount={totalCount}
//             title="Enquiries"
//             totalPages={totalPages}
//             onPageChange={handlePagination}
//           />
//         </StudentCard>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";

import StudentCard from "@/components/common/StudentCard";
import Search from "@/components/form/input/Search";
import FilterBox from "@/components/form/input/FilterBox";
import EnquiryDataTable from "@/components/tables/EnquiryDataTable";
import Pagination from "@/components/tables/Pagination";
import useDebounce from "@/hooks/useDebounce";
import { Tooltip } from "@heroui/react";

import { useFetchCourse } from "@/hooks/queries/useQueryFetchCourseData";
import { getEnquiry } from "@/lib/api";

import {
  setCurrentPage,
  setEnquiries,
  setFilters,
  setLeadStatus,
  setSearchQuery,
  setSort,
  setTotal,
  setTotalPages,
} from "@/store/slices/enquirySlice";
import { setCourses } from "@/store/slices/courseSlice";

// --- Constants
const LEAD_STATUS_OPTIONS = [null, "HOT", "WARM", "COLD", "LOST", "HOLD"] as const;

const LEAD_STATUS_FILTER_OPTIONS = [
  { label: "WON", value: "WON" },
  { label: "HOLD", value: "HOLD" },
  { label: "LOST", value: "LOST" },
  { label: "WARM", value: "WARM" },
  { label: "HOT", value: "HOT" },
];

export default function EnquiryTable() {
  const dispatch = useDispatch<AppDispatch>();

  // --- State
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  // const [totalPages, setTotalPages] = useState(1);

  const {
    enquiries,
    currentPage,
    searchQuery,
    filters,
    sortField,
    sortOrder,
    leadStatus,
    totalPages,
    total: totalCount,
  } = useSelector((state: RootState) => state.enquiry);

  const courses = useSelector((state: RootState) => state.course.courses);

  const { data: courseData, isLoading: courseLoading } = useFetchCourse();

  // --- Load courses into Redux
  useEffect(() => {
    if (courseData?.course?.length) {
      dispatch(setCourses(courseData.course));
    }
  }, [courseData, dispatch]);

  // --- Debounced search and Set delay time according to your needs
  const debouncedSearchTerm = useDebounce(searchInput, 300);

  // 2. sync debounced value to Redux
  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      dispatch(setCurrentPage(1));
    }
  }, [debouncedSearchTerm, searchQuery, dispatch]);

  // --- Fetch enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      try {
        const res = await getEnquiry({
          token,
          page: currentPage,
          limit: 5,
          search: searchQuery,
          sortField,
          sortOrder,
          leadStatus,
          ...filters,
        });

        console.log("RESULTTTTT for the ENQUIRES:", res);

        dispatch(setEnquiries(res.data || []));
        dispatch(setTotal(res.total || 0));
        dispatch(setTotalPages(res.totalPages || 1));
      } catch (err) {
        console.error("Error fetching enquiries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [currentPage, searchQuery, sortField, sortOrder, leadStatus, filters, dispatch]);

  // --- Handlers (memoized)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.toLocaleLowerCase());
  }, []);

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

  const getNextLeadStatus = useCallback((status: typeof LEAD_STATUS_OPTIONS[number]) => {
    return LEAD_STATUS_OPTIONS[(LEAD_STATUS_OPTIONS.indexOf(status) + 1) % LEAD_STATUS_OPTIONS.length];
  }, []);

  const handleLeadStatus = useCallback(() => {
    const nextStatus = getNextLeadStatus(leadStatus);
    dispatch(setLeadStatus(nextStatus));
  }, [leadStatus, dispatch, getNextLeadStatus]);

  // --- Course options for filter
  // const courseOptions = courses.map(c => ({ label: c.name, value: c.id }));

  // --- Course options for filter (memoized)
  const courseOptions = useMemo(() => {
    return courses.map(c => ({ label: c.name, value: c.id }));
  }, [courses]);

  return (
    <div>
      <div className="space-y-6">
        <StudentCard title="Enquiry Lists">
          <div className="flex justify-between items-end w-full">
            <Search
              value={searchInput}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />
            <div className="flex items-center gap-3">
              <FilterBox
                onFilterChange={handleFilters}
                filterFields={[
                  { label: "Lead Status", key: "leadStatus", type: "select", options: LEAD_STATUS_FILTER_OPTIONS },
                  { label: "Course", key: "courseId", type: "select", options: courseOptions },
                  { label: "Create Date", key: "createDate", type: "date" },
                ]}
              />
              <span
                className="cursor-pointer"
                onClick={() => { dispatch(setCurrentPage(1)); dispatch(setSearchQuery(searchQuery)); }}
              >
                <Tooltip content="Reload" className="rounded bg-gray-200 text-[10px]">
                  <div className="items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                    <svg className="dark:text-gray-300" width="18" height="18" viewBox="0 0 24 24" fill="none">
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
            totalPages={totalPages}
            title="Enquiries"
            onPageChange={handlePagination}
          />
        </StudentCard>
      </div>
    </div>
  );
}

