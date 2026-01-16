import { z } from "zod";

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortField: z.enum(["paymentDate"]).default("paymentDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED", "CANCELLED"]).optional(),
  paymentMode: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
}); 