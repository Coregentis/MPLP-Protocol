/**
 * MPLP Docs v1.0 - Bulk Frontmatter Normalization Script
 * 
 * Purpose:
 * 1. Inject `normative_id` into normative pages based on the frozen registry.
 * 2. Classify generated-index pages via `_category_.json` customProps (LOCK-GI).
 * 3. Enforce doc_role/doc_status/spec_level consistency.
 * 
 * Requirements:
 * - Idempotent (running twice produces zero diff).
 * - No YAML round-trip (preserves comments/order via line-based patching).
 * - Auditable output (reports + patch file).
 * 
 * Usage:
 *   pnpm docs:frontmatter:normalize --dry-run
 *   pnpm docs:frontmatter:normalize
 */

import fs from 'fs/promises';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { fileURLToPath } from 'url';

// =============================================================================
// Configuration
// =============================================================================

const DOCS_ROOT = path.resolve(__dirname, '../docs');
const REGISTRY_PATH = path.resolve(__dirname, '../docs/00-index/mplp-v1.0-normative-registry.yaml');
const REPORTS_DIR = path.resolve(__dirname, '../reports');

// Directory Defaults (LOCK-GI Policy)
const DIRECTORY_DEFAULTS: Record<string, { doc_status: string; doc_role: string; spec_level: string }> = {
    '00-index': { doc_status: 'normative', doc_role: 'normative_index', spec_level: 'CrossCutting' },
    '01-architecture': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L1' },
    '02-modules': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L2' },
    '03-profiles': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L2' },
    '04-observability': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'CrossCutting' },
    '05-learning': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
    '06-runtime': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L3' },
    '07-integration': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L4' },
    '08-guides': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
    '09-tests': { doc_status: 'normative', doc_role: 'test_spec', spec_level: 'CrossCutting' },
    '10-sdk': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
    '11-examples': { doc_status: 'informative', doc_role: 'example', spec_level: 'N/A' },
    '12-governance': { doc_status: 'normative', doc_role: 'policy', spec_level: 'CrossCutting' },
    '13-release': { doc_status: 'informative', doc_role: 'release', spec_level: 'N/A' },
    '14-ops': { doc_status: 'informative', doc_role: 'ops', spec_level: 'N/A' },
    '99-meta': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
};

// =============================================================================
// Types
// =============================================================================

interface RegistryEntry {
    id: string;
    permalink: string;
    spec_level?: string;
    modules?: string[];
    cross_cutting?: string[];
}

interface RegistryData {
    documents: RegistryEntry[];
}

interface Frontmatter {
    [key: string]: any;
}

interface Patch {
    file: string;
    hunks: string[]; // diff strings
    addedFields: string[];
}

// =============================================================================
// Helpers
// =============================================================================

async function loadRegistry(): Promise<{ permalinkMap: Map<string, RegistryEntry>, idMap: Map<string, RegistryEntry> }> {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const data = parseYaml(content) as RegistryData;
    const permalinkMap = new Map<string, RegistryEntry>();
    const idMap = new Map<string, RegistryEntry>();

    if (!data.documents) {
        throw new Error('Invalid registry format: missing documents key');
    }

    data.documents.forEach(doc => {
        if (doc.permalink) permalinkMap.set(doc.permalink, doc);
        if (doc.id) idMap.set(doc.id, doc);
    });

    return { permalinkMap, idMap };
}

function getFrontmatter(contentRaw: string): { fm: Frontmatter; content: string; fmRaw: string; startLine: number; endLine: number } | null {
    const content = contentRaw.replace(/^\uFEFF/, '');
    const match = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) return null;

    try {
        const fm = parseYaml(match[1]);
        return {
            fm,
            content: content, // Return clean content without BOM
            fmRaw: match[1],
            startLine: 1,
            endLine: match[1].split('\n').length + 2
        };
    } catch (e) {
        console.warn('Failed to parse frontmatter:', e);
        return null;
    }
}

// Line-based patching to avoid YAML serialization issues
function applyLineBasedPatch(originalContent: string, newFields: Record<string, any>, fmRaw: string): { newContent: string; patch: string } {
    const lines = originalContent.split('\n');
    const fmLines = fmRaw.split('\n');
    const fmEndIndex = fmLines.length + 1; // +1 for opening ---

    // We insert new fields at the end of the frontmatter block, before the closing ---
    // But first check if they exist to update them inline? 
    // Requirement says "Do not reorder existing YAML keys".
    // For simplicity and safety, if a key exists, we don't touch it unless value is wrong?
    // User said: "Inject ... ensuring frontmatter has (minimum): ..."

    const modifiedLines = [...lines]; // Copy
    const patchHunks: string[] = [];

    // Strategy:
    // 1. For each field we want to enforce:
    //    a. Check if it exists in current frontmatter (regex check on lines is safer than YAML parse if we want to preserve comments)
    //    b. If exists, check value. If value matches, do nothing. If mismatched, replace line.
    //    c. If missing, buffer it to append at end of frontmatter.

    const insertions: string[] = [];

    Object.entries(newFields).forEach(([key, value]) => {
        const valueStr = JSON.stringify(value); // generic stringify, usually safe for scalars. Arrays need care.
        const yamlValue = Array.isArray(value) ? `[${value.join(', ')}]` : value;

        // Find line starting with "key:"
        const regex = new RegExp(`^${key}:\\s*(.*)`);
        let found = false;

        for (let i = 1; i < fmEndIndex; i++) {
            const line = modifiedLines[i];
            if (regex.test(line)) {
                found = true;
                // Existing field. Do we validte value?
                // "Ensure frontmatter has..." usually implies overwriting if wrong, or at least ensuring.
                // But preserving comments is hard if we overwrite.
                // Let's assume for this "Injection" phase, if `normative_id` exists but is wrong/different, we warn? 
                // Or overwrite? Implementing overwrite is safest for sealing.

                // NOTE: Simple regex replacement might break multi-line values. 
                // For protocol-grade script, we'll assume standard scalar/inline-array values for these specific metadata fields.

                // Check if value is different (basic string comparison)
                const currentVal = line.split(':')[1].trim();
                // This is loose comparison.

                // Force update for critical fields if we are sure
                if (key === 'normative_id' || key === 'doc_status' || key === 'doc_role' || key === 'permalink') {
                    // Update line
                    if (`${key}: ${yamlValue}` !== line.trim()) {
                        const oldLine = modifiedLines[i];
                        modifiedLines[i] = `${key}: ${yamlValue}`;
                        patchHunks.push(`- ${oldLine}\n+ ${modifiedLines[i]}`);
                    }
                }
                break;
            }
        }

        if (!found) {
            insertions.push(`${key}: ${yamlValue}`);
        }
    });

    if (insertions.length > 0) {
        // Insert before closing '---'
        // fmLines.length is count of lines inside. +1 is the line index of closing --- relative to start?
        // original:
        // --- (0)
        // title: ... (1)
        // --- (2)
        //
        // fmEndIndex is where closing --- is.
        // We insert at fmEndIndex.

        const insertIdx = fmEndIndex;
        modifiedLines.splice(insertIdx, 0, ...insertions);

        patchHunks.push(`@ -${insertIdx},0 +${insertIdx},${insertions.length} @\n` + insertions.map(l => `+ ${l}`).join('\n'));
    }

    return { newContent: modifiedLines.join('\n'), patch: patchHunks.join('\n') };
}

// =============================================================================
// Main Logic
// =============================================================================

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const { permalinkMap, idMap } = await loadRegistry();

    console.log(`Loaded ${permalinkMap.size} entries (by permalink) and ${idMap.size} (by ID) from registry.`);

    // Prepare reports
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    const reportPatch: any[] = [];
    let unifiedDiff = '';

    // Walker
    async function walk(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.relative(DOCS_ROOT, fullPath);

            if (entry.isDirectory()) {
                // Process _category_.json
                const catPath = path.join(fullPath, '_category_.json');
                try {
                    await fs.access(catPath);
                    await processCategory(catPath, relPath, dryRun);
                } catch { } // no category file

                await walk(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
                await processDoc(fullPath, relPath, permalinkMap, idMap, dryRun);
            }
        }
    }

    async function processDoc(
        filePath: string,
        relPath: string,
        permalinkMap: Map<string, RegistryEntry>,
        idMap: Map<string, RegistryEntry>,
        dryRun: boolean
    ) {
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const fmData = getFrontmatter(rawContent);

        if (!fmData) {
            console.warn(`[SKIP] No valid frontmatter found in: ${relPath}`);
            return;
        }

        const content = fmData.content; // Working with clean content

        let permalink = fmData.fm.permalink;
        if (!permalink && fmData.fm.slug) {
            // heuristic? User said "don't guess wildly".
            // But allow slug as permalink proxy if it starts with /?
            if (String(fmData.fm.slug).startsWith('/')) permalink = fmData.fm.slug;
        }

        const existingId = fmData.fm.normative_id;

        // Determine if normative via Chain of Truth:
        // 1. Match by ID (strongest signal if present)
        // 2. Match by Permalink
        let regEntry = existingId ? idMap.get(existingId) : undefined;

        if (!regEntry && permalink) {
            regEntry = permalinkMap.get(permalink);
        }

        // Heuristic: Try to match by file path if permalink is missing
        if (!regEntry && !permalink) {
            // 1. remove extension
            let cleanPath = relPath.replace(/\.(md|mdx)$/, '');

            // 2. strip number prefixes from segments (e.g. 09-tests -> tests) to match Docusaurus default
            // logic: split by /, replace ^\d{2,}- in each segment, join
            const parts = cleanPath.split('/').map(p => p.replace(/^\d{2,}-/, ''));
            cleanPath = parts.join('/');

            const derivedPath = '/' + cleanPath;
            regEntry = permalinkMap.get(derivedPath);

            // 3. Fallback: Try raw path without stripping numbers (in case registry uses 00-index explicitly)
            if (!regEntry) {
                const rawPath = '/' + relPath.replace(/\.(md|mdx)$/, '');
                regEntry = permalinkMap.get(rawPath);
            }
        }

        // Directory defaults
        const dirName = relPath.split(path.sep)[0]; // e.g., '01-architecture'
        const defaults = DIRECTORY_DEFAULTS[dirName];

        const fieldsToInject: Record<string, any> = {};

        if (regEntry) {
            // IS Normative
            fieldsToInject['doc_status'] = 'normative';
            fieldsToInject['doc_role'] = defaults?.doc_role || 'normative_spec';
            fieldsToInject['protocol_version'] = '1.0.0';
            fieldsToInject['spec_level'] = regEntry.spec_level || defaults?.spec_level || 'L2';
            fieldsToInject['normative_id'] = regEntry.id;

            if (regEntry.permalink) {
                fieldsToInject['permalink'] = regEntry.permalink;
            }

            if (regEntry.modules && regEntry.modules.length > 0) fieldsToInject['modules'] = regEntry.modules;
            if (regEntry.cross_cutting && regEntry.cross_cutting.length > 0) fieldsToInject['cross_cutting'] = regEntry.cross_cutting;

            if (!fmData.fm.normative_refs) fieldsToInject['normative_refs'] = [];

        } else {
            // Not in registry
            if (defaults) {
                if (defaults.doc_status === 'normative') {
                    // Normative Candidate but NO Registry Entry -> Downgrade to Informative
                    console.warn(`[WARN] Downgrading to informative: ${relPath} (Reason: Not in registry)`);
                    fieldsToInject['doc_status'] = 'informative';
                    fieldsToInject['doc_role'] = 'guide'; // Generic fallback
                    // Remove normative_id if it existed (though it shouldn't if we are here)
                } else {
                    // Informative - explicitly inject to override any defaults or existing bad values
                    fieldsToInject['doc_status'] = defaults.doc_status;
                    fieldsToInject['doc_role'] = defaults.doc_role;
                }
            }
        }

        // ...

        if (Object.keys(fieldsToInject).length > 0) {
            const { newContent, patch } = applyLineBasedPatch(content, fieldsToInject, fmData.fmRaw);

            if (relPath.includes('learning-overview')) {
                console.log(`[DEBUG] ${relPath}: Defaults=${!!defaults}, RegEntry=${!!regEntry}, Inject keys=${Object.keys(fieldsToInject).join(',')}, Patch len=${patch.length}`);
            }

            if (patch) {
                reportPatch.push({ file: relPath, changes: fieldsToInject });
                unifiedDiff += `--- a/${relPath}\n+++ b/${relPath}\n${patch}\n`;

                if (!dryRun) {
                    await fs.writeFile(filePath, newContent);
                    if (relPath.includes('learning-overview')) console.log(`[DEBUG] Wrote file ${relPath}`);
                }
            } else {
                if (relPath.includes('learning-overview')) console.log(`[DEBUG] No patch generated for ${relPath}`);
            }
        } else {
            if (relPath.includes('learning-overview')) console.log(`[DEBUG] No fields to inject for ${relPath}`);
        }
    }

    async function processCategory(filePath: string, relPath: string, dryRun: boolean) {
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const content = rawContent.replace(/^\uFEFF/, '');
        let data;
        try {
            data = JSON.parse(content);
        } catch (e) { console.warn(`[WARN] JSON parse failed for ${relPath}:`, e); return; }

        const dirName = relPath.split(path.sep)[0];
        const defaults = DIRECTORY_DEFAULTS[dirName];

        if (!defaults) return;

        let changed = false;
        if (!data.customProps) {
            data.customProps = {};
            changed = true;
        }

        const cp = data.customProps;

        // Inject defaults if missing
        if (!cp.doc_status) { cp.doc_status = defaults.doc_status; changed = true; }
        if (!cp.doc_role) {
            // Special case logic for indexes?
            // "If directory is normative and category is generated-index, doc_role should typically be normative_index"
            // We can use defaults.doc_role, which we set to 'normative_index' for 00-index.
            // But for 01-architecture, default is normative_spec. The index of architecture should be normative_index?
            // Actually, generated-index for a folder of specs is usually an index to specs.
            // Let's stick to defaults for now or logic:
            if (defaults.doc_status === 'normative') {
                cp.doc_role = 'normative_index'; // Generated index IS an index
            } else {
                cp.doc_role = defaults.doc_role;
            }
            changed = true;
        }

        if (!cp.protocol_version) { cp.protocol_version = '1.0.0'; changed = true; }
        if (defaults.spec_level && !cp.spec_level) { cp.spec_level = defaults.spec_level; changed = true; }

        if (changed) {
            unifiedDiff += `--- a/${relPath}\n+++ b/${relPath}\n(JSON modification not shown in unified diff for brevity)\n`;
            if (!dryRun) {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            }
        }
    }

    await walk(DOCS_ROOT);

    // Write reports
    await fs.writeFile(path.join(REPORTS_DIR, 'bulk-frontmatter-normalize.patch'), unifiedDiff);
    await fs.writeFile(path.join(REPORTS_DIR, 'frontmatter-patch-report.json'), JSON.stringify(reportPatch, null, 2));

    console.log(`Normalization complete. Reports written to ${REPORTS_DIR}`);
}

main().catch(console.error);
