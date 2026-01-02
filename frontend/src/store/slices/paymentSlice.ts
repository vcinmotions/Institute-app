// src/store/slices/enquirySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StudentPaymentState {
  payment: any[];
  loading: boolean;
  error: string | null;
  total: number; // ✅ New field
}

// 🟢 Initial state must match the shape of EnquiryState
const initialState: StudentPaymentState = {
  payment: [],
  loading: false,
  error: null,
  total: 0,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPayment(state, action: PayloadAction<any[]>) {
    state.payment = action.payload;
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
export const { setPayment, setLoading, setError, setTotal } = paymentSlice.actions;
export default paymentSlice.reducer;