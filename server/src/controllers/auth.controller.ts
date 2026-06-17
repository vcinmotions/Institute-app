// controllers/authController.ts
import { Request, Response } from "express";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeLoginInput } from "../utils/normalizer/loginNormalizer";

export async function loginController(req: Request, res: Response) {

  const { email, password } = req.body;

  console.log("login data:", email, password);

  const normalizeEmail = normalizeLoginInput({ email });
  console.log("normalizeEmail:", normalizeEmail);

  if (!normalizeEmail.email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const centralPrisma = getCentralPrisma();

    // 1️⃣ MASTER ADMIN LOGIN
    const master = await centralPrisma.superAdmin.findUnique({
      where: { email: normalizeEmail.email },
    });

    if (master) {
      const valid = await bcrypt.compare(password, master.password);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign(
        { id: master.id, role: "MASTER_ADMIN", email: normalizeEmail.email },
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
    user = await tenantPrisma.clientAdmin.findUnique({ where: { email: normalizeEmail.email } });
    if (user) userType = "ADMIN";

    // b) Role User
    if (!user) {
      user = await tenantPrisma.roleUser.findUnique({
        where: { email: normalizeEmail.email },
        include: { clientAdmin: true },
      });
      if (user) userType = "ROLE_USER";
    }

    // c) Faculty
    if (!user) {
      user = await tenantPrisma.faculty.findUnique({
        where: { email: normalizeEmail.email },
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
      email: normalizeEmail.email,
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
