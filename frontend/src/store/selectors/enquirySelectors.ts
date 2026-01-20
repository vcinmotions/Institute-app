// src/store/selectors/enquirySelectors.ts
import { RootState } from "../index";

// Core lists & state
export const selectEnquiries = (state: RootState) => state.enquiry?.enquiries ?? [];
export const selectLoading = (state: RootState) => state.enquiry?.loading ?? false;
export const selectError = (state: RootState) => state.enquiry?.error ?? null;

// Pagination & totals
export const selectEnquiryPage = (state: RootState) => state.enquiry?.currentPage ?? 1;
export const selectEnquiryTotal = (state: RootState) => state.enquiry?.total ?? 0;
export const selectEnquiryTotalPages = (state: RootState) => state.enquiry?.totalPages ?? 1;
export const selectTotalFiltered = (state: RootState) => state.enquiry?.totalFiltered ?? 0;
export const selectTotalConverted = (state: RootState) => state.enquiry?.totalConverted ?? 0;
export const selectTotalNotConverted = (state: RootState) => state.enquiry?.totalNotConverted ?? 0;

// Filters & search
export const selectSearchQuery = (state: RootState) => state.enquiry?.searchQuery ?? "";
export const selectFilters = (state: RootState) => state.enquiry?.filters ?? {};
export const selectSortField = (state: RootState) => state.enquiry?.sortField ?? "srNo";
export const selectSortOrder = (state: RootState) => state.enquiry?.sortOrder ?? "asc";
export const selectLeadStatus = (state: RootState) => state.enquiry?.leadStatus ?? null;
