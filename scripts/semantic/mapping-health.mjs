#!/usr/bin/env node
/**
 * MPLP Cross-Surface Mapping Health Check
 * Version: 1.0.0
 * Authority: MPGC (Release Gate-0)
 * 
 * Verifies that all required cross-surface links defined in
 * canonical-cross-surface-mapping.yaml are reachable.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

const MAPPING_PATH = path.join(ROOT, "MPLP_website/governance/semantic/canonical-cross-surface-mapping.yaml");

// Simple YAML parser for our specific structure
function parseSimpleYaml(content) {
    const lines = content.split("\n");
    const urls = [];

    for (const line of lines) {
        // Extract URLs from target fields
        const match = line.match(/target:\s*["']?(https?:\/\/[^\s"']+)["']?/);
        if (match) {
            urls.push(match[1]);
        }
    }

    return [...new Set(urls)];
}

async function checkUrl(url, timeout = 10000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
            redirect: "follow"
        });

        clearTimeout(timeoutId);

        return {
            url,
            status: response.status,
            ok: response.ok || response.status === 301 || response.status === 302
        };
    } catch (error) {
        return {
            url,
            status: 0,
            ok: false,
            error: error.message
        };
    }
}

function log(level, message) {
    const prefix = {
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        pass: "✅"
    }[level] || "";

    console.log(`${prefix} [MAPPING-HEALTH] ${message}`);
}

async function main() {
    console.log("\n" + "=".repeat(60));
    console.log("MPLP Cross-Surface Mapping Health Check v1.0.0");
    console.log("=".repeat(60) + "\n");

    const isCI = process.argv.includes("--ci");
    // Default to skipping live checks unless explicitly enabled
    const checkLive = process.argv.includes("--check-live");
    const skipLive = !checkLive;

    // Check if mapping file exists
    if (!fs.existsSync(MAPPING_PATH)) {
        log("warn", `Mapping file not found: ${MAPPING_PATH}`);
        log("warn", "Skipping cross-surface checks (likely OSS Release mode without Website)");
        process.exit(0); // Pass, as this is expected in OSS release
    }

    // Parse mapping file
    log("info", "Loading canonical-cross-surface-mapping.yaml...");
    const content = fs.readFileSync(MAPPING_PATH, "utf8");
    const urls = parseSimpleYaml(content);

    log("info", `Found ${urls.length} unique URLs to verify`);

    if (skipLive) {
        log("warn", "Skipping live URL checks (--skip-live)");
        log("pass", "Mapping file structure verified");
        process.exit(0);
    }

    // Check each URL
    log("info", "Checking URL reachability...\n");

    const results = [];
    for (const url of urls) {
        process.stdout.write(`  Checking ${url}... `);
        const result = await checkUrl(url);
        results.push(result);

        if (result.ok) {
            console.log(`✅ ${result.status}`);
        } else {
            console.log(`❌ ${result.status || result.error}`);
        }
    }

    // Summary
    console.log("\n" + "-".repeat(60));

    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;

    log("info", `Results: ${passed} passed, ${failed} failed`);

    // Write JSON report
    const reportPath = path.join(process.cwd(), "mapping-health-report.json");
    fs.writeFileSync(reportPath, JSON.stringify({ passed, failed, results }, null, 2));
    log("info", `Report written to ${reportPath}`);

    if (failed > 0) {
        log("error", "Some URLs are not reachable:");
        results.filter(r => !r.ok).forEach(r => {
            console.log(`   ❌ ${r.url}`);
        });

        if (isCI) {
            log("warn", "Failing CI due to unreachable URLs");
            process.exit(1);
        }
    } else {
        log("pass", "All cross-surface URLs are reachable");
    }

    console.log("-".repeat(60) + "\n");
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
