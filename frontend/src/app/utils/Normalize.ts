// utils/normalize.ts
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeToLowercase(str: string): string {
  return str.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  // Keep digits only, remove spaces, dashes, plus signs, etc.
  return phone.replace(/\D/g, '');
}
