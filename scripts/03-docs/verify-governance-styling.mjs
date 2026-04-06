#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function listFiles(dir, exts) {
    const out = [];
    const stack = [dir];
    while (stack.length) {
        const cur = stack.pop();
        if (!fs.existsSync(cur)) continue;
        const st = fs.statSync(cur);
        if (st.isDirectory()) {
            for (const name of fs.readdirSync(cur)) stack.push(path.join(cur, name));
        } else {
            const ext = path.extname(cur).toLowerCase();
            if (exts.includes(ext)) out.push(cur);
        }
    }
    return out.sort();
}

function readText(p) {
    return fs.readFileSync(p, "utf8");
}

// Minimal frontmatter parser: extracts YAML-like key: value in leading --- block.
function parseFrontmatter(md) {
    md = md.replace(/^[\uFEFF\s]*/, ''); // Remove BOM and leading whitespace
    if (!md.startsWith("---")) return { fm: {}, body: md };
    const end = md.indexOf("\n---", 3);
    if (end === -1) return { fm: {}, body: md };
    const fmRaw = md.slice(3, end).trim();
    const body = md.slice(end + 4);
    const fm = {};
    for (const line of fmRaw.split("\n")) {
        const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);
        if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return { fm, body };
}

function fail(msg) {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
}

function pass(msg) {
    console.log(`[PASS] ${msg}`);
}

function main() {
    const governanceDirCandidates = [
        path.join(ROOT, "docs", "docs", "evaluation", "governance"),
        path.join(ROOT, "docs", "docs", "12-governance"),
    ];
    const governanceDir = governanceDirCandidates.find((dir) => fs.existsSync(dir));
    if (!governanceDir) {
        fail(`Missing docs governance directory. Tried: ${governanceDirCandidates.join(", ")}`);
    }

    const files = listFiles(governanceDir, [".md", ".mdx"]);
    if (files.length === 0) {
        fail(`No governance docs found under: ${governanceDir}`);
    }

    const manualFooterHits = [];

    for (const f of files) {
        const text = readText(f);
        const { body } = parseFrontmatter(text);

        // Heuristic: forbid manual copyright/license footers in governance docs
        const suspicious =
            /©\s*\d{4}/.test(text) ||
            /Licensed under the Apache License/i.test(text) ||
            /Bangshi Beijing Network Technology Limited Company/i.test(text);

        if (suspicious) {
            manualFooterHits.push(f);
        }

        // Also catch explicit "footer blocks" patterns if you use them.
        if (/^---\s*$/m.test(body) && /©/m.test(body)) {
            manualFooterHits.push(f);
        }
    }

    if (manualFooterHits.length) {
        console.error("\n[FAIL] Manual copyright/license footer content found in governance docs.");
        console.error("Governance docs must not embed manual footers; rely on global site footer.");
        for (const f of Array.from(new Set(manualFooterHits))) {
            console.error(" -", path.relative(ROOT, f));
        }
        process.exit(1);
    }

    pass(`Governance docs verified against current docs IA. Files checked: ${files.length}`);
}

main();
