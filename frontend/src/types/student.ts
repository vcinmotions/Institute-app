export interface Student {
  serialNumber: number;
  admissionNumber: number;
  parentsContact: string;
  id: number;
  fullName: string;
  qualification: string;
  fatherName: string;
  email: string;
  contact: string;
  parentContactNumber: string;
  address: string;
  residentialAddress: string;
  permenantAddress: string;
  dob: string;
  gender: string;
  religion: string;
  idProofType: string;
  idProofNumber: string;
  studentCode: string;
  admissionDate: string;
  photoUrl: string | null;

  // ✅ Course Info
  courseName: string;
  courseDuration: string; // e.g., "6 months"
  courseAmount: number;
  paymentType: string; // e.g., "Cash", "UPI", etc.
}
