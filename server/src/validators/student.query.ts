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
  id: z.string().optional(),

  name: z.string(),
  contact: z.string(),

  email: z.string().optional(),

  admissionDate: z.string().optional(),
  qualification: z.string().optional(),

  fatherName: z.string().optional(),
  gender: z.string().optional(),
  residentialAddress: z.string().optional(),
  permenantAddress: z.string().optional(),

  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),

  localAddressProofType: z.string().optional(),
  localAddressProofNumber: z.string().optional(),

  referedBy: z.string().optional(),
  parentsContact: z.string().optional(),

  religion: z.string().optional(),
  dob: z.string().optional(),

  idCard: z.union([z.boolean(), z.string()]).optional(),
  bag: z.union([z.boolean(), z.string()]).optional(),

  photoUrl: z.string().optional().nullable(),

  courseData: z
    .array(
      z.object({
        courseId: z.union([z.number(), z.string()]).optional(),
        batchId: z.union([z.number(), z.string()]).optional(),
        feeAmount: z.number().optional(),
        paymentType: z.enum(["INSTALLMENT", "ONE_TIME"]).optional(),
        installmentTypeId: z.number().optional(),

        // 🌟 ADDED: Allow course-level payment tracking fields
        paymentMode: z.string().optional(),
        transactionNo: z.string().nullable().optional(),
        bankName: z.string().nullable().optional(),

        installments: z
          .array(
            z.object({
              dueDate: z.string().optional(),
              amount: z.number().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),

  advancePayments: z
    .array(
      z.object({
        courseId: z.union([z.number(), z.string()]).optional(),
        courseName: z.string().optional(),
        advanceAmount: z.number().optional(),
        paymentMode: z.string().optional(),
        paymentDate: z.string().optional(),

        // 🌟 ADDED: Allow advance-level transaction tracking fields
        transactionNo: z.string().nullable().optional(),
        bankName: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export const studentOpeningBalanceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  dueAmount: z.number().positive("Amount must be greater than 0"),
  admissionDate: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
});

export const studentEditSchema = z.object({
  id: z.number().optional(), // usually still required, but making optional per your ask

  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string("Invalid email").optional(),

  residentialAddress: z.string().optional(),
  permenantAddress: z.string().optional(),

  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),

  religion: z.string().optional(),
  fatherName: z.string().optional(),
  qualification: z.string().optional(),

  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),

  parentsContact: z.string().optional(),

  changeReason: z.string().optional(),
});
