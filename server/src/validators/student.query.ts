import { z } from "zod";

export const studentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortField: z.enum(["admissionDate"]).default("admissionDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  courseId: z.coerce.number().optional(),
  admissionDate: z.string().optional(),
});

export const studentCreateSchema = z.object({
  id: z.string().min(1, "Enquiry ID is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string().email("Invalid email").min(1),
  residentialAddress: z.string().min(1),
  permenantAddress: z.string().min(1),
  idProofType: z.string().min(1),
  idProofNumber: z.string().min(1),
  admissionDate: z.string().min(1), // can parse to Date in service
  religion: z.string().min(1),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  dob: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  parentsContact: z.string().min(1),
  courseData: z
    .array(
      z.object({
        courseId: z.union([z.number(), z.string()]),
        batchId: z.union([z.number(), z.string()]),
        feeAmount: z.number(),
        paymentType: z.enum(["INSTALLMENT", "ONE_TIME"]),
        installmentTypeId: z.number().optional(),
        installments: z
          .array(
            z.object({
              dueDate: z.string(),
              amount: z.number(),
            })
          )
          .optional(),
      })
    )
    .min(1, "At least one course must be provided"),
  photoUrl: z.string().optional(), // for uploaded photo
});
