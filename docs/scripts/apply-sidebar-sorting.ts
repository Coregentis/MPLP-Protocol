
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DOCS_DIR = path.resolve(__dirname, '../docs');

// Filename (basename without extension) -> Position
const SORT_MAP: Record<string, number> = {
    // 00-index
    'mplp-v1.0-protocol-overview': 1,
    'mplp-v1.0-normative-corpus-index': 2,
    'mplp-v1.0-authority-sources': 3,
    'glossary': 4,
    'mplp-v1.0-docs-map': 5,
    'api-quick-reference': 6,
    'legacy-readme-v0': 99,

    // 01-architecture
    'architecture-overview': 1,
    'l1-core-protocol': 2,
    'l2-coordination-governance': 3,
    'l3-execution-orchestration': 4,
    'l4-integration-infra': 5,
    'l1-l4-architecture-deep-dive': 6,
    'schema-conventions': 7,

    // 01-architecture/cross-cutting (Sub-folder items)
    // Note: Docusaurus sidebar_position is relative to the folder/category.
    // So 'overview' in cross-cutting starts at 1.
    'overview': 1, // dangerous if multiple files named overview? 
    // Ideally we match by full partial path or ensure uniqueness.
    // Docs structure has unique basenames mostly, but 'overview.md' appears in many folders.
    // I will implement Logic to check parent folder if needed.
    // For now, let's assume 'cross-cutting/overview.md' -> 1

    // 01 Cross-Cutting specific names
    'ael': 2,
    'vsl': 3,
    'observability': 4, // cross-cutting/observability.md
    'coordination': 5,
    'orchestration': 6,
    'state-sync': 7,
    'transaction': 8,
    'error-handling': 9,
    'event-bus': 10,
    'learning-feedback': 11,
    'protocol-versioning': 12,
    'security': 13,
    'performance': 14,

    // 02-modules
    'core-module': 1,
    'context-module': 2,
    'plan-module': 3,
    'confirm-module': 4,
    'trace-module': 5,
    'role-module': 6,
    'dialog-module': 7,
    'collab-module': 8,
    'network-module': 9,
    'module-interactions': 10,
    'extension-module': 99,

    // 03-profiles
    'sa-profile': 1,
    'sa-events': 2,
    'map-profile': 3,
    'map-events': 4,
    'multi-agent-governance-profile': 5,

    // 04-observability
    'observability-overview': 1,
    'observability-invariants': 2,
    'event-taxonomy': 3,
    'module-event-matrix': 4,
    'physical-schemas-reference': 5,
    'common-schemas-reference': 6,
    'runtime-trace-format': 7,

    // 05-learning
    'learning-overview': 1,
    'learning-invariants': 2,
    'learning-collection-points': 3,
    'learning-sample-schema': 4,

    // 06-runtime
    'runtime-glue-overview': 1,
    'module-psg-paths': 2,
    'crosscut-psg-event-binding': 3,
    'drift-and-rollback': 4,

    // 07-integration
    'integration-spec': 1,

    // 08-guides
    'quickstart-5min': 1,
    'mplp-v1.0-compliance-guide': 2,
    'mplp-v1.0-compliance-checklist': 3,
    'migration-guide': 4,

    // 09-tests
    'golden-test-suite-overview': 1,
    'golden-flow-registry': 2,
    'golden-test-suite-details': 3,
    'golden-fixture-format': 4,

    // 10-sdk
    'sdk-support-matrix': 1,
    'ts-sdk-guide': 2,
    'py-sdk-guide': 3,
    'go-sdk-guide': 4,
    'java-sdk-guide': 5,
    'schema-mapping-standard': 6,
    'codegen-from-schema': 7,

    // 11-examples
    'single-agent-flow': 1,
    'multi-agent-collab-flow': 2,
    'risk-confirmation-flow': 3,
    'error-recovery-flow': 4,
    'tool-execution-integration': 5,
    'vendor-neutral-llm-integration': 6,

    // 12-governance
    'governance-policy': 1, // inferred
    'versioning-policy': 2,
    'security-policy': 3,
    'mip-process': 4,
    'compatibility-matrix': 5,

    // 13-release
    'mplp-v1.0.0-release-notes': 1,
    'mplp-v1.0-docs-governance-summary': 2,
    'mplp-v0.9-to-v1.0-migration-guide': 3,
    'mplp-v1.0.0-known-issues': 4,
    'mplp-v1.0.3-release-audit': 5,
    'maintainer-guide': 6,
    'editorial-policy': 7,

    // 14-ops
    'ops-overview': 1,
    'deployment-checklist': 2,
    'monitoring-guide': 3,
    'release-runbook': 4,
    'schema-sdk-change-process': 5,

    // 99-meta
    'roadmap': 1,
    'faq': 2,
    'frontmatter-policy': 3
};

// Handle duplicate basenames specifically if needed
const SPECIAL_CASES: Record<string, number> = {
    // path/to/file: position
    '01-architecture/cross-cutting/overview.md': 1,
    '04-observability/observability-overview.md': 1, // Explicit basename diff, but just in case
    '05-learning/learning-overview.md': 1,
    '14-ops/ops-overview.md': 1
};

async function main() {
    const files = await glob(path.join(DOCS_DIR, '**/*.{md,mdx}'));
    let updatedCount = 0;

    for (const file of files) {
        const basename = path.basename(file, path.extname(file));
        const relPath = path.relative(DOCS_DIR, file); // e.g., 01-architecture/cross-cutting/overview.md

        let position: number | undefined = undefined;

        // check special cases first
        if (SPECIAL_CASES[relPath]) {
            position = SPECIAL_CASES[relPath];
        } else if (SORT_MAP[basename]) {
            position = SORT_MAP[basename];
        }

        if (position !== undefined) {
            const content = fs.readFileSync(file, 'utf-8');
            // Frontmatter Regex: Supports yaml block at start
            const fmRegex = /^---\n([\s\S]*?)\n---/;
            const match = content.match(fmRegex);

            if (match) {
                let fmContent = match[1];
                let newFmContent = fmContent;

                // Update or Add sidebar_position
                if (fmContent.includes('sidebar_position:')) {
                    newFmContent = fmContent.replace(/^sidebar_position:.*$/m, `sidebar_position: ${position}`);
                } else {
                    newFmContent = fmContent + `\nsidebar_position: ${position}`;
                }

                if (newFmContent !== fmContent) {
                    const newFileContent = content.replace(match[0], `---\n${newFmContent}\n---`);
                    fs.writeFileSync(file, newFileContent);
                    console.log(`Updated ${relPath} -> pos ${position}`);
                    updatedCount++;
                }
            }
        }
    }
    console.log(`Sorting Complete. Updated ${updatedCount} files.`);
}

main();
