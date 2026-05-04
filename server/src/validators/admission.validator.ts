import { AdmissionCreateInput, AdmissionUpdateInput } from '../types/admission.types';

export async function validateAdmissionData(data: AdmissionCreateInput): Promise<AdmissionCreateInput> {
  // Basic validation
  if (!data.fullName || !data.fullName.trim()) {
    throw new Error('Student name is required');
  }

  if (!data.contact || !data.contact.trim()) {
    throw new Error('Student contact is required');
  }

  if (!data.email || !data.email.trim()) {
    throw new Error('Student email is required');
  }

  if (!data.admissionDate) {
    throw new Error('Admission date is required');
  }

  if (!data.gender) {
    throw new Error('Gender is required');
  }

  if (!data.dob) {
    throw new Error('Date of birth is required');
  }

  if (!data.courseData || !Array.isArray(data.courseData) || data.courseData.length === 0) {
    throw new Error('At least one course is required');
  }

  // Validate each course
  for (const course of data.courseData) {
    if (!course.courseId) {
      throw new Error('Course ID is required for all courses');
    }
    if (!course.batchId) {
      throw new Error('Batch ID is required for all courses');
    }
    if (!course.feeAmount || parseFloat(course.feeAmount) <= 0) {
      throw new Error('Fee amount is required and must be greater than 0');
    }
    if (!course.paymentType) {
      throw new Error('Payment type is required for all courses');
    }
  }

  return data;
}

export async function validateAdmissionUpdateData(data: AdmissionUpdateInput): Promise<AdmissionUpdateInput> {
  // Similar validation for updates
  if (data.name !== undefined && !data.name.trim()) {
    throw new Error('Student name cannot be empty');
  }

  return data;
}
