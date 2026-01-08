 export const capitalizeWords = (text: string) =>
  text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());