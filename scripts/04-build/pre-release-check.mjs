#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();

function runNode(scriptRelPath, args = []) {
    const scriptPath = path.resolve(ROOT, scriptRelPath);
    if (!fs.existsSync(scriptPath)) {
        return Promise.resolve({
            ok: false,
            name: scriptRelPath,
            code: 1,
            output: `Missing script: ${scriptRelPath}`,
        });
    }

    return new Promise((resolve) => {
        const p = spawn(process.execPath, [scriptPath, ...args], {
            stdio: ["ignore", "pipe", "pipe"],
            env: process.env,
        });

        let out = "";
        p.stdout.on("data", (d) => (out += d.toString()));
        p.stderr.on("data", (d) => (out += d.toString()));

        p.on("close", (code) => {
            resolve({
                ok: code === 0,
                name: scriptRelPath,
                code: code ?? 1,
                output: out.trim(),
            });
        });
    });
}

function runGitStatus(repoRelPath = ".") {
    const repoPath = path.resolve(ROOT, repoRelPath);

    return new Promise((resolve) => {
        const p = spawn("git", ["-C", repoPath, "status", "--short", "--untracked-files=all"], {
            stdio: ["ignore", "pipe", "pipe"],
            env: process.env,
        });

        let out = "";
        p.stdout.on("data", (d) => (out += d.toString()));
        p.stderr.on("data", (d) => (out += d.toString()));

        p.on("close", () => resolve(out.trim()));
    });
}

async function snapshotWorktrees() {
    return {
        root: await runGitStatus("."),
        website: await runGitStatus("MPLP_website"),
        lab: await runGitStatus("Validation_Lab"),
    };
}

function diffSnapshots(before, after) {
    const diffs = [];
    for (const scope of ["root", "website", "lab"]) {
        if (before[scope] !== after[scope]) {
            diffs.push({
                scope,
                before: before[scope] || "(clean)",
                after: after[scope] || "(clean)",
            });
        }
    }
    return diffs;
}

function printHeader() {
    console.log("============================================================");
    console.log("MPLP Pre-Release Check Suite");
    console.log("Authority: scripts/pre-release-check.mjs");
    console.log("Mode:", process.env.CI ? "CI" : "LOCAL");
    console.log("============================================================");
}

function printResult(r) {
    const status = r.ok ? "PASS" : "FAIL";
    console.log(`\n[${status}] ${r.name}`);
    if (r.output) console.log(r.output);
}

async function main() {
    printHeader();

    // Order is intentional: governance invariants → semantics → mappings → UI rules
    const checks = [
        ["scripts/04-build/update-frozen-headers.mjs", ["--check"]],
        "scripts/03-docs/semantic/semantic-lint.mjs",
        "scripts/03-docs/semantic/mapping-health.mjs",
        "scripts/03-docs/verify-governance-styling.mjs",
    ];

    const results = [];
    const baselineSnapshot = await snapshotWorktrees();
    for (const check of checks) {
        const [scriptRelPath, args] = Array.isArray(check) ? check : [check, []];
        const before = await snapshotWorktrees();
        const r = await runNode(scriptRelPath, args);
        const after = await snapshotWorktrees();
        const drift = diffSnapshots(before, after);

        if (drift.length > 0) {
            r.ok = false;
            r.code = 1;
            r.output = [
                r.output,
                "",
                "[FAIL] Verification must be non-mutating. This substep changed tracked worktree state.",
                ...drift.map((d) => `Scope: ${d.scope}\nBEFORE:\n${d.before}\nAFTER:\n${d.after}`),
            ].filter(Boolean).join("\n");
        }

        results.push(r);
        printResult(r);
    }

    const finalSnapshot = await snapshotWorktrees();
    const suiteDrift = diffSnapshots(baselineSnapshot, finalSnapshot);

    const failed = results.filter((r) => !r.ok);
    console.log("\n============================================================");
    if (failed.length === 0 && suiteDrift.length === 0) {
        console.log("FINAL VERDICT: PASS — Release eligible.");
        console.log("============================================================\n");
        process.exit(0);
    } else {
        console.log(`FINAL VERDICT: FAIL — ${failed.length + (suiteDrift.length > 0 ? 1 : 0)} check(s) failed.`);
        if (suiteDrift.length > 0) {
            console.log("Verification suite dirtied tracked worktree state:");
            for (const d of suiteDrift) {
                console.log(`- ${d.scope}`);
            }
        }
        console.log("Release is blocked until failures are remediated.");
        console.log("============================================================\n");
        process.exit(1);
    }
}

main().catch((e) => {
    console.error("\n[FATAL] pre-release-check crashed:", e);
    process.exit(1);
});
