import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadReceipt = (item: any) => {
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
  doc.text("FEES RECEIPT STATEMENT", 14, 25);

  // Receipt Identifier Info (Right Aligned Header block)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const receiptNoStr = item?.receiptNo || "N/A";
  const formattedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.text(`Statement No: ${receiptNoStr}`, 196, 20, { align: "right" });
  doc.text(`Date Issued: ${formattedDate}`, 196, 25, { align: "right" });
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
  doc.text(`Student ID: ${item?.student?.id || "N/A"}`, 14, 64);

  doc.text(`Course: ${item?.course?.name || "N/A"}`, 110, 52);
  doc.text(`Payment Term: ${item?.feeStructure?.paymentType || "N/A"}`, 110, 58);

  // =========================================================================
  // 4️⃣ FINANCIAL MATH MATRICES (Safe Type Conversions)
  // =========================================================================
  const amountPaid = Number(item?.amountPaid || 0);
  const amountDue = Number(item?.amountDue || 0);

  // Natively fall back to summing parts if the aggregate feeStructure array record isn't compiled yet
  const totalInvoicedAmount = item?.feeStructure?.totalAmount
    ? Number(item.feeStructure.totalAmount)
    : (amountPaid + amountDue);

  // =========================================================================
  // 5️⃣ TRANSACTION LEDGER SUMMARY TABLE (autoTable)
  // =========================================================================
  autoTable(doc, {
    startY: 72,
    head: [["Financial Account Description", "Amount (INR)"]],
    body: [
      [`Course Fee Allocation: ${item?.course?.name || "Selected Modules"}`, `INR ${totalInvoicedAmount.toFixed(2)}`],
      ["Accumulated Balance Paid (Total)", `INR ${amountPaid.toFixed(2)}`],
      ["Current Pending Outstanding Arrears", `INR ${amountDue.toFixed(2)}`],
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
  // 6️⃣ ALL TRANSACTION ITEMIZATION LOGS
  // =========================================================================
  const nextY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("PAYMENT HISTORY LOGS", 14, nextY);

  const historyLogs = (item.feeLogs || []).map((log: any, i: number) => {
    const logDate = log.paymentDate
      ? new Date(log.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "N/A";

    return [
      i + 1,
      log.receiptNo || "N/A",
      log.paymentMode || "CASH",
      logDate,
      `INR ${Number(log.amountPaid || 0).toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: nextY + 4,
    head: [["#", "Receipt Number", "Payment Mode", "Payment Date", "Amount Paid"]],
    body: historyLogs,
    theme: "grid",
    headStyles: {
      fillColor: lightGrey as [number, number, number],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      lineWidth: 0.1,
    },
    styles: { font: "helvetica", fontSize: 9, halign: "center" },
    columnStyles: {
      0: { cellWidth: 15 },
      4: { fontStyle: "bold", halign: "right" }
    }
  });

  // =========================================================================
  // 7️⃣ LEGAL COMPLIANCE FOOTER & SIGNATURE PADS
  // =========================================================================
  const closureY = (doc as any).lastAutoTable.finalY + 30;

  if (closureY > 260) {
    doc.addPage();
    renderFooterElements(doc, 40);
  } else {
    renderFooterElements(doc, closureY);
  }

  doc.save(`Receipt_Statement_${item?.student?.fullName || "Student"}.pdf`);
};

function renderFooterElements(doc: jsPDF, targetY: number) {
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("This is an electronically generated statement. No physical signature is mandatory.", 14, targetY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.line(145, targetY - 2, 195, targetY - 2);
  doc.text("Authorized Signature", 145, targetY + 3);
  doc.setFontSize(8);
  doc.text("Institute Registrar Desk", 145, targetY + 7);
}