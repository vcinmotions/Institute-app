export interface AdmissionCreateInput {
  studentId: string;
  courseId: string;
  batchId: string;
  admissionDate: Date;
  feeAmount: number;
  paymentType: string;
  installmentTypeId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export interface AdmissionUpdateInput {
  courseId?: string;
  batchId?: string;
  admissionDate?: Date;
  feeAmount?: number;
  paymentType?: string;
  installmentTypeId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export interface AdmissionFilters {
  studentId?: string;
  courseId?: string;
  batchId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
