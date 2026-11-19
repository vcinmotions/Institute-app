// Builds a PRODUCTION-ONLY node_modules for the installer (no dev tools such as
// typescript / ts-node / @types). electron-builder copies build/server-modules
// into the app instead of server/node_modules.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");
const stage = path.join(root, "build", "server-modules");

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
for (const f of ["package.json", "package-lock.json"]) {
  fs.copyFileSync(path.join(serverDir, f), path.join(stage, f));
}

console.log("Installing production dependencies into", stage);
execSync("npm ci --omit=dev --no-audit --no-fund", { cwd: stage, stdio: "inherit" });

// Files that are never needed at run time.
const junk = [/\.map$/, /\.d\.ts$/, /\.md$/i, /^LICENSE/i, /^CHANGELOG/i, /^README/i];
let removed = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["test", "tests", "__tests__"].includes(e.name)) {
        fs.rmSync(p, { recursive: true, force: true });
        removed++;
      } else walk(p);
    } else if (junk.some((r) => r.test(e.name))) {
      fs.rmSync(p, { force: true });
      removed++;
    }
  }
})(path.join(stage, "node_modules"));
console.log("Removed", removed, "unneeded files/folders");

fs.rmSync(path.join(stage, "package.json"));
fs.rmSync(path.join(stage, "package-lock.json"));
