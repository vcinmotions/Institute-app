import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const singleDownloadReceipt = (item: any, log: any) => {
  const doc = new jsPDF();

  // =========================================================================
  // 1️⃣ COLORS & BRANDING DEFINITIONS
  // =========================================================================
  const primaryColor = [30, 41, 59];    // Deep Slate Blue (#1e293b)
  const accentColor = [2, 132, 199];    // Sky Blue (#0284c7)
  const textColor = [51, 65, 85];      // Charcoal text (#334155)
  const lightGrey = [248, 250, 252];    // Light backdrop offset (#f8fafc)

  // =========================================================================
  // 2️⃣ HEADER DECORATION BAR & CORE METADATA
  // =========================================================================
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 8, "F");

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("FEES RECEIPT", 14, 25);

  // Receipt Identifier Info (Right Aligned Header block)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const receiptNoStr = log?.receiptNo || item?.receiptNo || "N/A";
  const dateRaw = log?.paymentDate || item?.paymentDate || new Date();
  const formattedDate = new Date(dateRaw).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.text(`Receipt No: ${receiptNoStr}`, 196, 20, { align: "right" });
  doc.text(`Date: ${formattedDate}`, 196, 25, { align: "right" });
  doc.text(`Status: ${(item?.paymentStatus || "PENDING").toUpperCase()}`, 196, 30, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // =========================================================================
  // 3️⃣ CUSTOMER / STUDENT DETAILS SECTION
  // =========================================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("STUDENT PROFILE", 14, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  // Two Column Grid Layout Info Layout
  doc.text(`Student Name: ${item?.student?.fullName || "N/A"}`, 14, 52);
  doc.text(`Student Code: ${item?.student?.studentCode || "N/A"}`, 14, 58);
  doc.text(`Admission No: ${item?.student?.admissionNumber || "N/A"}`, 14, 64);

  doc.text(`Course: ${item?.course?.name || "N/A"}`, 110, 52);
  doc.text(`Payment Term: ${item?.paymentType || "N/A"}`, 110, 58);

  // =========================================================================
  // 4️⃣ TRANSACTION LEDGER SUMMARY TABLE (autoTable)
  // =========================================================================
  const totalInvoicedAmount = (item?.amountDue || 0) + (item?.amountPaid || 0);

  autoTable(doc, {
    startY: 72,
    head: [["Description", "Amount"]],
    body: [
      [`Course Fee Allocation: ${item?.course?.name || "Selected Modules"}`, `INR ${totalInvoicedAmount.toFixed(2)}`],
      ["Accumulated Balance Paid (Total)", `INR ${(item?.amountPaid || 0).toFixed(2)}`],
      ["Current Pending Outstanding Arrears", `INR ${(item?.amountDue || 0).toFixed(2)}`],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 52, halign: "right" },
    },
    styles: { font: "helvetica", fontSize: 9 },
  });

  // =========================================================================
  // 5️⃣ CURRENT TRANSACTION ITEMIZATION LOGS (Fixed Typos & Variables)
  // =========================================================================
  const nextY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("CURRENT TRANSACTION METADATA", 14, nextY);

  // Map out transaction references selectively and safely
  const modeLabel = log?.paymentMode || item?.paymentMode || "CASH";
  const txnNoLabel = log?.transactionNo || item?.transactionNo || "N/A";
  const bankLabel = log?.bankName || item?.bankName || "N/A";
  const directAmount = log?.amountPaid || item?.amountPaid || 0;

  autoTable(doc, {
    startY: nextY + 4,
    head: [["Receipt Number", "Payment Mode", "Bank Origin", "Reference ID/Cheque", "Amount Paid"]],
    body: [
      [
        receiptNoStr,
        modeLabel,
        modeLabel !== "CASH" ? bankLabel : "N/A", // 👈 FIXED: Using modeLabel instead of undefined activePaymentMode
        modeLabel !== "CASH" ? txnNoLabel : "N/A", // 👈 FIXED: Using modeLabel instead of undefined activePaymentMode
        `₹${parseFloat(directAmount).toFixed(2)}`
      ]
    ],
    theme: "grid",
    headStyles: {
      fillColor: lightGrey as [number, number, number],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      lineWidth: 0.1,
    },
    styles: { font: "helvetica", fontSize: 9, halign: "center" },
    columnStyles: {
      3: { cellWidth: 45 },
      4: { fontStyle: "bold", halign: "right" }
    }
  });

  // =========================================================================
  // 6️⃣ LEGAL COMPLIANCE FOOTER & SIGNATURE PADS
  // =========================================================================
  const closureY = (doc as any).lastAutoTable.finalY + 30;

  if (closureY > 260) {
    doc.addPage();
    renderFooterElements(doc, 40, item);
  } else {
    renderFooterElements(doc, closureY, item);
  }

  doc.save(`Receipt_${receiptNoStr}_${item?.student?.fullName || "Student"}.pdf`);
};

function renderFooterElements(doc: jsPDF, targetY: number, item: any) {
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("This is an electronically generated document. No physical signature is mandatory.", 14, targetY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.line(145, targetY - 2, 195, targetY - 2);
  doc.text("Authorized Signature", 145, targetY + 3);
  doc.setFontSize(8);
  doc.text("Institute Registrar Desk", 145, targetY + 7);
}