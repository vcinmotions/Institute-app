import { PrismaClient } from '@prisma/client';
import { AdmissionCreateInput, AdmissionUpdateInput } from '../types/admission.types';

import logger from '../utils/logger';
import { validateAdmissionData } from '../validators/admission.validator';

export class AdmissionService {
  constructor(private prisma: PrismaClient) {}

  async createAdmission(data: AdmissionCreateInput) {
    try {
      logger.info('Creating new admission', { studentId: data.studentId });
      
      const validatedData = await validateAdmissionData(data);
      
      const admission = await this.prisma.admission.create({
        data: {
          ...validatedData,
          createdAt: new Date(),
        },
        include: {
          student: true,
          course: true,
          batch: true,
        },
      });

      logger.info('Admission created successfully', { admissionId: admission.id });
      return admission;
    } catch (error) {
      logger.error('Failed to create admission', { error, data });
      throw error;
    }
  }

  async updateAdmission(id: string, data: AdmissionUpdateInput) {
    try {
      logger.info('Updating admission', { admissionId: id });
      
      const admission = await this.prisma.admission.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          student: true,
          course: true,
          batch: true,
        },
      });

      logger.info('Admission updated successfully', { admissionId: id });
      return admission;
    } catch (error) {
      logger.error('Failed to update admission', { error, admissionId: id });
      throw error;
    }
  }

  async getAdmissions(filters: any) {
    try {
      logger.info('Fetching admissions', { filters });
      
      const admissions = await this.prisma.admission.findMany({
        where: filters,
        include: {
          student: true,
          course: true,
          batch: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return admissions;
    } catch (error) {
      logger.error('Failed to fetch admissions', { error, filters });
      throw error;
    }
  }
}
