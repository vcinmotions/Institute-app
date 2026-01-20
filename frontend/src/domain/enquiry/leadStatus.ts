// domain/enquiry/leadStatus.ts
export type LeadStatus = "HOT" | "WARM" | "COLD" | "HOLD" | "LOST" | "WON";

// --- Constants
export const LEAD_STATUS_OPTIONS = [null, "HOT", "WARM", "COLD", "LOST", "HOLD"] as const;