import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = process.env.ENCRYPTION_KEY!;

// FIX: Convert hex key → bytes (exactly 32 bytes)
//const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
const ivLength = 16;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string) {
  const [ivHex, encryptedText] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
