// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FacultyState {
  faculties: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: FacultyState = {
  faculties: [],
  loading: false,
  error: null,
  total: 0,
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
    }
  },
});

// Export actions and reducer
export const { setFaculties, setLoading, setError, setTotal } = facultySlice.actions;
export default facultySlice.reducer;