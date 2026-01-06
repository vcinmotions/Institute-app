// src/store/slices/enquirySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EnquiryState {
  enquiries: any[];
  filteredEnquiries: any[]; // 🆕 Add this
  loading: boolean;
  searchQuery: string,
  error: string | null;
  total: number; // ✅ New field
  currentPage: number; // ✅ New field
  totalConverted: number; // ✅ New field
  totalNotConverted: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: EnquiryState = {
  enquiries: [],
  filteredEnquiries: [], // 🆕 Initialize it
  loading: false,
  error: null,
  searchQuery: "",
  total: 0,
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
    setFilteredEnquiries(state, action: PayloadAction<any[]>) { // 🆕 new action
      state.filteredEnquiries = action.payload;
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
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
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
export const { setEnquiries, setLoading, setError, setTotal, setSearchQuery, setTotalNotConverted, setTotalConverted, setFilteredEnquiries, setCurrentPage } = enquirySlice.actions;
export default enquirySlice.reducer;