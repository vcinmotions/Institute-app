import { Router } from "express";
import { createBranch, getBranches, updateBranch } from "../controllers/branch.controller";

const router = Router();

router.get("/branches", getBranches);
router.post("/branches", createBranch);
router.put("/branches/:id", updateBranch);

export default router;
