import { Request, Response } from "express";
import { createCentralDB } from "../utils/createCentralDB";
import { readSetupState } from "./setup-status.controller";

export async function setupCentralController(req: Request, res: Response) {
  try {
    // Setup may only run once; afterwards this public endpoint must be closed.
    if ((await readSetupState()) !== "NOT_STARTED") {
      return res.status(403).json({ error: "Setup has already been completed" });
    }

    const { clientId, password, name, email } = req.body;


    if (!clientId) {
      return res.status(400).json({ error: "clientId is required" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Licsenced Info is required" });
    }


    // ✅ STEP 1: Verify license (REMOTE SERVER)
    // const licenseRes = await fetch(
    //   "https://vcinmotions.com/licence-verify",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-APP": "vcinmotions-desktop", // optional but recommended
    //     },
    //     body: JSON.stringify({
    //       clientId,
    //       email,
    //       password,
    //     }),
    //   }
    // );

    // if (!licenseRes.ok) {
    //   return res.status(401).json({
    //     error: "License verification failed",
    //   });
    // }

    // const licenseData = await licenseRes.json();

    // if (!licenseData.valid) {
    //   return res.status(403).json({
    //     error: "Invalid license",
    //   });
    // }

    const result = await createCentralDB(clientId, { password, name, email });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message || "Setup failed",
    });
  }
}
