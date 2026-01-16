// src/store/slices/enquirySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StudentCourseState {
  studentCourse: any[];
  studentDetails: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  total: number; // ✅ New field 
  totalPages: number; // ✅ New field 
  filters: Record<string, string | null>;
  sortField: string;
  sortOrder: "asc" | "desc";
  currentPage: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: StudentCourseState = {
  studentCourse: [],
  studentDetails: [],
  loading: false,
  error: null,
  searchQuery: "",
  total: 0,
  totalPages: 1,
  filters: {},
  sortField: "startDate",
  sortOrder: "asc",
  currentPage: 1,
};

const studentCourseSlice = createSlice({
  name: 'studentCourse',
  initialState,
  reducers: {
    setStudentCourse(state, action: PayloadAction<any[]>) {
    state.studentCourse = action.payload;
    },
    setStudentDetail(state, action: PayloadAction<any[]>) {
    state.studentDetails = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
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
export const { setStudentCourse, setStudentDetail, setLoading, setError, setTotal, setSearchQuery, setCurrentPage, setFilters, setSort, setTotalPages } = studentCourseSlice.actions;
export default studentCourseSlice.reducer;