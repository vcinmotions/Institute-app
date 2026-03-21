import archiver from "archiver";
import unzipper from "unzipper";
import fs from "fs";

// ZIP
export function zipFolder(source: string, out: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(out);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(source, false);
    archive.finalize();
  });
}

// UNZIP
export function unzipFile(zipPath: string, dest: string) {
  return fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: dest }))
    .promise();
}