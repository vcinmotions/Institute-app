// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LabState {
  labs: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
  searchQuery: string,
  totalPages: number; // ✅ New field
  currentPage: number; // ✅ New field

  filters: Record<string, string | null>;
  sortField: string;
  sortOrder: "asc" | "desc";
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: LabState = {
  labs: [],
  loading: false,
  error: null,
  total: 0,
  searchQuery: "",
  filters: {},
  currentPage: 1,
  sortField: "isActive",
  sortOrder: "asc",
  totalPages: 1,
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setLab(state, action: PayloadAction<any[]>) {
    state.labs = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
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
    },
  },
});

// Export actions and reducer
export const { setLab, setLoading, setError, setTotal, setCurrentPage, setFilters, setSearchQuery, setSort, setTotalPages } = labSlice.actions;
export default labSlice.reducer;