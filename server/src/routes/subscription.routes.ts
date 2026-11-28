import express from "express";
import { getState, syncFromCloud } from "../services/subscription.service";

const router = express.Router();

// Local state (works offline).
router.get("/subscription/me", (_req, res) => {
  res.json(getState());
});

// Ask the portal for the latest status (e.g. after the user renewed online).
router.post("/subscription/refresh", async (_req, res) => {
  const result = await syncFromCloud();
  res.json({ ...result, state: getState() });
});

export default router;
