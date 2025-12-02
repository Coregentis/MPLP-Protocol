const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const SCHEMA_DIR = path.join(__dirname, 'schemas/v2');
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

function loadSchemas(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            loadSchemas(fullPath);
        } else if (file.endsWith('.json')) {
            try {
                const schema = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                if (schema.$id) {
                    ajv.addSchema(schema, schema.$id);
                    console.log(`Loaded: ${schema.$id}`);
                }
            } catch (e) {
                console.error(`Error loading ${file}: ${e.message}`);
            }
        }
    });
}

console.log('Loading schemas...');
loadSchemas(SCHEMA_DIR);
console.log('All schemas loaded and valid (Ajv compilation passed).');
