// src/store/slices/enquirySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EnquiryState {
  enquiries: any[];
  loading: boolean;
  searchQuery: string,
  error: string | null;
  total: number; // ✅ New field
  totalPages: number; // ✅ New field
  totalFiltered: number; // ✅ New field
  currentPage: number; // ✅ New field
  totalConverted: number; // ✅ New field
  totalNotConverted: number; // ✅ New field

  filters: Record<string, string | null>;
  sortField: string;
  sortOrder: "asc" | "desc";
  leadStatus: "HOT" | "WARM" | "COLD" | "LOST" | "HOLD" | null;
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: EnquiryState = {
  enquiries: [],
  loading: false,
  error: null,
  searchQuery: "",
  filters: {},
  sortField: "srNo",
  sortOrder: "asc",
  leadStatus: null,
  total: 0,
  totalPages: 1,
  totalFiltered: 0,
  currentPage: 1,
  totalConverted: 0,
  totalNotConverted: 0,
};

const enquirySlice = createSlice({
  name: 'enquiry',
  initialState,
  reducers: {
    setEnquiries(state, action: PayloadAction<any[]>) {
    state.enquiries = action.payload;
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
    setLeadStatus(state, action) {
      state.leadStatus = action.payload;
      state.currentPage = 1;
    },
    setTotalConverted(state, action: PayloadAction<number>) {
      state.totalConverted = action.payload;
    },
    setTotalNotConverted(state, action: PayloadAction<number>) {
      state.totalNotConverted = action.payload;
    }
  },
});

// Export actions and reducer
export const { setEnquiries, setLoading, setTotalPages, setError, setTotal, setSearchQuery, setTotalNotConverted, setTotalConverted, setCurrentPage, setFilters, setLeadStatus, setSort } = enquirySlice.actions;
export default enquirySlice.reducer;