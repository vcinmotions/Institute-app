// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  notifications: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
  currentPage: number; // ✅ New field
  totalPages: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<any[]>) {
    state.notifications = action.payload;
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
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
  },
});

// Export actions and reducer
export const { setNotifications, setLoading, setError, setTotal, setCurrentPage, setTotalPages } = notificationSlice.actions;
export default notificationSlice.reducer;