export class Student {
  id?: string;
  serialNumber?: number;
  studentCode?: string;
  fullName!: string;
  contact!: string;
  email!: string;
  residentialAddress!: string;
  permenantAddress!: string;
  idProofType!: string;
  idProofNumber!: string;
  admissionDate!: Date;
  religion!: string;
  fatherName!: string;
  motherName!: string;
  dob!: Date;
  gender!: "MALE" | "FEMALE" | "OTHER";
  parentsContact!: string;
  photoUrl?: string | null;
  clientAdminId!: string;

  constructor(params: Partial<Student>) {
    Object.assign(this, params);
  }

  static generateStudentCode(lastCode?: string): string {
    if (!lastCode) return "SD001";
    const next = parseInt(lastCode.slice(2)) + 1;
    return `SD${String(next).padStart(3, "0")}`;
  }

  static nextSerialNumber(lastSerial?: number): number {
    return (lastSerial ?? 0) + 1;
  }
}
