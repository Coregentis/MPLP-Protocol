#!/usr/bin/env node
/**
 * MPLP Semantic Lint Gate
 * Version: 1.0.0
 * Authority: MPGC (Release Gate-0)
 * 
 * This script enforces semantic governance rules defined in:
 * - semantic-positioning-anchors.yaml
 * - seo-jsonld-contract.md
 * 
 * Exit 0 = PASS, Exit 1 = FAIL
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

// Configuration
const CONFIG = {
    anchorsPath: "MPLP_website/governance/semantic/semantic-positioning-anchors.yaml",

    // Forbidden terms (from anchors lint_hooks) - focusing on critical identity violations
    forbiddenTerms: [
        "MPLP compliant",
        "MPLP-compliant"
    ],

    // Additional terms that need negation context check
    contextSensitiveTerms: [
        "certified",
        "certification",
        "endorsement",
        "approved by"
    ],

    // Allowed in these contexts (documentation of forbidden terms)
    allowedContextPatterns: [
        /forbidden.*patterns/i,
        /forbidden_terms/i,
        /lint_hooks/i,
        /seo-jsonld-contract\.md/i,
        /CHANGELOG\.md/i,
        /Replaced.*instances/i,
        /forbidden.*term/i,
        /semantic-lint\.mjs/i,
        /"MPLP-compliant"/i,  // Quoted references
        /`MPLP-compliant`/i,  // Code references
        /patterns:\s*$/i
    ],

    // URL standard enforcement
    forbiddenURL: "https://mplp.io",
    canonicalURL: "https://www.mplp.io",

    // JSON-LD type whitelist
    jsonLdWhitelist: [
        "Organization", "SoftwareSourceCode", "TechArticle", "Specification",
        "FAQPage", "WebSite", "WebPage", "DefinedTerm", "DefinedTermSet"
    ],

    jsonLdForbidden: [
        "Product", "Service", "Certification", "Offer", "Review", "Rating"
    ],

    // File patterns to scan
    includePatterns: [
        "**/*.{md,mdx,ts,tsx,js,jsx,json,yaml,yml}"
    ],

    excludePatterns: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/build/**",
        "**/.git/**",
        "**/package-lock.json",
        "**/pnpm-lock.yaml"
    ],

    // T0 invariants to check
    t0Checks: [
        {
            file: "MPLP_website/app/page.tsx",
            mustContain: ["lifecycle protocol", "Agent OS Protocol"]
        },
        {
            file: "README.md",
            mustContain: ["lifecycle protocol", "Not a framework", "Not a runtime", "Not a platform"]
        },
        {
            file: "docs/docs/intro.mdx",
            mustContain: ["not", "certification"]
        }
    ]
};

// Utility functions
function readFile(filePath) {
    try {
        return fs.readFileSync(path.join(ROOT, filePath), "utf8");
    } catch (e) {
        return null;
    }
}

function getAllFiles(dir, patterns, excludes) {
    const results = [];

    // Directories to always exclude by name
    const excludedDirNames = [
        "node_modules", ".next", "dist", "build", ".git", ".docusaurus",
        ".archive", ".pytest_cache", "__pycache__", ".vscode", "reports", "tools",
        "project-governance", "docs-backup-corrupted", "docs-upgrade-kit", "release"
    ];
    const excludedFileNames = ["package-lock.json", "pnpm-lock.yaml"];

    function walk(currentDir) {
        if (!fs.existsSync(currentDir)) return;

        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const item of items) {
            // Skip excluded directories by name
            if (item.isDirectory() && excludedDirNames.includes(item.name)) {
                continue;
            }

            // Skip excluded files by name
            if (!item.isDirectory() && excludedFileNames.includes(item.name)) {
                continue;
            }

            const fullPath = path.join(currentDir, item.name);
            const relativePath = path.relative(ROOT, fullPath);

            if (item.isDirectory()) {
                walk(fullPath);
            } else {
                // Check includes
                const ext = path.extname(item.name).slice(1);
                const validExts = ["md", "mdx", "ts", "tsx", "js", "jsx", "json", "yaml", "yml"];
                if (validExts.includes(ext)) {
                    results.push({ path: relativePath, fullPath });
                }
            }
        }
    }

    walk(ROOT);
    return results;
}

function log(level, message) {
    const prefix = {
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        pass: "✅"
    }[level] || "";

    console.log(`${prefix} [SEMANTIC-LINT] ${message}`);
}

// Check functions
function checkForbiddenTerms(files) {
    log("info", "Checking forbidden terms...");
    const violations = [];

    for (const file of files) {
        const content = readFile(file.path);
        if (!content) continue;

        // Skip files that document forbidden terms
        const isDocumentation = CONFIG.allowedContextPatterns.some(p => p.test(file.path));
        if (isDocumentation) continue;

        for (const term of CONFIG.forbiddenTerms) {
            const regex = new RegExp(term, "gi");
            const matches = content.match(regex);

            if (matches) {
                // Check if in allowed context
                const lines = content.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].toLowerCase().includes(term.toLowerCase())) {
                        // Check surrounding context
                        const context = lines.slice(Math.max(0, i - 2), i + 3).join("\n");
                        const isAllowed = CONFIG.allowedContextPatterns.some(p => p.test(context));

                        if (!isAllowed) {
                            violations.push({
                                file: file.path,
                                line: i + 1,
                                term,
                                context: lines[i].trim().slice(0, 100)
                            });
                        }
                    }
                }
            }
        }
    }

    if (violations.length > 0) {
        log("error", `Found ${violations.length} forbidden term violation(s):`);
        violations.slice(0, 10).forEach(v => {
            console.log(`   ${v.file}:${v.line} - "${v.term}"`);
            console.log(`     ${v.context}`);
        });
        return false;
    }

    log("pass", "No forbidden terms found");
    return true;
}

function checkCanonicalURL(files) {
    log("info", "Checking URL standardization...");
    const violations = [];

    // Pattern to find https://mplp.io but not https://www.mplp.io
    const forbiddenPattern = /https:\/\/mplp\.io(?!\/)/g;

    for (const file of files) {
        const content = readFile(file.path);
        if (!content) continue;

        // Find all occurrences
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            // Check for forbidden URL pattern
            if (lines[i].includes("https://mplp.io") && !lines[i].includes("https://www.mplp.io")) {
                // Make sure it's not in a comment about forbidden patterns
                const isDocumentation = CONFIG.allowedContextPatterns.some(p => p.test(lines[i]));
                if (!isDocumentation) {
                    violations.push({
                        file: file.path,
                        line: i + 1,
                        content: lines[i].trim().slice(0, 100)
                    });
                }
            }
        }
    }

    if (violations.length > 0) {
        log("error", `Found ${violations.length} non-canonical URL(s) (use https://www.mplp.io):`);
        violations.slice(0, 10).forEach(v => {
            console.log(`   ${v.file}:${v.line}`);
            console.log(`     ${v.content}`);
        });
        return false;
    }

    log("pass", "All URLs use canonical format (www.mplp.io)");
    return true;
}

function checkT0Invariants() {
    log("info", "Checking T0 invariants...");
    const violations = [];

    for (const check of CONFIG.t0Checks) {
        const content = readFile(check.file);

        if (!content) {
            violations.push({ file: check.file, issue: "File not found" });
            continue;
        }

        for (const must of check.mustContain) {
            if (!content.toLowerCase().includes(must.toLowerCase())) {
                violations.push({ file: check.file, issue: `Missing: "${must}"` });
            }
        }
    }

    if (violations.length > 0) {
        log("error", `Found ${violations.length} T0 invariant violation(s):`);
        violations.forEach(v => {
            console.log(`   ${v.file}: ${v.issue}`);
        });
        return false;
    }

    log("pass", "T0 invariants verified");
    return true;
}

function checkJsonLdTypes(files) {
    log("info", "Checking JSON-LD schema types...");
    const violations = [];

    // Find files that might contain JSON-LD
    const jsonLdFiles = files.filter(f =>
        f.path.includes("json-ld") ||
        f.path.includes("jsonld") ||
        f.path.endsWith(".tsx") ||
        f.path.endsWith(".ts")
    );

    for (const file of jsonLdFiles) {
        const content = readFile(file.path);
        if (!content) continue;

        // Skip if no JSON-LD context
        if (!content.includes('"@context"') && !content.includes("'@context'")) continue;

        // Find @type declarations
        const typeMatches = content.matchAll(/"@type"\s*:\s*"([^"]+)"/g);

        for (const match of typeMatches) {
            const type = match[1];

            if (CONFIG.jsonLdForbidden.includes(type)) {
                violations.push({ file: file.path, type, reason: "Forbidden type" });
            } else if (!CONFIG.jsonLdWhitelist.includes(type)) {
                // Warn but don't fail for unknown types
                log("warn", `Unknown JSON-LD type in ${file.path}: ${type}`);
            }
        }
    }

    if (violations.length > 0) {
        log("error", `Found ${violations.length} JSON-LD type violation(s):`);
        violations.forEach(v => {
            console.log(`   ${v.file}: @type="${v.type}" (${v.reason})`);
        });
        return false;
    }

    log("pass", "JSON-LD types comply with whitelist");
    return true;
}

// Main execution
async function main() {
    console.log("\n" + "=".repeat(60));
    console.log("MPLP Semantic Lint Gate v1.0.0");
    console.log("=".repeat(60) + "\n");

    const isCI = process.argv.includes("--ci");

    // Check if Website exists (it might be excluded in OSS release)
    const websitePath = path.join(ROOT, "MPLP_website");
    const websiteExists = fs.existsSync(websitePath);

    if (!websiteExists) {
        log("warn", "MPLP_website directory not found. Skipping website-specific checks (OSS Release mode).");

        // Filter out website-specific T0 checks
        CONFIG.t0Checks = CONFIG.t0Checks.filter(check => !check.file.startsWith("MPLP_website"));

        // Disable anchors check if path starts with MPLP_website
        if (CONFIG.anchorsPath.startsWith("MPLP_website")) {
            CONFIG.anchorsPath = null;
        }
    }

    // Gather files
    log("info", "Scanning files...");
    const files = getAllFiles(ROOT, CONFIG.includePatterns, CONFIG.excludePatterns);
    log("info", `Found ${files.length} files to check`);

    // Run checks
    const results = [];

    results.push(checkForbiddenTerms(files));
    results.push(checkCanonicalURL(files));
    results.push(checkT0Invariants());
    results.push(checkJsonLdTypes(files));

    // Summary
    console.log("\n" + "-".repeat(60));

    const passed = results.every(r => r);

    if (passed) {
        log("pass", "ALL CHECKS PASSED");
        console.log("-".repeat(60) + "\n");
        process.exit(0);
    } else {
        log("error", "SEMANTIC LINT FAILED");
        console.log("-".repeat(60) + "\n");
        process.exit(1);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
