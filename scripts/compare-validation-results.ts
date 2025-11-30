import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const VALIDATION_DIR = path.join(__dirname, '../tests/cross-language/validation');
const FIXTURES_DIR = path.join(VALIDATION_DIR, 'fixtures');
const OUT_TS_DIR = path.join(VALIDATION_DIR, 'out/ts');
const OUT_PY_DIR = path.join(VALIDATION_DIR, 'out/py');

function deepCompareValidation(fixture: string, tsResult: any, pyResult: any): string[] {
    const errors: string[] = [];

    // Compare OK status
    if (tsResult.ok !== pyResult.ok) {
        errors.push(`OK status mismatch: TS=${tsResult.ok}, PY=${pyResult.ok}`);
        return errors;
    }

    // Compare Errors (Path + Code)
    const tsErrors = new Set(tsResult.errors.map((e: any) => `${e.path}|${e.code}`));
    const pyErrors = new Set(pyResult.errors.map((e: any) => `${e.path}|${e.code}`));

    // Check for missing in Py
    for (const err of tsErrors) {
        if (!pyErrors.has(err)) {
            errors.push(`Missing in Python: ${err}`);
        }
    }

    // Check for missing in TS
    for (const err of pyErrors) {
        if (!tsErrors.has(err)) {
            errors.push(`Missing in TS: ${err}`);
        }
    }

    return errors;
}

async function main() {
    console.log('🚀 Running Cross-Language Validation Comparison...\n');

    // 1. Run TS Tests
    console.log('1️⃣  Running TypeScript validation tests...');
    try {
        execSync('npx vitest run tests/cross-language/validation/ts-validation.test.ts', {
            cwd: path.join(__dirname, '..'), stdio: 'inherit'
        });
    } catch (e) {
        console.error('❌ TS tests failed');
        process.exit(1);
    }

    // 2. Run Python Tests
    console.log('\n2️⃣  Running Python validation tests...');
    try {
        execSync('python -m pytest packages/sdk-py/tests/cross_language/test_validation_cross_language.py -q', {
            cwd: path.join(__dirname, '..'), stdio: 'inherit',
            env: { ...process.env, PYTHONPATH: 'packages/sdk-py/src' }
        });
    } catch (e) {
        console.error('❌ Python tests failed');
        process.exit(1);
    }

    // 3. Compare Results
    console.log('\n3️⃣  Comparing Validation Results...');

    const fixtures = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'));
    let allPassed = true;

    for (const fixture of fixtures) {
        const tsPath = path.join(OUT_TS_DIR, fixture);
        const pyPath = path.join(OUT_PY_DIR, fixture);

        if (!fs.existsSync(tsPath) || !fs.existsSync(pyPath)) {
            console.error(`❌ Missing output for ${fixture}`);
            allPassed = false;
            continue;
        }

        const tsResult = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
        const pyResult = JSON.parse(fs.readFileSync(pyPath, 'utf-8'));

        const errors = deepCompareValidation(fixture, tsResult, pyResult);

        if (errors.length === 0) {
            console.log(`✅ ${fixture}: EQUIVALENT`);
        } else {
            console.error(`❌ ${fixture}: DIFFERENCES FOUND`);
            errors.forEach(e => console.error(`   - ${e}`));
            allPassed = false;
        }
    }

    if (allPassed) {
        console.log('\n✨ All cross-language validation comparisons passed!');
        process.exit(0);
    } else {
        console.error('\n❌ Validation comparison failed');
        process.exit(1);
    }
}

main();
