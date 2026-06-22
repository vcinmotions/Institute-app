// src/lib/api.ts
import axios from "axios";
import { apiClient, apiClientNew } from "./apiClient";

interface GetEnquiryParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string | null;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  leadStatus?: "HOT" | "WARM" | "COLD" | "LOST" | "HOLD" | null;
}

interface GetStudentByIdParams {
  token: string;
  studentId: string;
}

interface GetNotificationParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string | null;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface GetLabParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string | null;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface GetMasterParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface GetStudentCourseParams {
  token: string;
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string,
  sortField?: string;
  sortOrder?: "asc" | "desc";
  courseId?: string;
  batchId?: string;
  facultyId?: string;
}

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // If any API returns 401 → logout automatically
//     if (error.response?.status === 401) {
//       console.warn("⛔ Unauthorized! Auto-logging out...");
//       forceLogout();
//     }

//     return Promise.reject(error);
//   },
// );

// Example POST request
export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  if (!userData.email || !userData.password) {
    console.error("❌ Required fields missing!"); //console.error is to displayerror in turbo
    throw new Error("Email and password are required.");
  }

  try {
    const response = await apiClient.post("/auth/login", userData);
    return response.data;
  } catch (err: any) {
    // Optional: You can handle or rethrow the API error here
    console.error("❌ Login API failed:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error ||
      err.response?.data ||
      err.response?.data?.message ||
      "Login failed.",
    );
  }
};

// Example POST request
export const createMasterUser = async (userData: {
  email: string;
  password: string;
}) => {
  if (!userData.email || !userData.password) {
    console.error("❌ Required fields missing!"); //console.error is to displayerror in turbo
    throw new Error("Email and password are required.");
  }

  try {
    const response = await apiClient.post("/auth/master-login", userData);
    return response.data;
  } catch (err: any) {
    // Optional: You can handle or rethrow the API error here
    console.error("❌ Login API failed:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Login failed.",
    );
  }
};

// 🔧 FIXED getUser API with token header
export const getUser = async (token: string) => {
  const response = await apiClient.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMasterUser = async (token: string) => {
  const response = await apiClientNew.get("/master-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getTenant = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
}: GetMasterParams) => {
  const response = await apiClient.get("/master-tenant", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
    },
  });

  return response.data;
};

export const editMasterAPI = async (token: string, newMasterData: any) => {
  const response = await apiClient.put("/master-user", newMasterData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const editClientAPI = async (token: string, newClientData: any) => {
  const response = await apiClient.put("/user", newClientData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ✅ Get JSON Summary
export const createCompanyApi = async (token: string, newCompanyData: any) => {
  const response = await apiClientNew.post(`/tenants`, newCompanyData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
// export const getEnquiry = async (token: string) => {
//   const response = await apiClient.get("/enquiry", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };

export const getLab = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
}: GetLabParams) => {
  const response = await apiClient.get("/all-lab", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
    },
  });

  return response.data;
};

export const getAnalytics = async (token: string) => {
  const response = await apiClient.get("/profit", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ✅ Get JSON Summary
export const getFinancial = async (token: string) => {
  const response = await apiClient.get("/financial-summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ✅ Get JSON Summary
// export const getRoles = async (token: string) => {
//   const response = await apiClient.get("/role-user", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };

export const getRoles = async (
  token: string,
  page?: number | null,
  limit?: number | null,
  search?: string | null
) => {
  const response = await apiClient.get("/role-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};


// ✅ Get JSON Summary
export const createRoles = async (token: string, newRoleData: any) => {
  const response = await apiClient.post(`/role-user`, newRoleData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ✅ Get JSON Summary
export const editRolesApi = async (token: string, formData: any, id: any) => {
  const response = await apiClient.put(`/edit-role-user/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createLabApi = async (token: string, newLabData: any) => {
  const response = await apiClient.post(`/create-lab`, newLabData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createOpeningBalanceApi = async (token: string, newStudent: any) => {
  const response = await apiClient.post(`/create-op`, newStudent, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const editLabApi = async (token: string, newLabData: any, id: any) => {
  const response = await apiClient.put(`/edit-lab/${id}`, newLabData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ✅ Download Excel
export const downloadFinancialExcel = async (token: string) => {
  const response = await apiClient.get("/financial-summary?export=excel", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob", // 🔑 very important for Excel download
  });

  // Convert blob to downloadable file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "financial-summary.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// ✅ Download Excel
export const downloadOutstandingExcel = async (token: string) => {
  const response = await apiClient.get("/outstanding?export=excel", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob", // 🔑 very important for Excel download
  });

  // Convert blob to downloadable file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "outstanding-summary.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// ✅ Download Excel
export const downloadAttendanceExcel = async (
  token: string,
  batchId: number,
  month: string,
) => {
  const response = await apiClient.get(
    `/attendance-report?batchId=${batchId}&month=${month}&export=excel`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    },
  );

  // Convert blob to downloadable file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `attendance-${month}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const getAttendanceByBatch = async (
  token: string,
  batchId: number,
  date: string,
) => {
  const response = await apiClient.get(`/attendance/${batchId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { date },
  });
  return response.data;
};
export const getAttendanceByCourse = async (
  token: string,
  courseId: number,
  date: string,
) => {
  const response = await apiClient.get(`/attendance/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { date },
  });
  return response.data;
};

export const markAttendance = async (data: {
  date: string;
  batchId: number;
  courseId: number;
  attendance: { studentId: number; present: boolean }[];
}) => {
  const token = sessionStorage.getItem("token");
  const response = await apiClient.post("/attendance/mark", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// export const updateNotification = async (token: string, id: string) => {
//   console.log("GET TOKEN IN UPDATE NORIFICATION API:", token);
//   const response = await apiClient.put(`/notification/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//     params: { id },
//   });
//   return response.data;
// };

export const updateNotification = async (token: string, id: string) => {
  console.log("GET TOKEN IN UPDATE NOTIFICATION API:", token);

  const response = await apiClient.put(
    `/notification/${id}`,
    {}, // request body (empty)
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getFacultyBatches = async (
  {
    token,
    page = 1,
    limit = 5,
    search = "",
    sortField,
    sortOrder,
    leadStatus,
  }: GetEnquiryParams,
  facultyId: string,
) => {
  const response = await apiClient.get(`/faculty/${facultyId}/batches`, {
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
    },
  });

  return response.data;
};

export const getLog = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
}: GetEnquiryParams) => {
  const response = await apiClient.get("/log", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
    },
  });

  return response.data;
};

export const getNotification = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
}: GetNotificationParams) => {
  const response = await apiClient.get("/notification", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
    },
  });

  return response.data;
};

export const getEnquiry = async ({
  token,
  page,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
  leadStatus,
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

export const getStudent = async ({
  token,
  page,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
  ...filters
}: GetEnquiryParams) => {
  const response = await apiClient.get("/student", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
      ...filters
    },
  });

  return response.data;
};

export const getStudentById = async ({
  token,
  studentId
}: GetStudentByIdParams) => {
  const response = await apiClient.get(`/students/${studentId}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// 🔧 FIXED getUser API with token header
export const getStudentCourse = async ({
  token,
  page,
  limit,
  search = "",
  sortField,
  sortOrder,
  ...filters // 👈 send filters to API
}: GetStudentCourseParams) => {
  const response = await apiClient.get("/student-course", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
      ...filters, // 👈 send filters to API
    },
  });

  return response.data;
};

// 🔧 FIXED getUser API with token header
export const getStudentAttendance = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
  ...filters // 👈 send filters to API
}: GetStudentCourseParams) => {
  const response = await apiClient.get("/student-attendance", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
      ...filters, // 👈 send filters to API
    },
  });

  return response.data;
};

export const getPayment = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
  ...filters
}: GetStudentCourseParams) => {
  const response = await apiClient.get("/payment", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
      sortField,
      sortOrder,
      ...filters, // ✅ send filters to backend
    },
  });

  return response.data;
};

export const getCourse = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
  sortField,
  sortOrder,
  leadStatus,
}: GetEnquiryParams) => {
  const response = await apiClient.get("/course", {
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
    },
  });

  return response.data;
};

export const getStationary = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
}: GetEnquiryParams) => {
  const response = await apiClient.get("/stationary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const getTask = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
}: GetEnquiryParams) => {
  const response = await apiClient.get("/task", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const getTest = async ({
  token,
  page = 1,
  limit = 5,
  search = "",
}: GetEnquiryParams) => {
  const response = await apiClient.get("/test", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const getBatch = async ({
  token,
  page,
  limit,
  search = "",
}: GetEnquiryParams) => {
  const response = await apiClient.get("/batch", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const getFaculty = async ({
  token,
  page,
  limit,
  search = "",
  sortField,
  sortOrder,
  leadStatus,
}: GetEnquiryParams) => {
  const response = await apiClient.get("/faculty", {
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
    },
  });

  return response.data;
};

// 🔧 FIXED API call with proper types
export const getFollowUp = async (token: string | null, id: string | null) => {
  if (!token || !id) throw new Error("Missing authentication token or Enquiry ID");

  const response = await apiClient.get(`/followup/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createEnquiryAPI = async (token: string, newEnquiry: any) => {
  const response = await apiClient.post(`/enquiry-new`, newEnquiry, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const editEnquiryAPI = async (token: string, newEnquiryData: any) => {
  const response = await apiClient.put("/edit-enquiry", newEnquiryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const courseCompletionAPI = async (
  token: string,
  courseCompletionData: any,
) => {
  const response = await apiClient.post(
    `/course-completion`,
    courseCompletionData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createCourseAPI = async (token: string, newCourseData: any) => {
  const response = await apiClient.post(`/create-course`, newCourseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createStationaryAPI = async (token: string, newStationaryData: any) => {
  const response = await apiClient.post(`/create-stationary`, newStationaryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


// 🔧 FIXED getUser API with token header
export const createTaskAPI = async (token: string, newTaskData: any) => {
  const response = await apiClient.post(`/create-task`, newTaskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createTestAPI = async (token: string, newTestData: any) => {
  const response = await apiClient.post(`/create-test`, newTestData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createPublishTestAPI = async (token: string, payload: any) => {
  const response = await apiClient.post(`/create-test/publish`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const editCourseAPI = async (
  token: string,
  newCourseData: any,
  id: any,
) => {
  const response = await apiClient.put(`/edit-course/${id}`, newCourseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const editStationaryAPI = async (
  token: string,
  newStationary: any,
  id: any,
) => {
  const response = await apiClient.put(`/edit-stationary/${id}`, newStationary, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const editTaskAPI = async (
  token: string,
  newTask: any,
  id: any,
) => {
  const response = await apiClient.put(`/edit-task/${id}`, newTask, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
// D:\SHOBHA\vcinmotions-application-ai\frontend\src\lib\api.ts

export const editTestAPI = async (token: string, newTest: any, id: any) => {
  // Appends route parameters directly onto the base client configuration endpoint wrapper
  const response = await apiClient.put(`/edit-test/${id}`, newTest, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🚀 Added Publish Test API using the exact same structural layout
export const publishTestAPI = async (token: string, publishData: any) => {
  const response = await apiClient.post("/create-test/publish", publishData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createSourceAPI = async (
  token: string,
  sourceData: { name: string }
) => {
  const response = await apiClient.post(
    "/create-source",
    sourceData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createFacultyAPI = async (token: string, newFacultyData: any) => {
  const response = await apiClient.post(`/create-faculty`, newFacultyData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const editFacultyAPI = async (
  token: string,
  newFaculty: any,
  id: any,
) => {
  const response = await apiClient.put(`/edit-faculty/${id}`, newFaculty, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
export const createBatchAPI = async (token: string, newBatchData: any) => {
  const response = await apiClient.post(`/create-batch`, newBatchData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createStudentPaymentAPI = async (
  token: string,
  newStudentPaymentData: any,
  id: string,
) => {
  const response = await apiClient.put(
    `/create-student-payment/${id}`,
    newStudentPaymentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

export const createAssignBatchToFacultyAPI = async (
  token: string,
  newFaculty: any,
) => {
  const response = await apiClient.put(`/assign-batch`, newFaculty, {
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

// 🔧 FIXED getUser API with token header
export const createAdmission = async (token: string, formData: FormData) => {
  const response = await apiClientNew.post(`/admission-new`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// 🔧 FIXED getUser API with token header
export const editStudent = async (token: string, formData: FormData, id: string) => {
  const response = await apiClient.put(`/edit-student/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// 🔧 FIXED getUser API with token header
export const assignCourseToStudent = async (token: string, formData: FormData) => {
  const response = await apiClient.post(`/add-course`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ Do not set Content-Type manually
    },
  });

  return response.data;
};

// 🔧 FIXED getUser API with token header
export const deletedEnquiry = async (token: string, id: any) => {
  const response = await apiClient.delete(`/enquiry/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🔧 FIXED getUser API with token header
// export const getNotification = async (token: string) => {
//   const response = await apiClient.get("/notification", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };
