// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface source {
  id: string;
  name: string;
  slug: string;
}

interface SourceState {
  sources: source[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  total: number; // ✅ New field 
  totalPages: number; // ✅ New field 
  currentPage: number,
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: SourceState = {
  sources: [],
  loading: false,
  error: null,
  total: 0,
  searchQuery: "",
  totalPages: 0,
  currentPage: 1,
};

const sourceSlice = createSlice({
  name: 'source',
  initialState,
  reducers: {
    setSources(state, action: PayloadAction<any[]>) {
    state.sources = action.payload;
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
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
});

// Export actions and reducer
export const { setSources, setLoading, setError, setTotal, setCurrentPage, setSearchQuery, setTotalPages } = sourceSlice.actions;
export default sourceSlice.reducer;