// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BatchState {
  batches: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: BatchState = {
  batches: [],
  loading: false,
  error: null,
  total: 0,
};

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    setBatches(state, action: PayloadAction<any[]>) {
    state.batches = action.payload;
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
export const { setBatches, setLoading, setError, setTotal } = batchSlice.actions;
export default batchSlice.reducer;