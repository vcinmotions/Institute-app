import { z } from "zod";

export const enquiryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortField: z.enum(["createdAt", "srNo", "leadStatus"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  leadStatus: z.enum(["HOT", "WARM", "COLD", "WON", "LOST", "HOLD"]).optional(),
  courseId: z.coerce.number().optional(),
  createdDate: z.string().optional(),
});

export const enquiryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),

  courseId: z
    .array(z.union([z.number(), z.string()]))
    .min(1, "At least one course is required"),

  email: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().email("Invalid email").optional()
  ),
  source: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  alternateContact: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  location: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  city: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  gender: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.enum(["male", "female", "other"]).optional()
  ),
  dob: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  referedBy: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
});


export const enquiryEditSchema = z.object({
  id: z.string().min(1, "Enquiry ID is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().email("Invalid email").optional()
  ),
  source: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  alternateContact: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  location: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  city: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  gender: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.enum(["male", "female", "other"]).optional()
  ),
  dob: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
  referedBy: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().optional()
  ),
});