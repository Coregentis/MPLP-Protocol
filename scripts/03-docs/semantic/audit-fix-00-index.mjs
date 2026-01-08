import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'docs/docs/00-index');

function getFiles(dirPath) {
    return fs.readdirSync(dirPath).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
}

const files = getFiles(targetDir);
console.log(`Auditing ${files.length} files in 00-index...`);

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const relativePath = path.relative(process.cwd(), filePath);
    const stats = fs.statSync(filePath);

    // 1. Integrity Check
    if (stats.size < 200) {
        console.error(`[CRITICAL] File too small: ${relativePath} (${stats.size} bytes)`);
        // In a real scenario, we might try to restore here, but for now just report.
    }
    if (content.includes('title: Untitled')) {
        console.error(`[CRITICAL] File has 'Untitled' title: ${relativePath}`);
    }

    // 2. Fix Mojibake
    if (content.includes("鉁?")) {
        content = content.replace(/鉁\?/g, "✅");
        modified = true;
        console.log(`[Mojibake] Fixed ✅ in ${relativePath}`);
    }
    if (content.includes("馃Л")) {
        content = content.replace(/馃Л/g, "📖");
        modified = true;
        console.log(`[Mojibake] Fixed 📖 in ${relativePath}`);
    }

    // 3. Governance Markers (Scope/Non-Goals)
    // Only for normative/informative docs (skip assets if any)
    // Check doc_type
    const docTypeMatch = content.match(/doc_type: (.*)/);
    const docType = docTypeMatch ? docTypeMatch[1].trim() : 'normative';

    const hasScope = content.includes('## Scope') || content.includes('> **Scope**:');

    if (!hasScope && docType !== 'assets') {
        console.log(`[Governance] Inserting Scope in ${relativePath}`);

        const inheritancePath = '/docs/00-index/';
        const injection = `> **Scope**: Inherited (from ${inheritancePath})
> **Non-Goals**: Inherited (from ${inheritancePath})
`;

        // Insert before H1
        const titleMatch = content.match(/^# (.*)(\r?\n|$)/m);
        if (titleMatch) {
            const titleIndex = titleMatch.index;
            const beforeTitle = content.substring(0, titleIndex);
            const afterTitle = content.substring(titleIndex);

            let newContent = beforeTitle;
            if (!newContent.trimEnd().endsWith('---')) {
                if (!newContent.endsWith('\n\n')) {
                    if (newContent.endsWith('\n')) newContent += '\n';
                    else newContent += '\n\n';
                }
            } else {
                if (!newContent.endsWith('\n')) newContent += '\n';
            }

            content = newContent + injection + '\n' + afterTitle;
            modified = true;
        } else {
            // Fallback
            const parts = content.split(/^---$/gm);
            if (parts.length >= 3) {
                const first = content.indexOf('---');
                const second = content.indexOf('---', first + 3);
                if (second !== -1) {
                    const before = content.substring(0, second + 3);
                    const after = content.substring(second + 3);
                    content = before + '\n\n' + injection + '\n' + after.trimStart();
                    modified = true;
                    console.log(`[Governance] Inserted Scope (fallback) in ${relativePath}`);
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
