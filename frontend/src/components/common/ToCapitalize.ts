export const capitalizeWords = (text?: string | null) =>
  (text ?? "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
