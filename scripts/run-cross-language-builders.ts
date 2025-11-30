import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const OUT_DIR = path.join(__dirname, '../tests/cross-language/builders/out');
const TS_JSON = path.join(OUT_DIR, 'ts/single-agent.json');
const PY_JSON = path.join(OUT_DIR, 'py/single-agent.json');

const IGNORED_FIELDS = [
    'context_id', 'plan_id', 'confirm_id', 'trace_id',
    'step_id', 'span_id', 'target_id',
    'created_at', 'requested_at', 'started_at', 'finished_at'
];

function normalizeJSON(obj: any, pathStr: string = ''): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map((item, i) => normalizeJSON(item, `${pathStr}[${i}]`));
    if (typeof obj === 'object') {
        const normalized: any = {};
        for (const key of Object.keys(obj)) {
            if (!IGNORED_FIELDS.includes(key)) {
                normalized[key] = normalizeJSON(obj[key], pathStr ? `${pathStr}.${key}` : key);
            }
        }
        return normalized;
    }
    return obj;
}

function deepCompareJSON(obj1: any, obj2: any, pathStr: string = ''): string[] {
    const errors: string[] = [];
    if (typeof obj1 !== typeof obj2) {
        errors.push(`${pathStr}: Type mismatch - ${typeof obj1} vs ${typeof obj2}`);
        return errors;
    }
    if (obj1 === null || obj2 === null) {
        if (obj1 !== obj2) errors.push(`${pathStr}: Null mismatch`);
        return errors;
    }
    if (Array.isArray(obj1)) {
        if (!Array.isArray(obj2)) {
            errors.push(`${pathStr}: Array vs non-array`);
            return errors;
        }
        if (obj1.length !== obj2.length) {
            errors.push(`${pathStr}: Array length mismatch - ${obj1.length} vs ${obj2.length}`);
        }
        for (let i = 0; i < Math.min(obj1.length, obj2.length); i++) {
            errors.push(...deepCompareJSON(obj1[i], obj2[i], `${pathStr}[${i}]`));
        }
        return errors;
    }
    if (typeof obj1 === 'object') {
        const keys1 = new Set(Object.keys(obj1));
        const keys2 = new Set(Object.keys(obj2));
        for (const key of keys1) {
            if (!keys2.has(key)) errors.push(`${pathStr}.${key}: Missing in Python output`);
        }
        for (const key of keys2) {
            if (!keys1.has(key)) errors.push(`${pathStr}.${key}: Missing in TypeScript output`);
        }
        for (const key of keys1) {
            if (keys2.has(key)) {
                errors.push(...deepCompareJSON(obj1[key], obj2[key], pathStr ? `${pathStr}.${key}` : key));
            }
        }
        return errors;
    }
    if (obj1 !== obj2) errors.push(`${pathStr}: Value mismatch - "${obj1}" vs "${obj2}"`);
    return errors;
}

async function main() {
    console.log('🚀 Running Cross-Language Builder Tests...\n');

    console.log('1️⃣  Running TypeScript builders...');
    try {
        execSync('npx vitest run tests/cross-language/builders/ts-builders.test.ts', {
            cwd: path.join(__dirname, '..'), stdio: 'inherit'
        });
        console.log('✅ TypeScript builders completed\n');
    } catch (error) {
        console.error('❌ TypeScript builders failed');
        process.exit(1);
    }

    console.log('2️⃣  Running Python builders...');
    try {
        execSync('python -m pytest packages/sdk-py/tests/cross_language/test_builders_cross_language.py -v', {
            cwd: path.join(__dirname, '..'), stdio: 'inherit',
            env: { ...process.env, PYTHONPATH: 'packages/sdk-py/src' }
        });
        console.log('✅ Python builders completed\n');
    } catch (error) {
        console.error('❌ Python builders failed');
        process.exit(1);
    }

    console.log('3️⃣  Comparing JSON outputs (ignoring auto-generated IDs/timestamps)...');

    if (!fs.existsSync(TS_JSON)) {
        console.error(`❌ TypeScript output not found: ${TS_JSON}`);
        process.exit(1);
    }
    if (!fs.existsSync(PY_JSON)) {
        console.error(`❌ Python output not found: ${PY_JSON}`);
        process.exit(1);
    }

    const tsData = JSON.parse(fs.readFileSync(TS_JSON, 'utf-8'));
    const pyData = JSON.parse(fs.readFileSync(PY_JSON, 'utf-8'));
    const tsNormalized = normalizeJSON(tsData);
    const pyNormalized = normalizeJSON(pyData);
    const errors = deepCompareJSON(tsNormalized, pyNormalized);

    if (errors.length === 0) {
        console.log('✅ Cross-language builders produce EQUIVALENT JSON\n');
        console.log('📊 Summary:');
        console.log(`   - TypeScript output: ${TS_JSON}`);
        console.log(`   - Python output: ${PY_JSON}`);
        console.log(`   - Result: EQUIVALENT ✓`);
        console.log(`   - Ignored fields: ${IGNORED_FIELDS.join(', ')}`);
        process.exit(0);
    } else {
        console.error('❌ Normalized JSON outputs differ:');
        errors.forEach(err => console.error(`   - ${err}`));
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
