// src/store/slices/enquirySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StudentCourseState {
  studentCourse: any[];
  studentDetails: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: StudentCourseState = {
  studentCourse: [],
  studentDetails: [],
  loading: false,
  error: null,
  total: 0,
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
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setTotal(state, action: PayloadAction<number>) {
      state.total = action.payload;
    }
  },
});

// Export actions and reducer
export const { setStudentCourse, setStudentDetail, setLoading, setError, setTotal } = studentCourseSlice.actions;
export default studentCourseSlice.reducer;