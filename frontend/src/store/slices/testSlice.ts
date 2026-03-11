// src/store/slices/testSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TestState {
    tests: any[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    total: number; // ✅ New field 
    totalPages: number; // ✅ New field 
    filters: Record<string, string | null>;
    currentPage: number; // ✅ New field
}

// 🟢 Initial state must match the shape of TestState
const initialState: TestState = {
    tests: [],
    loading: false,
    error: null,
    searchQuery: "",
    total: 0,
    totalPages: 1,
    filters: {},
    currentPage: 1,
};

const testSlice = createSlice({
    name: 'test',
    initialState,
    reducers: {
        setTests(state, action: PayloadAction<any[]>) {
            state.tests = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        setTotal(state, action: PayloadAction<number>) {
            state.total = action.payload;
        },
        setTotalPages(state, action: PayloadAction<number>) {
            state.totalPages = action.payload;
        },
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
        setFilters(state, action) {
            state.filters = action.payload;
            state.currentPage = 1; // reset ONLY when filters change
        },
    },
});

// Export actions and reducer
export const { setTests, setLoading, setError, setTotal, setCurrentPage, setFilters, setSearchQuery, setTotalPages } = testSlice.actions;
export default testSlice.reducer;