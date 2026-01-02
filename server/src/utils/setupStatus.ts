import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env"); // adjust relative path to your root .env
dotenv.config({ path: envPath });

export function isSetupComplete() {
  return !!process.env.CENTRAL_DATABASE_URL;
}
