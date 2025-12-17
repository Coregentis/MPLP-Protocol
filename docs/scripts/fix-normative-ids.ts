
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import yaml from 'yaml';

const DOCS_DIR = path.resolve(__dirname, '../docs');
const REGISTRY_YAML = path.resolve(__dirname, '../docs/00-index/mplp-v1.0-normative-registry.yaml');
const REGISTRY_JSON = path.resolve(__dirname, '../docs/00-index/mplp-v1.0-normative-registry.json');
const BASE_URL = 'https://docs.mplp.io/id';

console.log('Scanning for missing normative_ids...');

// Read Registries
let registryYamlContent = fs.readFileSync(REGISTRY_YAML, 'utf-8');
const registryJson = JSON.parse(fs.readFileSync(REGISTRY_JSON, 'utf-8'));

async function main() {
    const files = await glob(path.join(DOCS_DIR, '**/*.{md,mdx}'));
    let fixedCount = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        // Simple frontmatter parse
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!fmMatch) continue;

        const fmText = fmMatch[1];

        let existingIdMatch = fmText.match(/normative_id: (.*)/);
        let needsFix = false;

        if (!fmText.includes('doc_status: normative')) continue;

        // Check if missing OR if it is the bad generated ID
        if (!existingIdMatch) {
            needsFix = true;
        } else if (existingIdMatch[1].endsWith('INDEX-MDX')) {
            needsFix = true;
            console.log(`Fixing bad ID: ${existingIdMatch[1]}`);
        }

        if (!needsFix) continue;

        // MISSING ID
        let basename = path.basename(file, path.extname(file)); // strip extension correctly
        const dirname = path.dirname(file).split(path.sep).pop(); // e.g. 10-sdk

        // Use dirname for index files to avoid duplicates
        if (basename === 'index' || basename === 'README') {
            if (dirname) basename = dirname.replace(/^\d+-/, ''); // strip number prefix
        }

        // Generate ID
        // Convention: MPLP-{SECTION}-{NAME} in UPPER-KEBAB
        let section = 'CORE';
        if (dirname?.includes('sdk')) section = 'SDK';
        if (dirname?.includes('observability')) section = 'OBS';
        if (dirname?.includes('learning')) section = 'LEARN';
        if (dirname?.includes('runtime')) section = 'RT';
        if (dirname?.includes('tests')) section = 'TEST'; // Added TEST section

        const slug = basename.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
        const newId = `MPLP-${section}-${slug}`;

        console.log(`Fixing ${basename} -> ${newId}`);

        // 1. Update File
        let newFm = fmText;
        if (existingIdMatch) {
            newFm = fmText.replace(/normative_id: .*/, `normative_id: ${newId}`);
        } else {
            newFm = fmText + `\nnormative_id: ${newId}`;
        }

        const newContent = content.replace(fmText, newFm);
        fs.writeFileSync(file, newContent);

        // 2. Add to YAML
        // Check duplication
        if (!registryYamlContent.includes(`id: ${newId}`)) {
            const yamlEntry = `
  - id: ${newId}
    json_ld_id: "${BASE_URL}/${newId}"
    title: "${basename}" # Placeholder title
    permalink: /${dirname?.replace(/^\d+-/, '')}/${basename}
    spec_level: CrossCutting
    modules: []
    cross_cutting: []
`;
            registryYamlContent += yamlEntry;
        }

        // 3. Add to JSON
        if (!registryJson.documents.find((d: any) => d.id === newId)) {
            registryJson.documents.push({
                id: newId,
                json_ld_id: `${BASE_URL}/${newId}`,
                title: basename, // Best effort
                permalink: `/${dirname?.replace(/^\d+-/, '')}/${basename}`,
                spec_level: "CrossCutting",
                modules: [],
                cross_cutting: []
            });
        }

        fixedCount++;
    }

    // Save Registries
    if (fixedCount > 0) {
        fs.writeFileSync(REGISTRY_YAML, registryYamlContent);
        fs.writeFileSync(REGISTRY_JSON, JSON.stringify(registryJson, null, 4));
        console.log(`Fixed ${fixedCount} normative pages.`);
    } else {
        console.log('No missing IDs found.');
    }
}

main();
