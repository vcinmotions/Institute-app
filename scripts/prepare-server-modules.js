// Builds a PRODUCTION-ONLY node_modules for the installer (no dev tools such as
// typescript / ts-node / @types). electron-builder copies build/server-modules
// into the app instead of server/node_modules.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const serverDir = path.join(root, "server");
const stage = path.join(root, "build", "server-modules");

// The EXE stores its data in SQLite. If the Prisma clients in server/dist were generated for PostgreSQL
// (local development), setup fails with "the URL must start with the protocol postgresql://". Stop the build.
for (const db of ["central", "tenant"]) {
  const schema = path.join(serverDir, "dist", "prisma-client", "generated", db, "schema.prisma");
  const text = fs.existsSync(schema) ? fs.readFileSync(schema, "utf8") : "";
  if (!/provider\s*=\s*"sqlite"/.test(text)) {
    console.error(
      `\nBUILD STOPPED: server/dist/prisma-client/generated/${db} is not the SQLite client.\n` +
        "Run in server/:  npm run generate:central-prod && npm run generate:tenant-prod && npm run build\n"
    );
    process.exit(1);
  }
}

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
