import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

export async function generateCertificate({
  studentName,
  courseName,
  completionDate,
  ceoName,
  headName,
  certificateName,
  outputDir = "uploads/certificates",
}: {
  studentName: string;
  courseName: string;
  completionDate: Date;
  ceoName: string;
  headName: string;
  outputDir?: string;
  certificateName: string;
}) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `${studentName.replace(/\s+/g, "_")}_${courseName.replace(
    /\s+/g,
    "_"
  )}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const width = doc.page.width;
  const height = doc.page.height;

  if (!certificateName) {
    throw new Error("certificateName is required but not provided.");
  }

  // === Load and draw background ===
  const bgPath = path.join(
    process.cwd(),
    "assets/certificates",
    certificateName
  );
  if (fs.existsSync(bgPath) || certificateName === null) {
    doc.image(bgPath, 0, 0, { width, height });
  } else {
    console.warn("⚠️ Background template not found, using white background.");
    doc.rect(0, 0, width, height).fill("#ffffff");
  }

  const TEMPLATE_MAP = {
    "template-01": {
      studentName: { x: 1000, y: 650, size: 42, align: "center" },
      courseName: { x: 1000, y: 750, size: 30, align: "center" },
      signatureLeft: { x: 450, y: 1200 },
      signatureRight: { x: 1550, y: 1200 },
      date: { x: 250, y: 1200 },
    },
  };

  const getCaptailzeName = toCapital(studentName);

  // === Dynamic text placement ===

  // Student Name
  // Load custom cursive font (you can use any .ttf or .otf font)
  const cursiveFontPath = path.join(
    process.cwd(),
    "assets",
    "fonts",
    "GreatVibes-Regular.ttf"
  );
  if (fs.existsSync(cursiveFontPath)) {
    doc.font(cursiveFontPath);
  } else {
    console.warn("⚠️ Cursive font not found, using Helvetica-Italic instead.");
    doc.font("Helvetica-Oblique");
  }

  // Student name (cursive, colored, slightly higher)
  doc
    .fillColor("#e2cd11ff")
    .text(getCaptailzeName, 0, 280, { align: "center" }); // main text

  // Course Name
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text(`for successfully completing the course "${courseName}"`, 0, 340, {
      align: "center",
    });

  // === Bottom Section: Date, CEO, and Head ===

  // Common Y position for alignment (same line)
  const bottomY = height - 90;

  // Date (left-aligned)
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#555555")
    .text(`DATE: ${completionDate.toLocaleDateString()}`, 80, bottomY);

  // === CEO Signature ===
  const ceoSignPath = path.join(process.cwd(), "assets", "ceo-sign.png");
  if (fs.existsSync(ceoSignPath)) {
    doc.image(ceoSignPath, width / 2 - 150, bottomY - 70, { width: 200 });
  }

  // === Head Signature ===
  const headSignPath = path.join(process.cwd(), "assets", "head-sign.png");
  if (fs.existsSync(headSignPath)) {
    doc.image(headSignPath, width / 2 + 150, bottomY - 70, { width: 200 });
  }

  // === CEO Text ===
  // doc
  //   .font("Helvetica-Bold")
  //   .fontSize(14)
  //   .fillColor("#000000")
  //   .text(ceoName, width / 2 - 150, bottomY - 20, { align: "center", width: 200 });

  // doc
  //   .font("Helvetica")
  //   .fontSize(12)
  //   .fillColor("#333333")
  //   .text("CEO of", width / 2 - 150, bottomY, { align: "center", width: 200 });

  // === Head Text ===
  // doc
  //   .font("Helvetica-Bold")
  //   .fontSize(14)
  //   .fillColor("#000000")
  //   .text(headName, width / 2 + 150, bottomY - 20, { align: "center", width: 200 });

  // doc
  //   .font("Helvetica")
  //   .fontSize(12)
  //   .fillColor("#333333")
  //   .text("Head of", width / 2 + 150, bottomY, { align: "center", width: 200 });

  doc.end();

  await new Promise<void>((resolve) => stream.on("finish", () => resolve()));
  return filePath;
}

function toCapital(studentName: string) {
  if (!studentName) return "";
  return studentName[0].toUpperCase() + studentName.slice(1).toLowerCase();
}
