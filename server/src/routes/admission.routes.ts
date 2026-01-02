// routes/tenantRoutes.ts
import { Router, Request } from "express";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import {
  addStudentController,
  addStudentControllerNew,
  getStudentController,
  getStudentCourseController,
} from "../controllers/admission.controller";

const router = Router();
console.log("GETTING IN ADMISSION ROUTES >>>>>>>>>>>>>>>>>>>>>>>>");
// ✅ Define where to store uploaded files
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    console.log("🚀 Destination function called");
    console.log("get Req data:", req.file);

    //const uploadPath = path.join(__dirname, "../../uploads/students");
    const uploadPath = path.join(process.cwd(), "uploads", "students");

    //const uploadPath = path.join(process.cwd(), "uploads/students"); // safe absolute path
    if (!fs.existsSync(uploadPath)) {
      console.log("Creating folder:", uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    console.log("Upload Path:", uploadPath); // Log to verify the path

    console.log("File>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    console.log("CWD:", process.cwd());
    console.log("Upload path:", uploadPath);

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Example filename: student_17301492345.jpg
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, "student_" + uniqueSuffix);
  },
});

// ✅ Optional: restrict file type (only images)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

//router.post('/admission', addStudentController);
router.post(
  "/admission",
  upload.single("profilePicture"),
  addStudentController
);
router.post(
  "/admission-new",
  upload.single("profilePicture"),
  addStudentControllerNew
);
router.get("/student", getStudentController);
router.get("/students/:id/courses", getStudentCourseController);

// Test Route
router.post("/test-upload", upload.single("profilePicture"), (req, res) => {
  console.log("In Test Upload Route");
  if (req.file) {
    console.log("File uploaded:", req.file);
    return res
      .status(200)
      .json({ message: "File uploaded successfully", file: req.file });
  } else {
    console.log("No file uploaded");
    return res.status(400).json({ message: "No file uploaded" });
  }
});

export default router;
