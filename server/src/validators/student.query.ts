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
  id: z.string(),

  name: z.string(),
  contact: z.string(),
  email: z.string(),

  admissionDate: z.string(),
  qualification: z.string(),

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
  id: z.number().min(1, "Enquiry ID is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string().email("Invalid email").min(1),
  residentialAddress: z.string().min(1),
  changeReason: z.string().min(1),
  permenantAddress: z.string().min(1),
  idProofType: z.string().min(1),
  idProofNumber: z.string().min(1),
  religion: z.string().min(1),
  fatherName: z.string().min(1),
  qualification: z.string().min(1),
  dob: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  parentsContact: z.string().min(1),
});
