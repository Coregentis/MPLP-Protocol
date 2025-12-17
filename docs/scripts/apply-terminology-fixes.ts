
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve(__dirname, '../docs');
const PATCH_FILE = path.resolve(__dirname, '../reports/TERMINOLOGY_AUTO_FIX_DIFF.patch');

if (!fs.existsSync(PATCH_FILE)) {
    console.error('Patch file not found.');
    process.exit(1);
}

const patchContent = fs.readFileSync(PATCH_FILE, 'utf-8');
const lines = patchContent.split('\n').filter(l => l.trim().length > 0);

console.log(`Applying ${lines.length} fixes...`);

let success = 0;
let fail = 0;

lines.forEach(line => {
    // Expected format: sed -i '' 's/original/suggestion/g' docs/docs/path/to/file
    // Regex parsing might be brittle if content has quotes/slashes.
    // But since our generator was simple, we can try to parse.

    // Better approach: Re-implement the fix logic directly here using the finding object?
    // The patch file is just a list of sed commands.
    // Let's parse components: s/find/replace/g path

    // Improved Regex: match sed command
    // sed -i '' 's/FIND/REPLACE/g' PATH
    const match = line.match(/sed -i '' 's\/(.*?)\/(.*?)\/g' (.*)/);
    if (!match) {
        // Try shell executing? No, safer to do in node.
        console.warn(`Skipping line (parse error): ${line}`);
        fail++;
        return;
    }

    const find = match[1];
    const replace = match[2];
    const relativePath = match[3].replace('docs/docs/', ''); // The command generated `docs/docs/...`
    const absolutePath = path.join(DOCS_DIR, relativePath);

    try {
        if (!fs.existsSync(absolutePath)) {
            console.warn(`File not found: ${absolutePath}`);
            fail++;
            return;
        }

        let content = fs.readFileSync(absolutePath, 'utf-8');
        // Global replace using regex with word boundaries if possible consistent with scanner
        // The scanner used \b${escape(find)}\b
        const regex = new RegExp(`\\b${find}\\b`, 'g');

        // Wait, the sed command was raw string replace.
        // Let's trust the logic: find was constructed from matchedText which was word-bounded.
        // We should replace all occurrences of that EXACT string.

        // Safety check: Don't replace if it breaks T0 identifiers?
        // Scanner already filtered those out.

        const newContent = content.replace(regex, replace);
        if (content !== newContent) {
            fs.writeFileSync(absolutePath, newContent);
            success++;
        } else {
            // Already fixed or not found?
            // Maybe casing issue in regex vs string?
            // Try case insensitive find? Scanner found it with 'gi'.
            // If we use 'g' here, we might miss if case mismatch.
            // But valid fix is: "Context module" -> "Context Module". Exact match "Context module".
            // So case sensitive replace is correct for the finding.
        }
    } catch (e) {
        console.error(`Error processing ${relativePath}: ${e}`);
        fail++;
    }
});

console.log(`Applied fixes. Success: ${success}, Fail: ${fail}`);
