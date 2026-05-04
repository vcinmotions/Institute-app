import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Admission API', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/admissions', () => {
    it('should create a new admission', async () => {
      const admissionData = {
        studentId: 'test-student-id',
        courseId: 'test-course-id',
        batchId: 'test-batch-id',
        admissionDate: new Date(),
        feeAmount: 10000,
        paymentType: 'FULL_PAYMENT',
      };

      const response = await request(app)
        .post('/api/admissions')
        .send(admissionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.studentId).toBe(admissionData.studentId);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        studentId: '', // Invalid empty studentId
        courseId: 'test-course-id',
      };

      const response = await request(app)
        .post('/api/admissions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/admissions', () => {
    it('should return admissions list', async () => {
      const response = await request(app)
        .get('/api/admissions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
