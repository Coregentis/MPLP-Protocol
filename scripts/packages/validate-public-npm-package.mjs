#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  if (!process.argv[i]?.startsWith("--")) {
    throw new Error(`Unexpected argument: ${process.argv[i]}`);
  }
  args.set(process.argv[i].slice(2), process.argv[i + 1]);
}

const model = args.get("model");
const allowedModels = new Set(["wrapper_package", "schema_data_package"]);

if (!allowedModels.has(model)) {
  throw new Error(`Unsupported package build model: ${model}`);
}

const packageDir = process.cwd();
const packageJsonPath = path.join(packageDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const packageName = packageJson.name ?? path.basename(packageDir);
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function note(message) {
  notes.push(message);
}

function hasFile(relativePath) {
  return fs.existsSync(path.join(packageDir, relativePath));
}

function readIfExists(relativePath) {
  const absolutePath = path.join(packageDir, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function listFilesRecursive(relativePath) {
  const absolutePath = path.join(packageDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return [];
  }

  const output = [];
  const stack = [absolutePath];

  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        stack.push(path.join(current, entry));
      }
    } else {
      output.push(path.relative(packageDir, current));
    }
  }

  return output.sort();
}

function validateCoreMetadata() {
  if (!packageName.startsWith("@mplp/")) {
    fail("package name must be under @mplp scope");
  }

  if (packageJson.private === true) {
    fail("public package target must not be private");
  }

  if (!packageJson.version) {
    fail("package version is required");
  }

  if (packageJson.license !== "Apache-2.0") {
    fail("package license must be Apache-2.0");
  }

  const repositoryUrl =
    typeof packageJson.repository === "string"
      ? packageJson.repository
      : packageJson.repository?.url;

  if (!repositoryUrl?.includes("Coregentis/MPLP-Protocol")) {
    fail("repository URL must remain Coregentis/MPLP-Protocol");
  }

  if (repositoryUrl?.includes("Multi-Agent-Lifecycle-Protocol")) {
    fail("future org must not be used as current package repository URL");
  }

  const requiredFiles = ["package.json", "README.md", "DERIVATION_PROOF.yaml"];
  for (const requiredFile of requiredFiles) {
    if (!hasFile(requiredFile)) {
      fail(`missing required package artifact: ${requiredFile}`);
    }
  }

  if (!hasFile("LICENSE") && !hasFile("LICENSE.txt")) {
    fail("missing LICENSE or LICENSE.txt");
  }

  const metadataText = [
    JSON.stringify(packageJson, null, 2),
    readIfExists("README.md"),
    readIfExists("DERIVATION_PROOF.yaml"),
  ].join("\n");

  if (/Bangshi|Beijing Network Technology|Bangshi Beijing/.test(metadataText)) {
    fail("active package metadata must not contain Bangshi/Beijing identity");
  }

  if (/Multi-Agent-Lifecycle-Protocol/.test(metadataText)) {
    fail("active package metadata must not use future org as current package URL");
  }

  if (
    /mplp-certified|certified by mplp|MPLP-certified|Certified by MPLP|endorsed|endorsement|regulator approval|approved by regulator|officially approved/i.test(
      metadataText,
    )
  ) {
    fail("active package metadata must not contain certification, endorsement, or regulator approval overclaim");
  }

  const mplp = packageJson.mplp ?? {};
  if (mplp.protocolVersion !== "1.0.0") {
    fail("mplp.protocolVersion must remain 1.0.0");
  }

  if (mplp.packageClass !== "PUBLIC") {
    fail("mplp.packageClass must be PUBLIC");
  }

  if (mplp.publishSurface !== true) {
    fail("mplp.publishSurface must be true");
  }
}

function validateSchemaDataPackage() {
  if (!hasFile("schemas")) {
    fail("schema/data package must include schemas/");
    return;
  }

  const schemaFiles = listFilesRecursive("schemas").filter(
    (file) => file.endsWith(".json") || file.endsWith(".schema.json"),
  );

  if (schemaFiles.length === 0) {
    fail("schema/data package must include JSON schema/data files");
  }

  for (const schemaFile of schemaFiles) {
    try {
      JSON.parse(readIfExists(schemaFile));
    } catch (error) {
      fail(`invalid JSON schema/data file ${schemaFile}: ${error.message}`);
    }
  }
}

function validateWrapperPackage() {
  if (hasFile("src")) {
    note("src/ exists but build model is wrapper_package; this build validates package contract only");
  }

  if (hasFile("dist")) {
    note("dist/ exists and is treated as pre-existing package artifact");
  }
}

validateCoreMetadata();

if (model === "schema_data_package") {
  validateSchemaDataPackage();
} else {
  validateWrapperPackage();
}

if (packageJson.main?.startsWith("dist/") && !hasFile(packageJson.main)) {
  note(`main target ${packageJson.main} is not checked into this repo; build model is ${model}`);
}

if (packageJson.types?.startsWith("dist/") && !hasFile(packageJson.types)) {
  note(`types target ${packageJson.types} is not checked into this repo; build model is ${model}`);
}

if (failures.length > 0) {
  console.error(`Package build contract validation failed for ${packageName}:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Package build contract validation passed for ${packageName}`);
console.log(`model=${model}`);
for (const modelNote of notes) {
  console.log(`note=${modelNote}`);
}
