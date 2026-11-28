import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import { MAX_DOCUMENTS, deleteStoredFile, discardFiles, filesOf, studentFileUrl } from "../utils/studentUpload";

/**
 * Student documents (ID proof, marksheets, certificates...): list, add, delete.
 * Permissions: viewing = Admission view; adding = Admission add; deleting = Admission delete
 * (see permissions.service MODULES and roleGuard).
 */
const view = (d: any) => ({
  id: d.id, fileName: d.fileName, url: d.url, mimeType: d.mimeType, sizeBytes: d.sizeBytes,
  uploadedBy: d.uploadedBy, createdAt: d.createdAt,
});

async function studentOf(req: Request) {
  const prisma: any = req.tenantPrisma;
  const user: any = req.user;
  const id = Number(req.params.id);
  if (!prisma || !user || !Number.isInteger(id)) return null;
  const student = await prisma.student.findFirst({ where: { id, clientAdminId: user.clientAdminId }, select: { id: true, fullName: true } });
  return student ? { prisma, user, student } : null;
}

/** Saves the documents received with a request for a student. Returns an error message or null. */
export async function saveStudentDocuments(prisma: any, user: any, studentId: number, files: Express.Multer.File[]) {
  if (!files.length) return null;
  const existing = await prisma.studentDocument.count({ where: { studentId } });
  if (existing + files.length > MAX_DOCUMENTS) {
    discardFiles(files);
    return `A student can have up to ${MAX_DOCUMENTS} documents (${existing} already saved).`;
  }
  await prisma.studentDocument.createMany({
    data: files.map((f) => ({
      studentId,
      fileName: String(f.originalname || f.filename).slice(0, 200),
      url: studentFileUrl(f.filename),
      mimeType: f.mimetype,
      sizeBytes: f.size,
      uploadedBy: user?.email ?? null,
    })),
  });
  return null;
}

export async function listStudentDocuments(req: Request, res: Response) {
  const c = await studentOf(req);
  if (!c) return res.status(404).json({ error: "Student not found." });
  const docs = await c.prisma.studentDocument.findMany({ where: { studentId: c.student.id }, orderBy: { createdAt: "asc" } });
  res.json({ documents: docs.map(view), max: MAX_DOCUMENTS });
}

export async function addStudentDocuments(req: Request, res: Response) {
  const files = filesOf(req, "documents");
  const c = await studentOf(req);
  if (!c) { discardFiles(files); return res.status(404).json({ error: "Student not found." }); }
  if (!files.length) return res.status(400).json({ error: "Choose at least one file." });
  try {
    const err = await saveStudentDocuments(c.prisma, c.user, c.student.id, files);
    if (err) return res.status(400).json({ error: err });
    await logActivity({
      clientAdminId: c.user.clientAdminId, entity: "Student", entityId: String(c.student.id), action: "UPDATE",
      message: `${files.length} document(s) added for ${c.student.fullName}`, dbUrl: c.user.dbUrl,
    });
    const docs = await c.prisma.studentDocument.findMany({ where: { studentId: c.student.id }, orderBy: { createdAt: "asc" } });
    res.status(201).json({ documents: docs.map(view), max: MAX_DOCUMENTS });
  } catch (e) {
    discardFiles(files);
    console.error("add student documents failed:", e);
    res.status(500).json({ error: "Could not save the documents." });
  }
}

export async function deleteStudentDocument(req: Request, res: Response) {
  const c = await studentOf(req);
  if (!c) return res.status(404).json({ error: "Student not found." });
  const doc = await c.prisma.studentDocument.findFirst({ where: { id: Number(req.params.docId), studentId: c.student.id } });
  if (!doc) return res.status(404).json({ error: "Document not found." });
  await c.prisma.studentDocument.delete({ where: { id: doc.id } });
  deleteStoredFile(doc.url);
  await logActivity({
    clientAdminId: c.user.clientAdminId, entity: "Student", entityId: String(c.student.id), action: "DELETE",
    message: `Document "${doc.fileName}" removed for ${c.student.fullName}`, dbUrl: c.user.dbUrl,
  });
  res.json({ ok: true });
}
