"use client";

import AdminJumpHotkeys from "@/components/common/AdminJumpHotkeys";
import { useSidebar } from "@/context/SidebarContext";
import { setUser } from "@/store/slices/authSlice";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppKeyHeader from "@/layout/AppKeyHeader";

export default function MasterAdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const dispatch = useDispatch();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  console.log("GET MASTER USER DATA :", user);

  useEffect(() => {
    dispatch(setUser(user));
  }, [user]);
  //const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  console.log("GET USER DATA :", user);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <ProtectedRoute allowedRoles={["MASTER_ADMIN"]}>
      <div className="min-h-screen 2xl:flex">
        {/* Sidebar and Backdrop */}

        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          <AppKeyHeader />
          {/* Page Content */}
          <AdminJumpHotkeys userRole={user?.role}>
            <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
              {children}
            </div>
          </AdminJumpHotkeys>
        </div>
      </div>
    </ProtectedRoute>
  );
}
