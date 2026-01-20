// routes/enquiryRoutes.ts
import { Router } from "express";
import {
  addEnquiryController,
  addEnquiryControllerNew,
  deleteEnquiryController,
  editEnquiryController,
  getEnquiryByIdController,
  getEnquiryController,
  holdEnquiryController,
  lostEnquiryController,
  getWonEnquiryController
} from "../controllers/enquiry.controller";

const router = Router();

router.post("/enquiry", addEnquiryController);
router.post("/enquiry-new", addEnquiryControllerNew);
router.put("/edit-enquiry", editEnquiryController);
router.get("/enquiry", getEnquiryController);
router.get("/won-enquiry", getWonEnquiryController);
router.post("/enquiry/lost", lostEnquiryController);
router.post("/enquiry/hold", holdEnquiryController);
router.delete("/enquiry/:id", deleteEnquiryController);
router.get("/enquiry/:id", getEnquiryByIdController);

export default router;
