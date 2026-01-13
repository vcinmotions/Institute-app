"use client";

import { useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useDispatch } from "react-redux";
import { setCountry, setStateLocation, setUser } from "@/store/slices/authSlice";
import { socket } from "@/app/utils/socket";

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import JumpHotkeys from "@/components/common/JumpHotkeys";
import AppKeyHeader from "@/layout/AppKeyHeader";
export default function ClientAdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const dispatch = useDispatch();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  console.log("GET USER DATA :", user);

  useEffect(() => {
    dispatch(setUser(user));
    dispatch(setCountry(user?.country));
    dispatch(setStateLocation(user?.state));
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;

    // Connect and join user's room
    socket.connect();
    const roomId = user.role === "ADMIN" ? user.id : user.clientAdminId;
    console.log("Socket IO is now Connected!", roomId);
    socket.emit("join", roomId); // or user.clientAdminId

    // Listen for notifications
    socket.on("new-followup-notification", (data) => {
      console.log("🔔 New follow-up notification:", data.message);
      // Update UI, show toast, badge, etc.
    });

    // Cleanup on unmount
    return () => {
      socket.off("new-followup-notification");
      socket.disconnect();
    };
  }, [user]);

  const margin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <ProtectedRoute
      allowedRoles={[
        "ADMIN",
        "FACULTY",
        "FRONT_DESK",
        "ACCOUNTANT",
        "VIEW_ONLY",
      ]}
    >
      <div className="min-h-screen 2xl:flex">
        <AppSidebar />
        <Backdrop />

        <div className={`flex-1 transition-all duration-300 ${margin}`}>
          <AppHeader />
          <AppKeyHeader />

          <JumpHotkeys userRole={user?.role}>
            <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
              {children}
            </div>
          </JumpHotkeys>
        </div>
      </div>
    </ProtectedRoute>
  );
}
