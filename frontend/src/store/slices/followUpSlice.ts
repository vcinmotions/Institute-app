// src/store/slices/followUpSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// src/store/slices/followUpSlice.ts
interface FollowUpState {
  followUpsByEnquiry: {
    [enquiryId: string]: any[];  // array of follow-ups per enquiry
  };
  loading: boolean;
  error: string | null;
}

interface FollowUp {
  id: string;
  remark: string;
  // ... other fields
}

const initialState: FollowUpState = {
  followUpsByEnquiry: {},
  loading: false,
  error: null,
};

const followUpSlice = createSlice({
  name: 'followup',
  initialState,
  reducers: {
    // Add or update follow-ups for a specific enquiry ID
    addFollowUpsForEnquiry(state, action: PayloadAction<{ enquiryId: string, followUps: any[] }>) {
      const { enquiryId, followUps } = action.payload;
      state.followUpsByEnquiry[enquiryId] = followUps;
    },
    // ✅ ADD THIS:
    setFollowUps: (
      state,
      action: PayloadAction<{ enquiryId: string; followUps: FollowUp[] }>
    ) => {
      state.followUpsByEnquiry[action.payload.enquiryId] = action.payload.followUps;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearFollowUps(state) {
      state.followUpsByEnquiry = {};
      state.error = null;
    },
  },
});

export const { addFollowUpsForEnquiry, setLoading, setError, clearFollowUps, setFollowUps } = followUpSlice.actions;
export default followUpSlice.reducer;