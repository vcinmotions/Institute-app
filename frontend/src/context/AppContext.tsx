// src/context/AppContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getEnquiry,
  getFollowUp,
  getNotification,
  getStudent,
  getUser,
} from "@/lib/api";
import { useSelector, useDispatch } from "react-redux";
import { setToken, setUser } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import {
  setEnquiries,
  setLoading,
  setError,
} from "@/store/slices/enquirySlice";
import { setStudents } from "@/store/slices/studentSlice";
import {
  setStudentCourse,
  setStudentDetail,
} from "@/store/slices/studentCourseSlice";

interface User {
  id: string;
  name: string;
  email: string;
  loading: boolean; // 👈 Add this
  // add more fields as needed
}

interface Token {
  token: string;
  id: any;
  // add more fields as needed
}

// Define the type of data you want to share
interface AppContextType {
  userData: any;
  setUserData: (data: any) => void;

  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;

  // Add more shared values here as needed
  notificationData: any;
  setNotificationData: (data: any) => void;

  // Add more shared values here as needed
  followUpData: any;
  setFollowUpData: (data: any) => void;

  // Add more shared values here as needed
  enquiryData: any;
  setEnquiryData: (data: any) => void;

  token: any;
  setToken: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provide the context to your app
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<any>(null);
  const [notificationData, setNotificationData] = useState<any>(null);
  const [followUpData, setFollowUpData] = useState<any>(null);
  const [enquiryData, setEnquiryData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  //const [loading, setLoading] = useState(true);
  //const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const enquiries = useSelector((state: RootState) => state.enquiry);
  const dispatch = useDispatch();

  // Local state for pagination and filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // useEffect(() => {
  //   const publicRoutes = ["/signin", "/signup", "/master-signin", "/reset-password"];

  //   const currentPath = window.location.pathname;
  //   const getToken = sessionStorage.getItem("token");

  //   console.log("Get Token In AppContext", getToken);
  //   if (!getToken && !publicRoutes.includes(currentPath)) {
  //     router.replace("/signin");
  //     return;
  //   }

  //   setToken(getToken);
  // }, []);

  // useEffect(() => {
  //   if (!token) return;

  //   const fetchUser = async () => {
  //     try {
  //       const data = await getUser(token);
  //       setUserData(data);
  //       dispatch(setUser(data));
  //       console.log("get userdata in appContext", data);
  //     } catch (err) {
  //       console.error("❌ Failed to fetch user:", err);
  //       setUserData(null);
  //       router.replace("/signin");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUser();
  // }, [token, router]);

  // useEffect(() => {
  //   if (!token) return;

  //   const fetchNotification = async () => {
  //     try {
  //       const data = await getNotification(token);
  //       setNotificationData(data);
  //     } catch (err) {
  //       console.error("❌ Failed to fetch Notification Data:", err);
  //       setNotificationData(null);
  //     }
  //   };

  //   fetchNotification();
  // }, [token]);

  // useEffect(() => {
  //   if (!token) return;

  //   const fetchData = async () => {
  //     dispatch(setLoading(true));
  //     try {
  //       const data = await getEnquiry(token);
  //       dispatch(setEnquiries(data.enquiry));
  //     } catch (err) {
  //       dispatch(setError('Failed to fetch enquiries.'));
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   };

  //   fetchData();
  // }, [token, dispatch]);

  //  useEffect(() => {
  //   if (!token) return;

  //   const fetchData = async () => {
  //     dispatch(setLoading(true));
  //     try {
  //       const data = await getEnquiry({
  //         token,
  //         page,
  //         limit,
  //         search,
  //         sortField,
  //         sortOrder,
  //       });

  //       dispatch(setEnquiries(data.enquiry)); // ✅ Make sure the backend returns `enquiries`
  //     } catch (err) {
  //       dispatch(setError('Failed to fetch enquiries.'));
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   };

  //   fetchData();
  // }, [token, page, limit, search, sortField, sortOrder, dispatch]);

  // useEffect(() => {
  //   if (!token) return;

  //   const fetchStudentData = async () => {
  //     dispatch(setLoading(true));
  //     try {
  //       const data = await getStudent({
  //         token,
  //         page,
  //         limit,
  //         search,
  //         sortField:"admissionDate",
  //         sortOrder,
  //       });

  //       dispatch(setStudents(data.student)); // ✅ Make sure the backend returns `enquiries`
  //     } catch (err) {
  //       dispatch(setError('Failed to fetch Students.'));
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   };

  //   fetchStudentData();
  // }, [token, page, limit, search, sortField, sortOrder, dispatch]);

  //  useEffect(() => {
  //   if (!token) return;

  //   const fetchStudentCourseData = async () => {
  //     dispatch(setLoading(true));
  //     try {
  //       const data = await getStudent({
  //         token,
  //         page,
  //         limit,
  //         search,
  //         sortField:"startDate",
  //         sortOrder,
  //       });

  //       dispatch(setStudentCourse(data.studentCourse)); // ✅ Make sure the backend returns `enquiries`
  //       dispatch(setStudentDetail(data.detailedCourses)); // ✅ Make sure the backend returns `enquiries`
  //     } catch (err) {
  //       dispatch(setError('Failed to fetch Students Course.'));
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   };

  //   fetchStudentCourseData();
  // }, [token, page, limit, search, sortField, sortOrder, dispatch]);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        selectedItem,
        setSelectedItem,
        notificationData,
        setNotificationData,
        token,
        setToken,
        followUpData,
        setFollowUpData,
        enquiryData,
        setEnquiryData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
// export const useAppContext = () => {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error("useAppContext must be used within an AppProvider");
//   }
//   return context;
// };
