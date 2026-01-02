// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CourseState {
  courses: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
  total: 0,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourses(state, action: PayloadAction<any[]>) {
    state.courses = action.payload;
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
export const { setCourses, setLoading, setError, setTotal } = courseSlice.actions;
export default courseSlice.reducer;