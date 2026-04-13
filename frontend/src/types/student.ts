export interface Student {
  id: number;
  serialNumber: number;

  admissionNumber: string; // ✅ FIXED (string, not number)
  studentCode: string;

  fullName: string;
  contact: string;
  email: string;

  parentsContact?: string;
  fatherName?: string;

  qualification?: string;
  gender?: string;
  religion?: string;

  dob: string;
  admissionDate: string;

  residentialAddress?: string;
  permenantAddress?: string;

  idProofType?: string;
  idProofNumber?: string;

  referedBy?: string;

  photoUrl?: string | null;

  // ✅ ADD THESE (IMPORTANT)
  idCard?: boolean;
  bag?: boolean;

  createdAt?: string;
  updatedAt?: string;

  // ✅ OPTIONAL (if used in UI)
  courseName?: string;
  courseDuration?: string;
  courseAmount?: number;
  paymentType?: string;
}