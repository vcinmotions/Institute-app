// types/enquiry.ts
export type LeadStatus = "HOT" | "WARM" | "COLD" | "WON" | "LOST" | "HOLD";

export interface EnquiryQuery {
  page: number;
  limit: number;
  search?: string;
  sortField?: "createdAt" | "srNo" | "leadStatus";
  sortOrder?: "asc" | "desc";
  leadStatus?: LeadStatus;
  courseId?: number;
  createdDate?: string;
}
