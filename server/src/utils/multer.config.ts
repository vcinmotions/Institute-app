// utils/multer.config.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "general";

    console.log("GET FILES;", file);

    if (file.fieldname === "logo") folder = "logo";
    if (file.fieldname === "sign") folder = "sign";
    if (file.fieldname === "stamp") folder = "stamp";

    const uploadPath = path.join("uploads", folder);

    console.log("GET UPLOADES in MULTER:", uploadPath);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
