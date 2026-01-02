// src/store/slices/courseSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RolesState {
  roles: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
  total: 0,
};

const rolesSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRoles(state, action: PayloadAction<any[]>) {
    state.roles = action.payload;
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
export const { setRoles, setLoading, setError, setTotal } = rolesSlice.actions;
export default rolesSlice.reducer;