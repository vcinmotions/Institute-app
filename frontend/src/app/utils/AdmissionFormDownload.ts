import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

// Helper to load image as base64 for embedding in PDF
async function loadImageAsDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export const downloadAdmissionForm = async (student: any, courseDetails: any) => {
  const doc = new jsPDF();

  // Load images as base64 (adjust URLs if needed)
  const logoImg = await loadImageAsDataURL('/images/logo/institute-logo.png');
  const studentImg = student.photoUrl ? await loadImageAsDataURL(student.photoUrl) : null;
  const stampImg = await loadImageAsDataURL('/images/logo/institute-stamp.png');

  // --- Header ---

  // Logo left
  doc.addImage(logoImg, 'PNG', 14, 10, 30, 30);

  // Institute info center
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text('Tech Institute of Learning', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('123 Learning St, Near SKP School, Nehru Nagar', 105, 22, { align: 'center' });
  doc.text('Kurla (E), Mumbai, Maharashtra – 400070', 105, 28, { align: 'center' });
  doc.text('Phone: +91 98765 43210 | Email: info@techinstitute.com', 105, 34, { align: 'center' });

  // Student photo right
  if (studentImg) {
    doc.addImage(studentImg, 'JPEG', 165, 10, 30, 30);
  } else {
    // placeholder border for photo
    doc.setDrawColor(0);
    doc.rect(165, 10, 30, 30);
  }

  // Admission Form title underline
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('Admission Form', 14, 45);
  // doc.setDrawColor(0);
  // doc.setLineWidth(0.8);
  // doc.line(14, 47, 60, 47);

  // Set thin gray line
  doc.setLineWidth(0.2); // Thin line
  doc.setDrawColor(150); // Gray color (0–255, grayscale)
  doc.line(14, 57, 60, 57);

  // --- Student Information Table ---

  const studentInfo = [
    ['Reg. Number', student.serialNumber || 'N/A'],
    ['Student ID', student.studentCode || 'N/A'],
    ['Full Name', student.fullName || 'N/A'],
    ['Father\'s Name', student.fatherName || 'N/A'],
    ['Mother\'s Name', student.motherName || 'N/A'],
    ['Gender', student.gender || 'N/A'],
    ['Date of Birth', student.dob || 'N/A'],
    ['Religion', student.religion || 'N/A'],
    ['Contact', student.contact || 'N/A'],
    ['Parent Contact', student.parentsContact || 'N/A'],
    ['Email', student.email || 'N/A'],
    ['ID Proof', `${student.idProofType || 'N/A'} - ${student.idProofNumber || ''}`],
    ['Residential Address', student.residentialAddress || 'N/A'],
    ['Permanent Address', student.permenantAddress || 'N/A'],
  ];

  // Combine into rows of 4 cells: [field1, value1, field2, value2]
  // Combine into rows of 2 merged cells: ["Field: Value", "Field: Value"]
  const formattedStudentInfo: string[][] = [];
  for (let i = 0; i < studentInfo.length; i += 2) {
    const firstPair = `${studentInfo[i][0]}: ${studentInfo[i][1]}`;
    const secondPair = studentInfo[i + 1]
      ? `${studentInfo[i + 1][0]}: ${studentInfo[i + 1][1]}`
      : '';
    formattedStudentInfo.push([firstPair, secondPair]);
  }


  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Student Information', 14, 55);

  // Set thin gray line
  doc.setLineWidth(0.2); // Thin line
  doc.setDrawColor(150); // Gray color (0–255, grayscale)
  doc.line(14, 57, 60, 57);


  // autoTable(doc, {
  //   startY: 60,
  //   head: [['Field', 'Value']],
  //   body: studentInfo,
  //   theme: 'grid',
  //   styles: {
  //     font: 'times',
  //     fontSize: 10,
  //     cellPadding: 3,
  //     overflow: 'linebreak',
  //   },
  //   headStyles: {
  //     fillColor: [220, 220, 220],
  //     textColor: 0,
  //     fontStyle: 'bold',
  //     halign: 'left',
  //   },
  //   columnStyles: {
  //     0: { cellWidth: 60, fontStyle: 'bold' },
  //     1: { cellWidth: 120 },
  //   },
  //   margin: { left: 14, right: 14 },
  // });

  autoTable(doc, {
    startY: 60,
    body: formattedStudentInfo,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 4,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 85 },
    },
    margin: { left: 14, right: 14 },
  });

  // --- Course Information ---

  const yAfterStudent = doc.lastAutoTable?.finalY || 110;

  if (courseDetails?.detailedCourses?.length > 0) {
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Course Information', 14, yAfterStudent + 10);
    doc.line(14, yAfterStudent + 12, 60, yAfterStudent + 12);

    const courseTableBody = courseDetails.detailedCourses.map((item: any, i: number) => {
      const course = item.studentCourse?.course;
      const fee = item.feeStructure;
      return [
        i + 1,
        course?.name || 'N/A',
        course?.durationWeeks ? `${course.durationWeeks} Weeks` : 'N/A',
        fee?.totalAmount ? `₹${fee.totalAmount}` : 'N/A',
        fee?.paymentType || 'N/A',
      ];
    });

    autoTable(doc, {
      startY: yAfterStudent + 15,
      head: [['#', 'Course Name', 'Duration', 'Course Amount', 'Payment Type']],
      body: courseTableBody,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // --- Declaration ---

  const yAfterCourse = doc.lastAutoTable?.finalY || 160;
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Declaration', 14, yAfterCourse + 15);
  doc.line(14, yAfterCourse + 17, 50, yAfterCourse + 17);

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text(
    'I hereby declare that all the information provided above is true to the best of my knowledge. ' +
    'I agree to abide by the rules and regulations of the institute.',
    14, yAfterCourse + 25, { maxWidth: 180 }
  );

  // --- Footer (Admission date, stamp image, signature line) ---

  const footerY = yAfterCourse + 60;

  // Admission Date
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text('Admission Date:', 20, footerY);
  doc.text(
    student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A',
    20,
    footerY + 6
  );

  // Stamp Image (center)
  doc.addImage(stampImg, 'PNG', 90, footerY - 15, 30, 30);
  doc.setFontSize(8);
  doc.text('Institute Stamp', 105, footerY + 20, { align: 'center' });

  // Signature line (right)
  doc.line(150, footerY, 190, footerY);
  doc.text('Student Signature', 170, footerY + 6);

  // Save PDF
  doc.save(`AdmissionForm_${student.fullName || 'Student'}.pdf`);
};
