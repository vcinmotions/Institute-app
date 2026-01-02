import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

export const downloadReceipt = (item: any) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Payment Receipt - ${item?.student?.fullName}`, 14, 20);

  const hiddenDetails = [
    ['Student ID', item.student?.id],
    ['Student Code', item.student?.studentCode],
    ['Course', item.course?.name],
    ['Total Amount', item.feeStructure?.totalAmount],
    ['Amount Paid', item.amountPaid],
    ['Amount Due', item.amountDue],
    ['Payment Type', item.feeStructure?.paymentType],
    ['Receipt No', item.receiptNo],
    ['Payment Status', item.paymentStatus],
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Field', 'Value']],
    body: hiddenDetails,
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 40) + 10,
    head: [['#', 'Receipt No', 'Amount Paid', 'Mode', 'Date']],
    body: item.feeLogs.map((log: any, i: number) => [
      i + 1,
      log.receiptNo || 'N/A',
      log.amountPaid,
      log.paymentMode,
      log.paymentDate ? new Date(log.paymentDate).toISOString().split('T')[0] : 'N/A',
    ]),
  });

  doc.save(`Receipt_${item?.student?.fullName || 'Student'}.pdf`);
};
