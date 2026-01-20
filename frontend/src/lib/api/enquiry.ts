// src/lib/api/enquiry.ts
import { apiClient } from "../apiClient";

export interface Enquiry {
  name: string;
  email: string;
  contact: string;              // main contact number
  alternateContact?: string;    // optional alternate number
  courseId: string[];           // array of selected course IDs
  dob?: string;                 // optional, format "DD/MM/YYYY"
  gender?: "male" | "female" | "other"; // optional
  location?: string;            // optional locality
  city?: string;                // optional
  source?: string;              // optional source of enquiry
  referedBy?: string;           // optional referral
}

export interface GetEnquiryParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string | null;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  leadStatus?: "HOT" | "WARM" | "COLD" | "LOST" | "HOLD" | null;
  signal?: AbortSignal; // ✅ senior-level: support cancel
}

export interface UseFetchEnquiryParams {
  token: string;
  currentPage?: number;
  limit?: number;
  searchQuery?: string | null;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  leadStatus?: "HOT" | "WARM" | "COLD" | "LOST" | "HOLD" | null;
  signal?: AbortSignal; // ✅ senior-level: support cancel
  filters: {};
}

// Create Enquiry API
export const createEnquiryAPI = async (token: string, newEnquiry: Partial<Enquiry>) => {
  const response = await apiClient.post(`/enquiry-new`, newEnquiry, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get Enquiry API
export const getEnquiry = async ({
  token,
  page,
  limit,
  search = "",
  sortField,
  sortOrder,
  leadStatus,
  signal,
  ...filters
}: GetEnquiryParams) => {
  const response = await apiClient.get("/enquiry", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
      leadStatus,
      ...filters, // ✅ send filters to backend
    },
    signal, // ✅ cancel support
  });

  return response.data;
};

export const getWonEnquiry = async ({
  token,
  page,
  limit,
  search = "",
  sortField,
  sortOrder,
  leadStatus,
  ...filters
}: GetEnquiryParams) => {
  const response = await apiClient.get("/won-enquiry", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
      leadStatus,
      ...filters, // ✅ send filters to backend
    },
  });

  return response.data;
};

// Edit Enquity API
export const editEnquiryAPI = async (token: string, newEnquiryData: Partial<Enquiry>) => {
  const response = await apiClient.put("/edit-enquiry", newEnquiryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createHoldEnquiryAPI = async (
  token: string,
  newFollowUpData: any,
) => {
  const response = await apiClient.post(`/enquiry/hold`, newFollowUpData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createLostEnquiryAPI = async (
  token: string,
  newFollowUpData: any,
) => {
  const response = await apiClient.post(`/enquiry/lost`, newFollowUpData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};