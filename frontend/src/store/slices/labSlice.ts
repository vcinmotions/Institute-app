// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LabState {
  labs: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: LabState = {
  labs: [],
  loading: false,
  error: null,
  total: 0,
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setLab(state, action: PayloadAction<any[]>) {
    state.labs = action.payload;
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
export const { setLab, setLoading, setError, setTotal } = labSlice.actions;
export default labSlice.reducer;