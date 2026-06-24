"use client";
import Search from "@/components/form/input/Search";
import Pagination from "@/components/tables/Pagination";
import { useSelector, useDispatch } from "react-redux";
import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import { setCurrentPage, setSearchQuery } from "@/store/slices/testSlice";
import { RootState } from "@/store";
import { PAGE_SIZE } from "@/constants/pagination";
import useDebounce from "@/hooks/useDebounce";
import TestDataTable from "@/components/tables/TestDataTable";
import { useFetchAllTests } from "@/hooks/queries/useQueryFetchTestData";
import Link from "next/link";

export default function TestTable() {
    const { currentPage, searchQuery } = useSelector(
        (state: RootState) => state.test
    );

    const [searchInput, setSearchInput] = useState("");
    const dispatch = useDispatch();

    // Update searchInput immediately on typing
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    // Debounce effect to delay execution tracking
    const debouncedSearchTerm = useDebounce(searchInput, 300);

    // Sync debounced search string to Redux and reset back to page 1
    useEffect(() => {
        if (debouncedSearchTerm !== searchQuery) {
            dispatch(setSearchQuery(debouncedSearchTerm));
            dispatch(setCurrentPage(1));
        }
    }, [debouncedSearchTerm, searchQuery, dispatch]);

    // 1. Fetch data directly using our fixed React Query Hook
    const { data, isLoading } = useFetchAllTests({
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchQuery,
    });

    const tests = data?.test || [];
    const totalPages = data?.totalPages || [];
    const total = data?.total || [];

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

                    <Link
                        href="/dashboard/test/create"
                        className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        + Create Record
                    </Link>
                </div>

                {/* 3. Pass React Query's isLoading flag directly into the table spinner */}
                <TestDataTable
                    tests={tests}
                    loading={isLoading}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    limit={PAGE_SIZE}
                    totalCount={total}
                    title="Tests"
                    onPageChange={handlePagination}
                />
            </div>
        </div>
    );
}