import { loadEnv } from "./utils/envLoader";
loadEnv(); // 👈 FIRST LINE

import express from "express";
import cors from "cors";
import cron from "node-cron";
import authRoute from "./routes/auth.routes";
import path from "path";
import { PrismaClient } from "../prisma-client/generated/central";
import { isPackaged } from "./middlewares/runtimePaths";
import tenantRoutes from "../src/routes/tenant.routes";
import AdmissionRoute from "./routes/admission.routes";
import enquiryRoutes from "../src/routes/enquiry.routes";
import enquiryFollowUpRoutes from "../src/routes/enquiry.followup.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import { tenantResolverMiddleware } from "./middlewares/tenantResolverMiddleware";
import { runAllTenantFollowUps } from "./cronJobs/cron-job-runner";
import notification from "../src/routes/notification.routes";
import allClientRoutes from "../src/routes/all-admin.routes";
import StudentCourseRoute from "../src/routes/student.course.routes";
import PaymentRoute from "../src/routes/payment.routes";
import CourseRoute from "../src/routes/course.routes";
import FacultyRoute from "../src/routes/faculty.routes";
import BatchRoute from "../src/routes/batch.routes";
import LabRoute from "../src/routes/lab.routes";
import AnalyticsRoute from "../src/routes/analytics.routes";
import MasterRoute from "../src/routes/master.dashboard.routes";
import LogRoute from "../src/routes/log.routes";
import rolesRoute from "../src/routes/roles.routes";
import attendanceRoute from "./routes/attendance.routes";

const app = express();
app.use(cors());
app.use(express.json());

console.log("APP_ENV:", process.env.APP_ENV);
console.log("DB_PROVIDER:", process.env.DB_PROVIDER);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("IS_PACKED:", isPackaged);


// Serve static files from the 'uploads' directory
//app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // 🔥 Dynamic CORS Middleware
// const dynamicCors = async (req: any, callback: any) => {
//   const origin = req.header('Origin');

//   try {
//     const tenants = await prisma.tenant.findMany({
//       select: {
//         customDomain: true,
//       },
//     });

//     const allowedOrigins = tenants
//       .map((tenant) => tenant.customDomain)
//       .filter(Boolean); // remove nulls

//       // 🔥 Include localhost for dev tools or local testing
//     allowedOrigins.push('localhost:5001'); // <-- Only the hostname part

//     const isAllowed = origin && allowedOrigins.includes(new URL(origin).hostname);

//     if (isAllowed) {
//       callback(null, {
//         origin: true,
//         credentials: true,
//       });
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   } catch (err) {
//     console.error('CORS error:', err);
//     callback(new Error('CORS error'));
//   }
// };

// // Attach CORS middleware with dynamic logic
// app.use(cors(dynamicCors));

// // Core middleware
// app.use(express.json());

// Schedule to run every 15 minutes
cron.schedule("*/1 * * * *", async () => {
  console.log(`⏰ Cron Job Triggered at ${new Date().toLocaleString()}`);
  await runAllTenantFollowUps();
});

app.use("/api", tenantRoutes);
app.use("/api", MasterRoute);

//app.use(tenantResolverMiddleware);
// Apply rate limiter middleware globally or to specific routes
//app.use(limiter);
app.use("/api/auth", tenantResolverMiddleware);
app.use("/api/auth", authRoute);

app.use(authMiddleware);
app.use("/api", dashboardRoutes);
app.use("/api", AdmissionRoute);
app.use("/api", attendanceRoute);
app.use("/api", enquiryRoutes);
app.use("/api", enquiryFollowUpRoutes);
app.use("/api", notification);
app.use("/api", allClientRoutes);
app.use("/api", StudentCourseRoute);
app.use("/api", PaymentRoute);
app.use("/api", CourseRoute);
app.use("/api", FacultyRoute);
app.use("/api", BatchRoute);
app.use("/api", LabRoute);
app.use("/api", AnalyticsRoute);
app.use("/api", LogRoute);
app.use("/api", rolesRoute);

export default app;
