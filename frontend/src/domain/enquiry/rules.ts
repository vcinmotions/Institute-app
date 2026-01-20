// domain/enquiry/rules.ts
import { LeadStatus } from "./leadStatus";

export const canEditEnquiry = (status: LeadStatus) =>
  status !== "WON" && status !== "LOST";

export const canMarkWon = (status: LeadStatus) =>
  status !== "WON" && status !== "WARM" && status !== "LOST";

export const canHoldEnquiry = (status: LeadStatus) =>
  status !== "WON" && status !== "WARM" && status !== "LOST";

export const canMarkLost = (status: LeadStatus) =>
  status !== "WON" && status !== "WARM" && status !== "LOST";

export const canEditFollowUp = (status: LeadStatus) =>
  status !== "WON"  && status !== "LOST";

export const canCreateNextFollowUp = (status: LeadStatus) =>
  status !== "WON"  && status !== "LOST";