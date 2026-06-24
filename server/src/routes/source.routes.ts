// routes/tenantRoutes.ts
import { Router } from "express";
import { addSourceController, getAllSourceController, getSourceController } from "../controllers/source.controller";

const router = Router();

router.post("/create-source", addSourceController);

router.get("/source", getSourceController);

router.get("/source/all", getAllSourceController);

export default router;
