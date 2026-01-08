import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const CLASSIFICATION_PATH = path.join(ROOT, 'docs-classification.json');

console.log('Script started');

function loadClassification() {
    try {
        const content = fs.readFileSync(CLASSIFICATION_PATH, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error('Error loading classification:', e);
        process.exit(1);
    }
}

function generateHeader(item, title, content) {
    if (item.doc_type === 'normative') {
        return `# ${title}\n\n> **Status**: Normative\n> **Version**: 1.0.0\n> **Authority**: MPGC\n> **Protocol**: MPLP v1.0.0 (Frozen)`;
    } else if (item.doc_type === 'governance') {
        const match = content.match(/\*\*ID\*\*: (DGP-[A-Z0-9-]+)/);
        const dgpId = match ? match[1] : 'DGP-XX';
        return `# ${title}\n\n**ID**: ${dgpId}\n**Version**: 1.0\n**Status**: FROZEN\n**Authority**: Documentation Governance\n**Last Updated**: 2025-12-21`;
    } else {
        return `# ${title}\n\n> **Status**: Informative\n> **Version**: 1.0.0\n> **Authority**: Documentation Governance`;
    }
}

function main() {
    console.log('Loading classification...');
    const data = loadClassification();
    const items = data.items;
    let modifiedCount = 0;

    console.log(`Processing ${items.length} items...`);

    for (const item of items) {
        try {
            if (item.doc_type === 'internal_ops' || item.doc_type === 'unknown') continue;

            const fullPath = path.join(ROOT, item.path);
            if (!fs.existsSync(fullPath)) {
                console.warn(`File not found: ${fullPath}`);
                continue;
            }

            let content = fs.readFileSync(fullPath, 'utf8');

            // 1. Extract ALL Frontmatter blocks
            const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/gm;
            const matches = [...content.matchAll(fmRegex)];

            if (matches.length === 0) {
                continue;
            }

            let primaryFm = matches[0][1];

            // FIX: Malformed description (frontmatter inside description)
            // Pattern: description: --- ... ---
            if (primaryFm.includes('description: ---')) {
                // Try to extract the real description if it exists after the garbage
                // The garbage usually ends with ---
                // But sometimes it's just a mess.
                // Safest bet: Reset description to empty or generic if it looks corrupted.

                // If it contains "id: intro" or similar keys, it's definitely corrupted.
                primaryFm = primaryFm.replace(/description: ---[\s\S]*?---/, 'description: ""');

                // Also catch cases where it doesn't end with --- but has keys
                primaryFm = primaryFm.replace(/description: ---[\s\S]*/, 'description: ""');

                // Specific fix for intro.mdx
                if (item.path.includes('intro.mdx')) {
                    primaryFm = primaryFm.replace(/description:.*doc_type:.*id: intro.*/s, 'description: "Documentation Overview"');
                }
            }

            // Fix broken description from previous run (description: "" text)
            if (/^description: "" .+/m.test(primaryFm)) {
                primaryFm = primaryFm.replace(/^description: "" (.*)$/m, (match, p1) => {
                    // Escape quotes in p1
                    const escaped = p1.replace(/"/g, '\\"');
                    return `description: "${escaped}"`;
                });
            }

            let titleMatch = primaryFm.match(/^title: (.*)$/m);
            let title = titleMatch ? titleMatch[1].trim() : null;

            if (!title && matches.length > 1) {
                for (let i = 1; i < matches.length; i++) {
                    const otherFm = matches[i][1];
                    const tm = otherFm.match(/^title: (.*)$/m);
                    if (tm) {
                        title = tm[1].trim();
                        primaryFm += `\ntitle: ${title}`;
                        break;
                    }
                }
            }

            if (!title) {
                const h1Match = content.match(/^# (.*)$/m);
                title = h1Match ? h1Match[1].trim() : 'Untitled';
                if (!primaryFm.includes('title:')) {
                    primaryFm += `\ntitle: ${title}`;
                }
            }

            // 2. Clean Body
            let body = content.replace(fmRegex, '');
            body = body.replace(/^# .*$/gm, '');
            body = body.replace(/^> \*\*Status\*\*:.*$/gm, '');
            body = body.replace(/^> \*\*Version\*\*:.*$/gm, '');
            body = body.replace(/^> \*\*Authority\*\*:.*$/gm, '');
            body = body.replace(/^> \*\*Protocol\*\*:.*$/gm, '');
            body = body.replace(/^> \*\*Scope\*\*:.*$/gm, '');
            body = body.replace(/^> \*\*Non-Goals\*\*:.*$/gm, '');

            body = body.replace(/^\*\*ID\*\*: DGP-.*$/gm, '');
            body = body.replace(/^\*\*Version\*\*:.*$/gm, '');
            body = body.replace(/^\*\*Status\*\*: FROZEN.*$/gm, '');
            body = body.replace(/^\*\*Authority\*\*:.*$/gm, '');
            body = body.replace(/^\*\*Last Updated\*\*:.*$/gm, '');

            body = body.replace(/> \[!(IMPORTANT|NOTE|WARNING|FROZEN|TIP|CAUTION)\][\s\S]*?(\n\n|$)/g, '');

            body = body.replace(/\n{3,}/g, '\n\n').trim();

            // 3. Reconstruct
            const newHeader = generateHeader(item, title, content);
            const newContent = `---\n${primaryFm.trim()}\n---\n\n${newHeader}\n\n${body}`;

            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Cleaned duplicates: ${item.path}`);
                modifiedCount++;
            }
        } catch (err) {
            console.error(`Error processing ${item.path}:`, err);
        }
    }

    console.log(`Cleanup complete. Modified ${modifiedCount} files.`);
}

main();
