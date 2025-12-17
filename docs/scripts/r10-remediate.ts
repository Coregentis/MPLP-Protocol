/**
 * MPLP Docs v1.0 - R10 Remediation Script (Phase 4)
 * 
 * Automates Lane B exemptions:
 * - Reads docs/reports/semantic-findings.json
 * - Identifies R10 failures in spec-adjacent directories
 * - Injects `normative_refs: [MPLP-CORPUS-v1.0.0]` if missing
 * - Skips Lane A (Meta/Index) for manual rewrite
 * 
 * Usage:
 *   pnpm tsx scripts/r10-remediate.ts
 */

import fs from 'fs/promises';
import path from 'path';

const DOCS_ROOT = path.resolve(__dirname, '../docs');
const REPORTS_DIR = path.resolve(__dirname, '../reports');
const FINDINGS_PATH = path.join(REPORTS_DIR, 'semantic-findings.json');

// Lane B Directories (Safe for Exemption)
const LANE_B_DIRS = [
    '01-architecture/cross-cutting',
    '01-architecture/schema-conventions.md', // specific file
    '02-modules',
    '03-profiles',
    '04-observability',
    '05-learning',
    '06-runtime',
    '07-integration',
    '09-tests',
    '10-sdk',
    '14-ops'
];

async function main() {
    console.log("Starting R10 Remediation (Lane B - Exemption)...");

    // Read Findings
    let findings = [];
    try {
        const data = await fs.readFile(FINDINGS_PATH, 'utf-8');
        findings = JSON.parse(data);
    } catch (e) {
        console.error("Failed to read findings:", e);
        process.exit(1);
    }

    // Filter R10 Failures
    const r10Findings = findings.filter((f: any) => f.rule === 'R10' && f.severity === 'FAIL');
    console.log(`Found ${r10Findings.length} R10 failures.`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const finding of r10Findings) {
        const filePath = path.join(DOCS_ROOT, finding.file);
        const relPath = finding.file;

        // Check Lane B eligibility
        const isLaneB = LANE_B_DIRS.some(dir => relPath.startsWith(dir));

        if (!isLaneB) {
            console.log(`[SKIP] Lane A (Manual Rewrite): ${relPath}`);
            skippedCount++;
            continue;
        }

        // Apply Remediation
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Naive frontmatter injection (safe if standard format)
            // We look for the closing --- of frontmatter
            const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!fmMatch) {
                console.warn(`[WARN] No frontmatter found in ${relPath}`);
                continue;
            }

            // Check if normative_refs already exists (double check)
            if (fmMatch[1].includes('normative_refs:')) {
                console.log(`[SKIP] normative_refs already present in ${relPath}`);
                continue;
            }

            // Inject normative_refs
            const newFm = fmMatch[1] + `normative_refs:\n  - MPLP-CORPUS-v1.0.0\n`;
            const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${newFm}---`);

            await fs.writeFile(filePath, newContent);
            console.log(`[FIXED] Added normative_ref to ${relPath}`);
            fixedCount++;

        } catch (e) {
            console.error(`[ERR] Failed to process ${relPath}:`, e);
        }
    }

    console.log(`\nRemediation Complete.`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Skipped (Lane A): ${skippedCount}`);
    console.log(`Please verify changes and manually fix skipped files.`);
}

main().catch(console.error);
