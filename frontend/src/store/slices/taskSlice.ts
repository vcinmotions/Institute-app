// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskState {
  tasks: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  total: number; // ✅ New field 
  totalPages: number; // ✅ New field 
  filters: Record<string, string | null>;
  currentPage: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  searchQuery: "",
  total: 0,
  totalPages: 1,
  filters: {},
  currentPage: 1,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<any[]>) {
    state.tasks = action.payload;
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
export const { setTasks, setLoading, setError, setTotal, setCurrentPage, setFilters, setSearchQuery, setTotalPages } = taskSlice.actions;
export default taskSlice.reducer;