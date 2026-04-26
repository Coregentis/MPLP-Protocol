#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const mode = process.argv.includes("--lint") ? "lint" : "test";

const requiredPaths = [
    "schemas/v2/mplp-context.schema.json",
    "schemas/v2/mplp-plan.schema.json",
    "schemas/v2/mplp-confirm.schema.json",
    "schemas/v2/mplp-trace.schema.json",
    "tests/schema-alignment/ts-schema-alignment.test.ts",
    "tests/runtime-compat/ts-runtime-to-ts-sdk.test.ts",
    "tests/cross-language/builders/ts-builders.test.ts",
    "governance/backlog/MPLP-CANDIDATE-BACKLOG-INDEX-v0.1.md",
    "governance/mpgc-intake/MPLP-MPGC-CANDIDATE-INTAKE-INDEX-v0.1.md",
];

const jsonRoots = [
    "package.json",
    "RELEASE_MANIFEST.json",
    "governance/05-versioning/version-taxonomy-manifest.json",
    "governance/05-specialized/entity.json",
    "schemas/v2",
];

const schemaForbiddenTerms = [
    "SoloCrew",
    "solocrew",
    "Founder",
    "founder",
    "Secretary",
    "secretary",
    "Portfolio",
    "portfolio",
    "Cognitive_OS",
    "Coregentis Cognitive OS",
    "runtime-private",
    "runtime_private",
    "product projection",
    "projection consumer",
];

const failures = [];

function toAbs(relPath) {
    return path.join(ROOT, relPath);
}

function walkFiles(relPath, predicate = () => true) {
    const absPath = toAbs(relPath);
    if (!fs.existsSync(absPath)) return [];

    const files = [];
    const stack = [absPath];
    while (stack.length > 0) {
        const current = stack.pop();
        const stat = fs.statSync(current);
        if (stat.isDirectory()) {
            for (const entry of fs.readdirSync(current)) {
                stack.push(path.join(current, entry));
            }
        } else if (predicate(current)) {
            files.push(current);
        }
    }
    return files.sort();
}

function fail(message) {
    failures.push(message);
}

function assertExists(relPath) {
    if (!fs.existsSync(toAbs(relPath))) {
        fail(`Missing required path: ${relPath}`);
    }
}

function parseJsonFile(absPath) {
    try {
        JSON.parse(fs.readFileSync(absPath, "utf8"));
    } catch (error) {
        fail(`Invalid JSON: ${path.relative(ROOT, absPath)} (${error.message})`);
    }
}

function verifyJsonReadable() {
    for (const relPath of jsonRoots) {
        const absPath = toAbs(relPath);
        if (!fs.existsSync(absPath)) {
            fail(`Missing JSON root: ${relPath}`);
            continue;
        }

        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
            for (const file of walkFiles(relPath, (candidate) => candidate.endsWith(".json"))) {
                parseJsonFile(file);
            }
        } else {
            parseJsonFile(absPath);
        }
    }
}

function verifyRootScripts() {
    const packageJsonPath = toAbs("package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    for (const scriptName of ["test", "lint"]) {
        const script = packageJson.scripts?.[scriptName] ?? "";
        if (!script || /No root (tests|linting) configured/.test(script)) {
            fail(`Root npm script is not a real verification entry: ${scriptName}`);
        }
    }
}

function verifySchemaBoundaryTerms() {
    for (const file of walkFiles("schemas/v2", (candidate) => candidate.endsWith(".json") || candidate.endsWith(".yaml"))) {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, "utf8");
        for (const term of schemaForbiddenTerms) {
            if (content.includes(term)) {
                fail(`Forbidden downstream/runtime term in protocol schema surface: ${relPath} -> ${term}`);
            }
        }
    }
}

function verifyTestInventory() {
    const testFiles = walkFiles("tests", (candidate) => candidate.endsWith(".test.ts") || candidate.endsWith(".test.js"));
    if (testFiles.length === 0) {
        fail("No repository test files found under tests/");
    }
}

function printHeader() {
    console.log("============================================================");
    console.log(`MPLP Root ${mode === "lint" ? "Lint" : "Test"} Verification`);
    console.log("Scope: root verification entry only; no protocol/schema mutation");
    console.log("============================================================");
}

function main() {
    printHeader();

    for (const relPath of requiredPaths) assertExists(relPath);
    verifyJsonReadable();
    verifyRootScripts();
    verifySchemaBoundaryTerms();
    verifyTestInventory();

    if (failures.length > 0) {
        console.error("\nFINAL VERDICT: FAIL");
        for (const failure of failures) console.error(`- ${failure}`);
        process.exit(1);
    }

    console.log("\nFINAL VERDICT: PASS");
    console.log("Root verification entry is wired and protocol schema surfaces remain vendor-neutral.");
}

main();
