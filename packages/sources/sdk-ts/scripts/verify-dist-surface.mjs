#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const requiredFiles = new Set([
  packageJson.main,
  packageJson.types,
]);

for (const target of Object.values(packageJson.exports || {})) {
  if (!target || typeof target !== "object") continue;
  for (const key of ["require", "import", "types"]) {
    if (target[key]) requiredFiles.add(target[key]);
  }
}

const missing = [];
for (const relativeFile of requiredFiles) {
  const normalized = relativeFile.replace(/^\.\//, "");
  if (!fs.existsSync(path.join(root, normalized))) {
    missing.push(relativeFile);
  }
}

if (missing.length > 0) {
  console.error("Missing sdk-ts source-mirror dist surface files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log("sdk-ts source-mirror dist surface OK");
