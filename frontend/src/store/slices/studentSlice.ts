// src/store/slices/enquirySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StudentState {
  students: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string | null;
  total: number; // ✅ New field 
  totalPages: number; // ✅ New field 
  filters: Record<string, string | null>;
  sortField: string;
  sortOrder: "asc" | "desc";
  currentPage: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: StudentState = {
  students: [],
  loading: false,
  error: null,
  searchQuery: null,
  total: 0,
  totalPages: 1,
  filters: {},
  sortField: "admissionDate",
  sortOrder: "asc",
  currentPage: 1,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudents(state, action: PayloadAction<any[]>) {
    state.students = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string | null>) {
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
    setSort(state, action) {
      state.sortField = action.payload.field;
      state.sortOrder = action.payload.order;
    }
  },
});

// Export actions and reducer
export const { setStudents, setLoading, setError, setTotal, setTotalPages, setCurrentPage, setFilters, setSort, setSearchQuery } = studentSlice.actions;
export default studentSlice.reducer;