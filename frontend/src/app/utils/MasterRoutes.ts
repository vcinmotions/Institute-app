interface AdminRouteItem {
  label: string;
  list: string;
  create?: string; // optional
  roles: string[];
}

export const masterRoutes: Record<string, AdminRouteItem> = {
  dashboard: {
    label: "Dashboard",
    list: "/dashboard",
    roles: ["ADMIN", "FRONT_DESK", "FACULTY"],
  },
  enquiry: {
    label: "Enquiry",
    create: "/dashboard/enquiry/create",
    list: "/dashboard/enquiry",
    roles: ["ADMIN"],
  },
  batch: {
    label: "Batch",
    list: "/dashboard/batch",
    roles: ["ADMIN"],
  },
  course: {
    label: "Course",
    create: "/dashboard/course/create",
    list: "/dashboard/course",
    roles: ["ADMIN"],
  },
  lab: {
    label: "Lab",
    create: "/dashboard/lab/create",
    list: "/dashboard/lab",
    roles: ["ADMIN"],
  },
  faculty: {
    label: "Faculty",
    create: "/dashboard/faculty/create",
    list: "/dashboard/faculty",
    roles: ["ADMIN"],
  },
  roles: {
    label: "Roles",
    create: "/dashboard/roles/create",
    list: "/dashboard/roles",
    roles: ["ADMIN"],
  },
  profile: {
    label: "Profile",
    list: "/dashboard/profile",
    roles: ["ADMIN", "FACULTY"],
  },
  admission: {
    label: "Admission",
    list: "/dashboard/admission",
    roles: ["ADMIN"],
  },
  students: {
    label: "Students",
    list: "/dashboard/student",
    roles: ["ADMIN"],
  },
  payment: {
    label: "Payment",
    list: "/dashboard/payment",
    roles: ["ADMIN"],
  },
  "student-course": {
    label: "Student Course",
    list: "/dashboard/student-course",
    roles: ["ADMIN", "FACULTY"],
  },
  "activity-logs": {
    label: "Activity Logs",
    list: "/dashboard/activity",
    roles: ["ADMIN"],
  },
  attendance: {
    label: "Attendance",
    list: "/dashboard/attendance",
    roles: ["ADMIN", "FACULTY"],
  },
  notification: {
    label: "Notification",
    list: "/dashboard/notification",
    roles: ["ADMIN"],
  },
};

export const adminMasterRoutes: Record<string, AdminRouteItem> = {
  company: {
    label: "Company",
    create: "/master-dashboard/company",
    list: "/master-dashboard",
    roles: ["MASTER_ADMIN"],
  },
  profile: {
    label: "Profile",
    list: "/master-dashboard/profile",
    roles: ["MASTER_ADMIN"],
  },
};
