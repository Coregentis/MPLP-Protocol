#!/usr/bin/env node
/**
 * Local CLI Evaluator for MCP Tool-Call Flow
 * 
 * Purpose: Generate deterministic verdict_hash for auditable evidence
 * 
 * Evaluates:
 * - Pack structure (artifacts, timeline, integrity)
 * - Invariant presence (tool.call, tool.result, data)
 * - Hash stability (deterministic output)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const PACK_PATH = args[0] || 'pack';

function computeFileHash(filepath) {
    const content = fs.readFileSync(filepath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function evaluatePack(packDir) {
    const results = {
        timestamp: new Date().toISOString(),
        pack_path: packDir,
        checks: [],
        verdict: 'UNKNOWN'
    };

    // Check required files
    const requiredFiles = [
        'manifest.json',
        'artifacts/context.json',
        'artifacts/plan.json',
        'artifacts/trace.json',
        'timeline/events.ndjson',
        'integrity/sha256sums.txt'
    ];

    for (const file of requiredFiles) {
        const exists = fs.existsSync(path.join(packDir, file));
        results.checks.push({
            check: `file_exists:${file}`,
            passed: exists
        });
    }

    // Load trace and check invariants
    const tracePath = path.join(packDir, 'artifacts/trace.json');
    if (fs.existsSync(tracePath)) {
        const trace = JSON.parse(fs.readFileSync(tracePath, 'utf-8'));
        const events = trace.events || [];

        const hasToolCall = events.some(e => e.event_type === 'tool.call');
        const hasToolResult = events.some(e => e.event_type === 'tool.result');
        const hasToolData = events.filter(e => e.event_type === 'tool.call').every(e => e.data != null);

        results.checks.push({ check: 'invariant:tool_call_event_present', passed: hasToolCall });
        results.checks.push({ check: 'invariant:tool_result_event_present', passed: hasToolResult });
        results.checks.push({ check: 'invariant:tool_data_present', passed: hasToolData });
    }

    // Compute verdict_hash from sorted artifacts content
    const artifactDir = path.join(packDir, 'artifacts');
    const artifactFiles = fs.readdirSync(artifactDir).sort();
    let combinedContent = '';
    for (const file of artifactFiles) {
        const content = fs.readFileSync(path.join(artifactDir, file), 'utf-8');
        combinedContent += content;
    }
    results.verdict_hash = crypto.createHash('sha256').update(combinedContent).digest('hex');

    // Compute pack_root_hash
    const sha256sumsPath = path.join(packDir, 'integrity/sha256sums.txt');
    if (fs.existsSync(sha256sumsPath)) {
        results.pack_root_hash = computeFileHash(sha256sumsPath);
    }

    // Determine final verdict
    const allPassed = results.checks.every(c => c.passed);
    results.verdict = allPassed ? 'PASS' : 'FAIL';

    return results;
}

function main() {
    console.log('=== Local CLI Evaluator (tool-call-flow) ===\n');

    const results = evaluatePack(PACK_PATH);

    console.log(`Pack: ${results.pack_path}`);
    console.log(`Timestamp: ${results.timestamp}\n`);

    console.log('Checks:');
    for (const check of results.checks) {
        const status = check.passed ? '✓' : '✗';
        console.log(`  ${status} ${check.check}`);
    }

    console.log(`\nVerdict: ${results.verdict}`);
    console.log(`verdict_hash: ${results.verdict_hash}`);
    console.log(`pack_root_hash: ${results.pack_root_hash}`);

    // Output JSON for diff stability testing
    if (process.argv.includes('--json')) {
        console.log('\n--- JSON Output ---');
        console.log(JSON.stringify({
            verdict: results.verdict,
            verdict_hash: results.verdict_hash,
            pack_root_hash: results.pack_root_hash
        }, null, 2));
    }

    process.exit(results.verdict === 'PASS' ? 0 : 1);
}

main();
