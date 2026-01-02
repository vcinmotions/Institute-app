// // controllers/authController.ts
// import { Request, Response } from 'express';
// import { centralPrisma } from '../prisma-client/central-client';
// import { getTenantPrisma } from '../prisma-client/tenant-client';
// import bcrypt from 'bcryptjs';
// import * as jwt from 'jsonwebtoken';
// import path from 'path';
// import dotenv from 'dotenv';
// import { generateToken } from '../utils/jwt';
// import { sendEmail } from '../utils/email';
// import { generateLoginEmailTemplate } from '../utils/templates/login-notification';
// import { tenantResolverMiddleware } from '../middlewares/tenantResolverMiddleware';

// dotenv.config({ path: '.env' });

// export async function tenantLoginController(req: Request, res: Response) {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     // const dbUrl = process.env.CLIENT_DATABASE_URL;
//     // if (!dbUrl) {
//     //   return res.status(500).json({ error: "Database URL not configured" });
//     // }

//     // console.log("get bUrl:", dbUrl);
//     // const tenantPrisma = getTenantPrisma(dbUrl);

//     // Tenant must be loaded by middleware
//     if (!req.tenantPrisma) {
//       return res.status(400).json({ error: "Tenant database not resolved" });
//     }

//     const tenantPrisma = req.tenantPrisma;

//     // ---------------------------------------------
//     // 🔍 Step 1: Check which user type is logging in
//     // ---------------------------------------------
//     let userType: "CLIENT_ADMIN" | "ROLE_USER" | "FACULTY" | null = null;
//     let userRecord: any = null;

//     // 1️⃣ Check in ClientAdmin table
//     userRecord = await tenantPrisma.clientAdmin.findUnique({ where: { email } });
//     if (userRecord) {
//       userType = "CLIENT_ADMIN";
//     } else {
//       // 2️⃣ Check in RoleUser table
//       userRecord = await tenantPrisma.roleUser.findUnique({
//         where: { email },
//         include: { clientAdmin: true },
//       });
//       if (userRecord) {
//         userType = "ROLE_USER";
//       } else {
//         // 3️⃣ Check in Faculty table
//         userRecord = await tenantPrisma.faculty.findUnique({
//           where: { email },
//           include: { clientAdmin: true },
//         });
//         if (userRecord) {
//           userType = "FACULTY";
//         }
//       }
//     }

//     if (!userRecord || !userType) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // ---------------------------------------------
//     // 🔒 Step 2: Validate password
//     // ---------------------------------------------
//     const isValid = await bcrypt.compare(password, userRecord.password);
//     if (!isValid) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // ---------------------------------------------
//     // 🧩 Step 3: Prepare unified payload
//     // ---------------------------------------------
//     const clientAdmin =
//       userType === "CLIENT_ADMIN" ? userRecord : userRecord.clientAdmin;

//     const payload = {
//       id: userRecord.id,
//       email: userRecord.email,
//       name: userRecord.name,
//       role: userRecord.role,
//       userType, // ADMIN / ROLE_USER / FACULTY
//       clientAdminId: clientAdmin?.id ?? null,
//       instituteName: clientAdmin?.instituteName ?? null,
//     };

//     // ---------------------------------------------
//     // 🔑 Step 4: Generate JWT
//     // ---------------------------------------------
//     const token = jwt.sign(payload, process.env.JWT_SECRET!, {
//       expiresIn: "30d",
//     });

//     // ---------------------------------------------
//     // ✅ Step 5: Send unified response
//     // ---------------------------------------------

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 3600000, // 1 hour
//     });

//     return res.status(200).json({
//       message: "Login successful ✅",
//       token,
//       user: payload,
//     });
//   } catch (error) {
//     console.error("❌ Error in tenant login:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// //   export async function tenantLoginController(req: Request, res: Response) {
// //     const { email, password } = req.body;

// //     console.log("Tenant Data", email, password);

// //     try {

// //       const dbUrl = process.env.CLIENT_DATABASE_URL;

// //       if (!dbUrl) {
// //         return res.status(500).json({ error: 'Database URL not configured' });
// //       }

// //       //req.tenantPrisma = getTenantPrisma(dbUrl);

// //       const tenantPrisma = getTenantPrisma(dbUrl);

// //       // 4. Fetch the client admin from tenant DB
// //       const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email } });
// //       if (!clientAdmin) {
// //       return res.status(404).json({ error: 'Client admin not found' });
// //     }

// //     console.log("clientAdmin Found in Login", clientAdmin);

// //     // 2. Validate password
// //     const isValid = await bcrypt.compare(password, clientAdmin.password!);
// //     if (!isValid) {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     // 5. Generate JWT token via jwt helper
// //     const newToken = generateToken(
// //       {
// //         id: clientAdmin.id,
// //         email: clientAdmin.email,
// //         instituteName: clientAdmin.instituteName,
// //         role: clientAdmin.role,
// //       }
// //     )

// //     console.log("Get New token Generated By Jwt.ts", newToken);

// //     // 5. Generate JWT token
// //     const token = jwt.sign(
// //       {
// //         id: clientAdmin.id,
// //         email: clientAdmin.email,
// //         instituteName: clientAdmin.instituteName,
// //         role: clientAdmin.role,
// //       },
// //       process.env.JWT_SECRET!,
// //       { expiresIn: '30d' }
// //     );

// //     console.log("Get token Generated inside Auth Login", token);

// //     console.log("Login Successful", token);

// //     // 6. Return success response with token
// //     return res.status(200).json({
// //       message: 'Login successful',
// //       instituteName: clientAdmin.name,
// //       clientAdminId: clientAdmin.id,
// //       token: token,
// //       id: clientAdmin.id,
// //       email: clientAdmin.email,
// //       name: clientAdmin.name,
// //       role: clientAdmin.role,
// //     });

// //   } catch (error) {
// //     console.error('❌ Error in tenant login:', error);
// //     return res.status(500).json({ error: 'Internal Server Error' });
// //   }
// // }

// controllers/authController.ts
import { Request, Response } from "express";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const centralPrisma = getCentralPrisma();

    // 1️⃣ MASTER ADMIN LOGIN
    const master = await centralPrisma.superAdmin.findUnique({
      where: { email },
    });

    if (master) {
      const valid = await bcrypt.compare(password, master.password);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign(
        { id: master.id, role: "MASTER_ADMIN", email },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" }
      );

      await centralPrisma.superAdmin.update({
        where: {
          id: master.id,
        },
        data: {
          currentSessionToken: token,
          lastLoginAt: new Date(),
        },
      });

      return res.json({
        message: "Master Login Successful",
        token: token,
        id: master.id,
        email: master.email,
        name: master.name,
        role: "MASTER_ADMIN",
      });
    }

    // 2️⃣ TENANT ADMIN / ROLE USER / FACULTY LOGIN
    if (!req.tenantPrisma) {
      return res.status(404).json({ error: "Tenant not found for this email" });
    }

    const tenantPrisma = req.tenantPrisma;
    const tenantInfo = req.tenantInfo;

    console.log(
      "GET tenantInfo IN AUTH LOGIN for CLientAdmin or Role based or faculty Login:",
      tenantInfo
    );

    let userType = null;
    let user = null;

    // a) Client Admin
    user = await tenantPrisma.clientAdmin.findUnique({ where: { email } });
    if (user) userType = "ADMIN";

    // b) Role User
    if (!user) {
      user = await tenantPrisma.roleUser.findUnique({
        where: { email },
        include: { clientAdmin: true },
      });
      if (user) userType = "ROLE_USER";
    }

    // c) Faculty
    if (!user) {
      user = await tenantPrisma.faculty.findUnique({
        where: { email },
        include: { clientAdmin: true },
      });
      if (user) userType = "FACULTY";
    }

    console.log("GET USER DATA:", user);

    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    // const clientAdminId = userType === "ADMIN"
    // ? user.id
    // : user.id;

    //const clientAdminId = user.role === "ADMIN" ? user.id : user.clientAdminId;

    const clientAdminId =
      userType === "ADMIN"
        ? user.id
        : (user as any).clientAdminId ?? (user as any).clientAdmin?.id ?? null;

    const instituteName =
      (user as any).instituteName ??
      (user as any).clientAdmin?.instituteName ??
      null;

    console.log(
      "🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥  Get ClientAdminId in Login Controller:",
      clientAdminId
    );

    console.log(
      "⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ Get user in Login Controller:",
      user
    );

    const payload = {
      id: user.id,
      email,
      userType,
      role: user.role,
      dbUrl: tenantInfo.dbUrl,
      clientAdminId: clientAdminId ?? null,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });

    //return res.json({ message: "Login successful", token, user: payload });

    // await tenantPrisma.clientAdmin.update({
    //   where: {
    //     id: user.id.toLocaleString(),
    //   },
    //   data: {
    //     currentSessionToken: token,
    //     lastLoginAt: new Date(),
    //   },
    // });

    if (userType === "ADMIN") {
      await tenantPrisma.clientAdmin.update({
        where: { id: user.id.toLocaleString() },
        data: {
          currentSessionToken: token,
          lastLoginAt: new Date(),
        },
      });
    }

    if (userType === "ROLE_USER") {
      await tenantPrisma.roleUser.update({
        where: { id: user.id.toLocaleString() },
        data: {
          currentSessionToken: token,
          lastLoginAt: new Date(),
        },
      });
    }

    if (userType === "FACULTY") {
      await tenantPrisma.faculty.update({
        where: { id: Number(user.id) },
        data: {
          currentSessionToken: token,
          lastLoginAt: new Date(),
        },
      });
    }

    // 6. Return success response with token
    return res.status(200).json({
      message: "Login successful",
      instituteName: instituteName,
      clientAdminId: user.id,
      token: token,
      userType,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dbUrl: tenantInfo.dbUrl,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
