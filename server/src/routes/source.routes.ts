// routes/tenantRoutes.ts
import { Router } from "express";
import { addSourceController, getSourceController } from "../controllers/source.controller";

const router = Router();

router.post("/create-source", addSourceController);

router.get("/source", getSourceController);

export default router;
