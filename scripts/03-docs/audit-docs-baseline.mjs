#!/usr/bin/env node

/**
 * Docs Baseline Audit Script
 * Generates 3 baseline files for Entity Alignment initiative
 * Uses only built-in Node modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_ROOT = path.resolve(__dirname, '../../docs/docs');
const OUTPUT_DIR = path.resolve(__dirname, '../../docs-governance/audits');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Pattern registry for claim scan
const CLAIM_PATTERNS = {
    high: [
        { term: 'MPLP is a license', pattern: /MPLP\s+is\s+a\s+license/gi },
        { term: 'licensing protocol', pattern: /licensing\s+protocol/gi },
        { term: 'MPLP-compliant', pattern: /MPLP-compliant/gi },
        { term: 'Multi-Perspective License Protocol', pattern: /Multi-Perspective\s+License\s+Protocol/gi },
    ],
    medium: [
        { term: 'the POSIX of', pattern: /the\s+POSIX\s+of/gi },
        { term: 'industry standard', pattern: /industry\s+standard/gi },
        { term: 'certified', pattern: /certified/gi },
        { term: 'official endorsement', pattern: /official\s+endorsement/gi },
        { term: 'certification', pattern: /certification/gi },
        { term: 'badge', pattern: /badge/gi },
        { term: 'ranking', pattern: /ranking/gi },
    ],
    low: [
        { term: 'compatible', pattern: /\bcompatible\b/gi },
        { term: 'equivalent', pattern: /\bequivalent\b/gi },
        { term: 'same as', pattern: /same\s+as/gi },
    ],
};

function getAllMdFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllMdFiles(filePath, fileList);
        } else if (file.match(/\.(md|mdx)$/)) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { frontmatter: {}, content };
    }

    const [, frontmatterText, bodyContent] = match;
    const frontmatter = {};

    // Simple YAML parsing for our needs
    frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            frontmatter[key] = value;
        }
    });

    return { frontmatter, content: bodyContent };
}

function extractFrontmatter(filePath) {
    const fullContent = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, content } = parseFrontmatter(fullContent);

    return {
        frontmatter,
        content,
        fullContent,
    };
}

function scanClaims(content, filePath) {
    const findings = [];
    const lines = content.split('\n');

    ['high', 'medium', 'low'].forEach(severity => {
        CLAIM_PATTERNS[severity].forEach(({ term, pattern }) => {
            lines.forEach((line, index) => {
                const matches = line.match(pattern);
                if (matches) {
                    findings.push({
                        term,
                        severity,
                        file: path.relative(DOCS_ROOT, filePath),
                        line: index + 1,
                        snippet: line.trim().substring(0, 100),
                    });
                }
            });
        });
    });

    return findings;
}

function generateInventory() {
    const files = getAllMdFiles(DOCS_ROOT);
    const inventory = [];
    const claimFindings = [];

    const stats = {
        total: 0,
        normative: 0,
        formative: 0,
        nonNormative: 0,
        frozen: 0,
        active: 0,
        draft: 0,
        missingDescription: 0,
        missingNormativity: 0,
        missingLifecycleStatus: 0,
        missingAuthority: 0,
    };

    files.forEach(filePath => {
        const { frontmatter, fullContent } = extractFrontmatter(filePath);
        const relativePath = path.relative(DOCS_ROOT, filePath);

        const missingFields = [];
        if (!frontmatter.description) missingFields.push('description');
        if (!frontmatter.normativity && !frontmatter.doc_type) missingFields.push('normativity');
        if (!frontmatter.lifecycle_status && !frontmatter.status) missingFields.push('lifecycle_status');
        if (!frontmatter.authority) missingFields.push('authority');

        inventory.push({
            path: relativePath,
            file: filePath,
            doc_id: frontmatter.doc_id || null,
            doc_type: frontmatter.doc_type || null,
            status: frontmatter.status || null,
            authority: frontmatter.authority || null,
            description: frontmatter.description || null,
            normativity: frontmatter.normativity || null,
            lifecycle_status: frontmatter.lifecycle_status || null,
            missing_fields: missingFields,
        });

        // Stats
        stats.total++;
        if (!frontmatter.description) stats.missingDescription++;
        if (!frontmatter.normativity && !frontmatter.doc_type) stats.missingNormativity++;
        if (!frontmatter.lifecycle_status && !frontmatter.status) stats.missingLifecycleStatus++;
        if (!frontmatter.authority) stats.missingAuthority++;

        // Normativity distribution
        const normativity = frontmatter.normativity || frontmatter.doc_type;
        if (normativity === 'normative') stats.normative++;
        else if (normativity === 'formative') stats.formative++;
        else if (normativity === 'informative' || normativity === 'non-normative') stats.nonNormative++;

        // Lifecycle distribution
        const lifecycle = frontmatter.lifecycle_status || frontmatter.status;
        if (lifecycle === 'frozen') stats.frozen++;
        else if (lifecycle === 'active') stats.active++;
        else if (lifecycle === 'draft') stats.draft++;

        // Claim scan
        const claims = scanClaims(fullContent, filePath);
        claimFindings.push(...claims);
    });

    return { inventory, stats, claimFindings };
}

function generateReport(stats, inventory, claimFindings) {
    const report = [];

    report.push('# Docs Identity Baseline Report v1.0');
    report.push('');
    report.push(`**Generated**: ${new Date().toISOString()}`);
    report.push(`**Total Pages**: ${stats.total}`);
    report.push('');

    report.push('## Distribution Statistics');
    report.push('');
    report.push('### Normativity');
    report.push('| Type | Count | Percentage |');
    report.push('|------|-------|------------|');
    report.push(`| Normative | ${stats.normative} | ${((stats.normative / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Formative | ${stats.formative} | ${((stats.formative / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Non-Normative | ${stats.nonNormative} | ${((stats.nonNormative / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Unknown | ${stats.total - stats.normative - stats.formative - stats.nonNormative} | ${(((stats.total - stats.normative - stats.formative - stats.nonNormative) / stats.total) * 100).toFixed(1)}% |`);
    report.push('');

    report.push('### Lifecycle Status');
    report.push('| Status | Count | Percentage |');
    report.push('|--------|-------|------------|');
    report.push(`| Frozen | ${stats.frozen} | ${((stats.frozen / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Active | ${stats.active} | ${((stats.active / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Draft | ${stats.draft} | ${((stats.draft / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Unknown | ${stats.total - stats.frozen - stats.active - stats.draft} | ${(((stats.total - stats.frozen - stats.active - stats.draft) / stats.total) * 100).toFixed(1)}% |`);
    report.push('');

    report.push('## SEO Gaps');
    report.push('');
    report.push('| Field | Missing Count | Percentage |');
    report.push('|-------|---------------|------------|');
    report.push(`| Description | ${stats.missingDescription} | ${((stats.missingDescription / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Normativity | ${stats.missingNormativity} | ${((stats.missingNormativity / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Lifecycle Status | ${stats.missingLifecycleStatus} | ${((stats.missingLifecycleStatus / stats.total) * 100).toFixed(1)}% |`);
    report.push(`| Authority | ${stats.missingAuthority} | ${((stats.missingAuthority / stats.total) * 100).toFixed(1)}% |`);
    report.push('');

    report.push('## Top Missing Fields');
    report.push('');
    const missingPages = inventory.filter(p => p.missing_fields.length > 0);
    report.push(`**Total pages with missing fields**: ${missingPages.length}`);
    report.push('');
    report.push('Sample (first 10):');
    missingPages.slice(0, 10).forEach(page => {
        report.push(`- \`${page.path}\`: missing ${page.missing_fields.join(', ')}`);
    });
    report.push('');

    report.push('## Claim Scan Summary');
    report.push('');
    const highSeverity = claimFindings.filter(f => f.severity === 'high');
    const mediumSeverity = claimFindings.filter(f => f.severity === 'medium');
    const lowSeverity = claimFindings.filter(f => f.severity === 'low');

    report.push(`**High Severity**: ${highSeverity.length} findings`);
    report.push(`**Medium Severity**: ${mediumSeverity.length} findings`);
    report.push(`**Low Severity**: ${lowSeverity.length} findings`);
    report.push('');

    if (highSeverity.length > 0) {
        report.push('### High Severity Findings (Top 10)');
        highSeverity.slice(0, 10).forEach(f => {
            report.push(`- **${f.term}** in \`${f.file}:${f.line}\``);
            report.push(`  > ${f.snippet}`);
        });
        report.push('');
    }

    return report.join('\n');
}

// Main execution
console.log('Starting Docs Baseline Audit...');

const { inventory, stats, claimFindings } = generateInventory();

// Write inventory
const inventoryPath = path.join(OUTPUT_DIR, 'DOCS_IDENTITY_INVENTORY.v1.json');
fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
console.log(`✓ Generated: ${inventoryPath}`);

// Write report
const reportPath = path.join(OUTPUT_DIR, 'REPORT_DOCS_IDENTITY_BASELINE.v1.md');
const report = generateReport(stats, inventory, claimFindings);
fs.writeFileSync(reportPath, report);
console.log(`✓ Generated: ${reportPath}`);

// Write claim scan
const claimScanPath = path.join(OUTPUT_DIR, 'DOCS_POSITION_CLAIM_SCAN.v1.json');
fs.writeFileSync(claimScanPath, JSON.stringify(claimFindings, null, 2));
console.log(`✓ Generated: ${claimScanPath}`);

console.log('\nBaseline Audit Complete!');
console.log(`Total pages scanned: ${stats.total}`);
console.log(`High severity findings: ${claimFindings.filter(f => f.severity === 'high').length}`);
console.log(`Medium severity findings: ${claimFindings.filter(f => f.severity === 'medium').length}`);
console.log(`Low severity findings: ${claimFindings.filter(f => f.severity === 'low').length}`);
