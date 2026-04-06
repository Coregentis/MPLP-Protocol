#!/usr/bin/env node
/**
 * Docs Non-Normative Pointer-Only Gate
 * 
 * Enforces DOC-PTR rules:
 * 1. Must contain "Non-Normative" disclaimer for Lab-related docs.
 * 2. No restatement of adjudication/coverage facts (PASS/FAIL counts).
 * 3. Enforce Lab links.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const VALIDATION_LAB_DOC_PATH = 'docs/validation-lab';
const FORBIDDEN_PATTERNS = [
    /\d+ PASSED/i,
    /\d+ FAILED/i,
    /Coverage: \d+%/i,
    /\|.*\|.*\|/ // Table mirroring
];

const REQUIRED_DISCLAIMER = /Non-Normative/i;
const ALLOWED_LAB_LINK = /lab\.mplp\.io/;

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Docs Non-Normative Gate (DOC-PTR)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const labDocsDir = path.join(PROJECT_ROOT, VALIDATION_LAB_DOC_PATH);
    if (!fs.existsSync(labDocsDir)) {
        console.log(`ℹ️ No Validation Lab docs found at ${VALIDATION_LAB_DOC_PATH}. Skipping.`);
        process.exit(0);
    }

    let issues = [];
    let files = [];
    findFiles(labDocsDir, files);

    console.log(`🔍 Scanning ${files.length} files in ${VALIDATION_LAB_DOC_PATH}...\n`);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(PROJECT_ROOT, file);

        // 1. Check for Disclaimer
        if (!REQUIRED_DISCLAIMER.test(content)) {
            issues.push({
                file: relativePath,
                code: 'DOC-PTR-01-MISSING_NON_NORMATIVE_DECLARATION',
                msg: 'Validation Lab content must be explicitly marked as "Non-Normative".'
            });
        }

        // 2. Check for Data Mirroring
        for (const pattern of FORBIDDEN_PATTERNS) {
            if (pattern.test(content)) {
                issues.push({
                    file: relativePath,
                    code: 'DOC-PTR-02-DATA_MIRRORING',
                    msg: `Forbidden data mirror pattern detected: ${pattern}`
                });
            }
        }

        // 3. Check for Lab link
        if (!ALLOWED_LAB_LINK.test(content)) {
            issues.push({
                file: relativePath,
                code: 'DOC-PTR-03-MISSING_LAB_LINK',
                msg: 'Validation Lab content must contain a direct link to lab.mplp.io.'
            });
        }
    }

    if (issues.length > 0) {
        console.log('❌ Issues detected:\n');
        issues.forEach(i => console.log(`  [${i.code}] ${i.file}: ${i.msg}`));
        process.exit(1);
    } else {
        console.log('✅ PASS: Docs meet non-normative pointer-only requirements.');
        process.exit(0);
    }
}

function findFiles(dir, fileList) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath, fileList);
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
            fileList.push(fullPath);
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
