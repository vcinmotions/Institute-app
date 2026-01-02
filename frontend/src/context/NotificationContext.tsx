// import React, { createContext, useContext, useState, useEffect } from "react";
// import { socket } from "@/app/utils/socket";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";

// // Extend dayjs with the relativeTime plugin
// dayjs.extend(relativeTime);

// interface Notification {
//   id: string;
//   notificationMessage: string;
//   createdAt: string;
//   // add fields as needed
// }

// // Define the type of data you want to share
// interface NotificationContextType {
//   notifications: Notification[];
//   unreadCount: number;
//   markAllRead: () => void;
// }

// const NotificationContext = createContext<NotificationContextType | undefined>(
//   undefined,
// );

// export const NotificationProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     socket.connect();

//     const handleNotification = (data: any) => {
//       const newNotification = {
//         id: crypto.randomUUID(), // generate ID on the fly
//         notificationMessage: data.notificationMessage || data.message,
//         createdAt: data.createdAt,
//       };

//       setNotifications((prev) => [newNotification, ...prev]);
//       setUnreadCount((count) => count + 1);
//       console.log("Get Notification from SocketIo", data);
//     };

//     socket.on("followup-notification", handleNotification);
//     socket.on("new-followup-notification", handleNotification);
//     socket.on("payments-notification", handleNotification);
//     socket.on("new-payment-notification", handleNotification);

//     return () => {
//       socket.off("followup-notification", handleNotification);
//       socket.off("new-followup-notification", handleNotification);
//       socket.off("payments-notification", handleNotification);
//       socket.off("new-payment-notification", handleNotification);
//       socket.disconnect();
//     };
//   }, []);

//   const markAllRead = () => {
//     setUnreadCount(0);
//     setNotifications([]);
//   };

//   return (
//     <NotificationContext.Provider
//       value={{ notifications, unreadCount, markAllRead }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);

"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "@/app/utils/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  notificationMessage: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ⭐ Get logged-in user role
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  console.log("GET USERROle in Notification Context:", userRole);

  // --------------------------
  // ROLE PERMISSION LOGIC
  // --------------------------
  const canSeeFollowUp = ["ADMIN", "FRONT_DESK"].includes(userRole || "");
  const canSeePayments = ["ADMIN", "ACCOUNTANT"].includes(userRole || "");
  const isMasterAdmin = userRole === "MASTER_ADMIN";

  useEffect(() => {
    if (!userRole) return; // wait until role loads

    socket.connect();

    const handleNotification = (data: any, type: "FOLLOWUP" | "PAYMENT") => {
      if (isMasterAdmin) return; // ⛔ master admin sees NO notifications

      if (type === "FOLLOWUP" && !canSeeFollowUp) return;
      if (type === "PAYMENT" && !canSeePayments) return;

      const newNotification = {
        id: crypto.randomUUID(),
        notificationMessage: data.notificationMessage || data.message,
        createdAt: data.createdAt,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((c) => c + 1);
      console.log("Notification received:", data);
    };

    // FOLLOW-UP NOTIFICATIONS → only Frontdesk + Admin
    socket.on("followup-notification", (data) =>
      handleNotification(data, "FOLLOWUP"),
    );
    // socket.on("new-followup-notification", (data) =>
    //   handleNotification(data, "FOLLOWUP"),
    // );

    // PAYMENT NOTIFICATIONS → only Accountant + Admin
    socket.on("payments-notification", (data) =>
      handleNotification(data, "PAYMENT"),
    );
    // socket.on("new-payment-notification", (data) =>
    //   handleNotification(data, "PAYMENT"),
    // );

    return () => {
      socket.disconnect();
    };
  }, [userRole]);

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// export const useNotifications = () => useContext(NotificationContext);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }
  return ctx;
};
