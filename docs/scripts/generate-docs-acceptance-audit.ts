/**
 * MPLP Docs v1.0 - Acceptance Audit Generator (Phase 5.6)
 * Generates DOCS_ACCEPTANCE_AUDIT_REPORT_v1.0.md and enforces "0 FAIL" policy.
 */

import fs from 'fs';
import path from 'path';

const REPORTS_DIR = path.resolve(__dirname, '../reports');
const SEMANTIC_REPORT = path.join(REPORTS_DIR, 'semantic-findings.json');
const OUTPUT_FILE = path.resolve(__dirname, '../../DOCS_ACCEPTANCE_AUDIT_REPORT_v1.0.md');

interface Finding {
    rule: string;
    severity: 'FAIL' | 'WARN';
    file: string;
    message: string;
}

if (!fs.existsSync(SEMANTIC_REPORT)) {
    console.error(`Error: Findings file not found at ${SEMANTIC_REPORT}. Run 'pnpm docs:semantic:audit' first.`);
    process.exit(1);
}

const findings: Finding[] = JSON.parse(fs.readFileSync(SEMANTIC_REPORT, 'utf-8'));
const fails = findings.filter(f => f.severity === 'FAIL');
const warns = findings.filter(f => f.severity === 'WARN');

const isPass = fails.length === 0;
const status = isPass ? 'APPROVED' : 'REJECTED';

const mdContent = `
# MPLP Docs Acceptance Audit Report v1.0
**Protocol Version**: 1.0.0
**Audit Date**: ${new Date().toISOString()}
**Status**: **${status}**

## Summary
*   **Critical Failures**: ${fails.length}
*   **Warnings**: ${warns.length}
*   **Total Findings**: ${findings.length}

## Compliance Checklist

| Area | Requirement | Status |
|---|---|---|
| **Identity** | Valid Frontmatter (R1) | ${findings.some(f => f.rule === 'R1' && f.severity === 'FAIL') ? 'FAIL' : 'PASS'} |
| **Classification** | Normative/Informative Correct (R2) | ${findings.some(f => f.rule === 'R2' && f.severity === 'FAIL') ? 'FAIL' : 'PASS'} |
| **SEO** | Permalinks & Slugs (R11) | ${findings.some(f => f.rule === 'R11' && f.severity === 'FAIL') ? 'FAIL' : 'PASS'} |
| **Traceability** | Normative ID Resolution (R14) | ${findings.some(f => f.rule === 'R14' && f.severity === 'FAIL') ? 'FAIL' : 'PASS'} |
| **Generated Index** | Classified via CustomProps (R13) | ${findings.some(f => f.rule === 'R13' && f.severity === 'FAIL') ? 'FAIL' : 'PASS'} |
| **Terminology** | Clean Informative Tone (R10) | ${findings.some(f => f.rule === 'R10' && f.severity === 'FAIL') ? 'FAIL' : 'PASS'} |

## Detailed Findings

${fails.length > 0 ? '### ❌ Critical Failures\n' + fails.map(f => `- **${f.rule}** [${f.file}]: ${f.message}`).join('\n') : 'No Critical Failures.'}

${warns.length > 0 ? '### ⚠️ Warnings\n' + warns.map(f => `- **${f.rule}** [${f.file}]: ${f.message}`).join('\n') : 'No Warnings.'}

## Sign-off
*   **Release Manager**: MPLP Protocol Governance Committee
*   **System**: Antigravity Phase 5 Verification
`;

fs.writeFileSync(OUTPUT_FILE, mdContent.trim());
console.log(`Acceptance Report written to: ${OUTPUT_FILE}`);

if (!isPass) {
    console.error(`\nAudit FAILED with ${fails.length} critical errors.`);
    process.exit(1);
} else {
    console.log(`\nAudit PASSED.`);
    process.exit(0);
}
