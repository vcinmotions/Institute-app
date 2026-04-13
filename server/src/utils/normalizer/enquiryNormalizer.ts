import {
  titleCase,
  normalizeEmail,
  normalizePhone,
  normalizeToLowercase,
} from "../Normalize";

export function normalizeEnquiryInput(data: any) {
  return {
    ...data,
    name: titleCase(data.name ?? ""),
    email: normalizeEmail(data.email ?? ""),
    contact: normalizePhone(data.contact ?? ""),
    alternateContact: normalizePhone(data.alternateContact ?? ""),
    location: normalizeToLowercase(data.location ?? ""),
  };
}