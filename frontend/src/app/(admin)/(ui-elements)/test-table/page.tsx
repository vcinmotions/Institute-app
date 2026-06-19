"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { getTest } from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store"; // Adjust path if needed
import { useDispatch } from "react-redux";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import { setCurrentPage, setSearchQuery, setTotal, setTotalPages } from "@/store/slices/testSlice";
import StudentCard from "@/components/common/StudentCard";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import TestDataTable from "@/components/tables/TestDataTable";
import { setTests } from "@/store/slices/testSlice";

export default function TestTable() {
    //const [enquiries, setEnquiries] = useState<any[]>([]);
    const batch = useSelector((state: RootState) => state.batch.batches ?? []);
    const tests = useSelector((state: RootState) => state.test.tests ?? []);
    const [loading, setLoading] = useState<boolean>(false);
    const { currentPage, total, totalPages, searchQuery, } = useSelector((state: RootState) => state.test);
    // 1. Separate state to track immediate input changes
    const [searchInput, setSearchInput] = useState("");
    const dispatch = useDispatch();

    // 3. Debounce effect to update searchQuery only after user stops typing for 500ms
    // Update searchInput immediately on typing
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
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
                const response = await getTest({
                    token,
                    page: currentPage,
                    limit: PAGE_SIZE,
                    search: searchQuery,
                });

                console.log("TEST IN TEST TABLE:", response);

                dispatch(setTests(response.test || []));
                dispatch(setTotalPages(response.totalPages || 1));
                dispatch(setTotal(response.total || 0));
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, searchQuery]);


    const handleSearchSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setCurrentPage(1));
    }, [dispatch]);

    const handlePagination = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) dispatch(setCurrentPage(page));
    }, [dispatch, totalPages]);


    return (
        <div>
            <div className="space-y-6">
                <div className="flex justify-between">
                    <Search
                        value={searchInput}
                        onChange={handleSearchChange}
                        onSubmit={handleSearchSubmit}
                    />
                </div>

                <TestDataTable
                    tests={tests}
                    batch={batch}
                    loading={loading}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    limit={PAGE_SIZE}
                    totalCount={total}
                    title="Tasks"
                    onPageChange={handlePagination}
                />

            </div>
        </div>
    );
}
