// src/routes/dashboard.routes.ts
import express from "express";
import {
  getFollowUpStats,
  getPendingFollowUps,
  getMissedFollowUps,
  getClientAdmin,
  updateClientAdmin,
} from "../controllers/dashboard.controller";

const router = express.Router();

router.get("/followup-stats", getFollowUpStats);
router.get("/user", getClientAdmin);
router.put("/user", updateClientAdmin);
router.get("/pending-followups", getPendingFollowUps);
router.get("/missed-followups", getMissedFollowUps);

export default router;
