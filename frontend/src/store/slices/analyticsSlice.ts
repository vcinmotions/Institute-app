// src/store/slices/analyticsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  summary: Record<string, any>;
  breakdown: Record<string, any>;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  summary: {},
  breakdown: {},
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytic',
  initialState,
  reducers: {
    setAnalytics(state, action: PayloadAction<Record<string, any>>) {
      state.summary = action.payload;
    },
    setAnalyticsBreakdown(state, action: PayloadAction<Record<string, any>>) {
      state.breakdown = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setAnalytics,
  setAnalyticsBreakdown,
  setLoading,
  setError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
