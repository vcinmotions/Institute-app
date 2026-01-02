import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: any | null;
  tenant: any | null,
  loading: boolean;
  error: any | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? sessionStorage.getItem('token') : null,
  user: null,
  tenant: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          sessionStorage.setItem('token', action.payload);
        } else {
          sessionStorage.removeItem('token');
        }
      }
    },
    setUser(state, action: PayloadAction<any | null>) {
      state.user = action.payload;
    },
    setTenant(state, action: PayloadAction<any | null>) {
      state.tenant = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
      }
    },
  },
});

export const { setToken, setUser, setTenant, setLoading, logout, setError } = authSlice.actions;

export default authSlice.reducer;