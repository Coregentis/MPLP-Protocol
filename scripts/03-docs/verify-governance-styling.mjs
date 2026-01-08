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
    const governanceDir = path.join(ROOT, "docs", "docs", "12-governance");
    if (!fs.existsSync(governanceDir)) {
        fail(`Missing docs governance directory: ${governanceDir}`);
    }

    const files = listFiles(governanceDir, [".md", ".mdx"]);
    if (files.length === 0) {
        fail(`No governance docs found under: ${governanceDir}`);
    }

    const missingWrapper = [];
    const manualFooterHits = [];

    for (const f of files) {
        const text = readText(f);
        const { fm, body } = parseFrontmatter(text);

        if ((fm.wrapperClassName || "").trim() !== "governance-page") {
            console.log(`[DEBUG] Failed file: ${f}`);
            console.log(`[DEBUG] Parsed fm:`, JSON.stringify(fm));
            console.log(`[DEBUG] Raw start:`, text.slice(0, 50).replace(/\n/g, '\\n'));
            missingWrapper.push(f);
        }

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

    if (missingWrapper.length) {
        console.error("\n[FAIL] Missing wrapperClassName: governance-page");
        for (const f of missingWrapper) console.error(" -", path.relative(ROOT, f));
        process.exit(1);
    }

    // CSS rule check
    const cssPath = path.join(ROOT, "docs", "src", "css", "custom.css");
    if (!fs.existsSync(cssPath)) fail(`Missing CSS file: ${cssPath}`);
    const css = readText(cssPath);

    // Require governance-page blockquote styling presence
    // Accept either `.governance-page blockquote` or `.governance-page .markdown blockquote` etc.
    const hasRule =
        css.includes(".governance-page blockquote") ||
        /(\.governance-page[^{]*\{[\s\S]*\})/.test(css) && /blockquote/.test(css);

    if (!hasRule) {
        fail(
            `Missing required governance styling rule: .governance-page blockquote (or equivalent) in ${cssPath}`
        );
    }

    if (manualFooterHits.length) {
        console.error("\n[FAIL] Manual copyright/license footer content found in governance docs.");
        console.error("Governance docs must not embed manual footers; rely on global site footer.");
        for (const f of Array.from(new Set(manualFooterHits))) {
            console.error(" -", path.relative(ROOT, f));
        }
        process.exit(1);
    }

    pass(`Governance styling verified. Files checked: ${files.length}`);
}

main();
