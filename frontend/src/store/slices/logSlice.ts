// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LogState {
  logs: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: LogState = {
  logs: [],
  loading: false,
  error: null,
  total: 0,
};

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    setLogs(state, action: PayloadAction<any[]>) {
    state.logs = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    }
  },
});

// Export actions and reducer
export const { setLogs, setLoading, setError, setTotal } = logSlice.actions;
export default logSlice.reducer;