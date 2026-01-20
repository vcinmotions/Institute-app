// src/lib/api/follow-up.ts
import { apiClient } from "../apiClient";

// 🔧 FIXED getUser API with token header
export const getFollowUp = async (token: string, id: any) => {
  const response = await apiClient.get(`/followup/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createInitialFolowUpAPI = async (
  token: string,
  newFollowUpData: any,
) => {
  const response = await apiClient.post(`/followup`, newFollowUpData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createNextFolowUpAPI = async (
  token: string,
  newFollowUpData: any,
  id: any,
) => {
  const response = await apiClient.put(`/followup/${id}`, newFollowUpData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const editNextFolowUpAPI = async (
  token: string,
  newFollowUpData: any,
  id: any,
) => {
  const response = await apiClient.put(`/followup-edit/${id}`, newFollowUpData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createCompleteFolowUpAPI = async (
  token: string,
  newFollowUpData: any,
) => {
  const response = await apiClient.post(`/followup/complete`, newFollowUpData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};