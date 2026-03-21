import crypto from "crypto";
import fs from "fs";

const algorithm = "aes-256-cbc";

function getSecret() {
  const secret = process.env.BACKUP_SECRET;
  if (!secret) {
    console.error("❌ BACKUP_SECRET missing in runtime");
    throw new Error("Backup cannot be restored: secret missing");
  }
  return secret;
}

function getKey() {
  return crypto.createHash("sha256").update(getSecret()).digest();
}

console.log("CRYPTO SECRET:", process.env.BACKUP_SECRET);

export function encryptFile(inputPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const key = getKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on("finish", resolve);
    output.on("error", reject);
    input.on("error", reject);
  });
}

export function decryptFile(inputPath: string, outputPath: string) {
  try {
    const key = getKey();

    // Read entire file buffer (safe for backups)
    const fileBuffer = fs.readFileSync(inputPath);

    // First 16 bytes = IV
    const iv = fileBuffer.subarray(0, 16);

    // Rest = encrypted data
    const encryptedData = fileBuffer.subarray(16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    fs.writeFileSync(outputPath, decrypted);    
    
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    throw new Error("Invalid backup file or wrong secret");
  }
}