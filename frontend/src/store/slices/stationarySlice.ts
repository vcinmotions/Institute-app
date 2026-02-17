// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StationaryState {
  stationaries: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  total: number; // ✅ New field 
  totalPages: number; // ✅ New field 
  filters: Record<string, string | null>;
  currentPage: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: StationaryState = {
  stationaries: [],
  loading: false,
  error: null,
  searchQuery: "",
  total: 0,
  totalPages: 1,
  filters: {},
  currentPage: 1,
};

const stationarySlice = createSlice({
  name: 'stationary',
  initialState,
  reducers: {
    setStationaries(state, action: PayloadAction<any[]>) {
    state.stationaries = action.payload;
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
export const { setStationaries, setLoading, setError, setTotal, setCurrentPage, setFilters, setSearchQuery, setTotalPages } = stationarySlice.actions;
export default stationarySlice.reducer;