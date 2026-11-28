import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { getUserDataPath } from "../middlewares/runtimePaths";

/**
 * Student photo + documents.
 * Files are kept in the application DATA folder (uploads/students), NOT in the program folder: the program folder
 * is replaced on every update, and only the data folder is backed up. They are served at /uploads/students/<file>.
 */
export const studentUploadDir = () => path.join(getUserDataPath(), "uploads", "students");
export const studentFileUrl = (fileName: string) => `/uploads/students/${fileName}`;

export const MAX_DOCUMENTS = 10;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

const PHOTO_TYPES = new Map([["image/png", ".png"], ["image/jpeg", ".jpg"], ["image/webp", ".webp"]]);
const DOCUMENT_TYPES = new Map([...PHOTO_TYPES, ["application/pdf", ".pdf"]]);

export const studentUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(studentUploadDir(), { recursive: true });
      cb(null, studentUploadDir());
    },
    filename: (_req, file, cb) => {
      const ext = DOCUMENT_TYPES.get(file.mimetype) ?? ".bin";
      cb(null, `${file.fieldname === "profilePicture" ? "photo" : "doc"}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_DOCUMENTS + 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = file.fieldname === "profilePicture" ? PHOTO_TYPES : DOCUMENT_TYPES;
    if (allowed.has(file.mimetype)) return cb(null, true);
    cb(new Error(file.fieldname === "profilePicture"
      ? "The student photo must be a PNG, JPG or WEBP image."
      : "Documents must be PNG, JPG, WEBP images or PDF files."));
  },
});

/** Multer errors (too big, too many, wrong type) as a readable 400. */
export function studentUploadErrors(err: any, _req: any, res: any, next: any) {
  if (!err) return next();
  const msg =
    err.code === "LIMIT_FILE_SIZE" ? "Each file must be 5 MB or smaller."
      : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE" ? `Upload up to ${MAX_DOCUMENTS} documents.`
        : err.message || "Upload failed.";
  res.status(400).json({ error: msg });
}

/** Files received in a multipart request under one field name. */
export function filesOf(req: any, field: string): Express.Multer.File[] {
  const f = req.files;
  if (!f) return [];
  return Array.isArray(f) ? f.filter((x: any) => x.fieldname === field) : f[field] ?? [];
}

/** Deletes uploaded files (used when a request is refused after the upload). */
export function discardFiles(files: Express.Multer.File[]) {
  for (const f of files) fs.rmSync(f.path, { force: true });
}

/** Deletes a stored file by its /uploads/students/... URL (never outside that folder). */
export function deleteStoredFile(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/students/")) return;
  fs.rmSync(path.join(studentUploadDir(), path.basename(url)), { force: true });
}
