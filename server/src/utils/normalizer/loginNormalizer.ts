import { normalizeEmail } from "../Normalize";

export function normalizeLoginInput(data: any) {
  return {
    email: normalizeEmail(data.email ?? ""),
  };
}
export function normalizeEmailInput(data: any) {
  return {
    email: normalizeEmail(data.email ?? ""),
  };
}