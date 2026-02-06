// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FacultyState {
  faculties: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  total: number; // ✅ New field 
  totalPages: number; // ✅ New field 
  currentPage: number,
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: FacultyState = {
  faculties: [],
  loading: false,
  error: null,
  total: 0,
  searchQuery: "",
  totalPages: 0,
  currentPage: 1,
};

const facultySlice = createSlice({
  name: 'faculty',
  initialState,
  reducers: {
    setFaculties(state, action: PayloadAction<any[]>) {
    state.faculties = action.payload;
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
export const { setFaculties, setLoading, setError, setTotal, setCurrentPage, setSearchQuery, setTotalPages } = facultySlice.actions;
export default facultySlice.reducer;