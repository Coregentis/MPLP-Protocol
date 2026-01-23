/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2026 Bangshi Beijing Network Technology Limited Company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

/**
 * Safe JSON file reading that strips UTF-8 BOM and provides detailed error messages.
 * This ensures compatibility across different editors and OS environments.
 */
function readJsonFileSafe(filePath: string): any {
    const raw = readFileSync(filePath, 'utf-8');

    // 1. Strip UTF-8 BOM (U+FEFF) if present
    // 2. Trim whitespace to avoid trailing/leading issues
    const normalized = raw.replace(/^\uFEFF/, '').trim();

    try {
        const data = JSON.parse(normalized);
        if (data && typeof data === 'object' && '$comment' in data) {
            delete data.$comment;
        }
        return data;
    } catch (err) {
        console.error(`❌ Failed to parse JSON file: ${filePath}`);
        console.error('Content preview (first 200 chars):', normalized.slice(0, 200));
        throw err;
    }
}

export interface GoldenInvariant {
    id: string;
    path: string;
    rule: string;
    description?: string;
    scope?: string;
}

export interface GoldenFlowDefinition {
    flowId: string;
    name: string;
    path: string;
    input: {
        context?: any;
        plan?: any;
        confirm?: any;
        trace?: any;
    };
    expected: {
        context?: any;
        plan?: any;
        confirm?: any;
        trace?: any;
        events?: any[];
        invariants?: GoldenInvariant[];
    };
    globalInvariants: GoldenInvariant[];
}

const GOLDEN_ROOT = join(__dirname, '../../flows');
const INVARIANTS_ROOT = join(__dirname, '../../invariants');

export function loadGlobalInvariants(): GoldenInvariant[] {
    const invariants: GoldenInvariant[] = [];
    if (!existsSync(INVARIANTS_ROOT)) return invariants;

    const files = readdirSync(INVARIANTS_ROOT).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
        const content = readFileSync(join(INVARIANTS_ROOT, file), 'utf8');
        const parsed = yaml.load(content) as GoldenInvariant[];
        const scope = file.split('.')[0];
        if (Array.isArray(parsed)) {
            parsed.forEach(p => p.scope = scope);
            invariants.push(...parsed);
        }
    }
    return invariants;
}

export function loadGoldenFlows(): GoldenFlowDefinition[] {
    const flows: GoldenFlowDefinition[] = []
    if (!existsSync(GOLDEN_ROOT)) return flows;

    const globalInvariants = loadGlobalInvariants();

    // MPLP v1.0 Protocol Invariant Flows
    // These flows define the minimum behavioral semantics required for v1.0 compliance.
    // Any implementation claiming MPLP v1.0 compatibility MUST pass these flows.
    const V1_PROTOCOL_FLOWS = [
        'flow-01-single-agent-plan',
        'flow-02-single-agent-large-plan',
        'flow-03-single-agent-with-tools',
        'flow-04-single-agent-llm-enrichment',
        'flow-05-single-agent-confirm-required',
    ] as const;

    // Profile-Level Flows (optional, not part of v1.0 compliance boundary)
    const SA_PROFILE_FLOWS = [
        'sa-flow-01-basic',
        'sa-flow-02-step-evaluation',
    ] as const;

    // MAP Profile Flows (Profile-level, non-mandatory)
    const MAP_PROFILE_FLOWS = [
        'map-flow-01-turn-taking',
        'map-flow-02-broadcast-fanout',
    ] as const;

    const ALL_FLOWS = [...V1_PROTOCOL_FLOWS, ...SA_PROFILE_FLOWS, ...MAP_PROFILE_FLOWS];

    const allFlowDirs = readdirSync(GOLDEN_ROOT)
        .filter(f => statSync(join(GOLDEN_ROOT, f)).isDirectory());
    const flowDirs = allFlowDirs.filter(f => ALL_FLOWS.includes(f as any));

    for (const dir of flowDirs) {
        const flowPath = join(GOLDEN_ROOT, dir);
        const flowId = dir.split('-').slice(0, 2).join('-').toUpperCase();
        const name = dir.split('-').slice(2).join(' ').replace(/\b\w/g, c => c.toUpperCase());

        const inputDir = join(flowPath, 'input');
        const expectedDir = join(flowPath, 'expected');

        const input: any = {};
        if (existsSync(inputDir)) {
            ['context', 'plan', 'confirm', 'trace'].forEach(type => {
                const p = join(inputDir, `${type}.json`);
                if (existsSync(p)) input[type] = readJsonFileSafe(p);
            });
        }

        const expected: any = {};
        if (existsSync(expectedDir)) {
            ['context', 'plan', 'confirm', 'trace'].forEach(type => {
                const p = join(expectedDir, `${type}.json`);
                if (existsSync(p)) expected[type] = readJsonFileSafe(p);
            });

            const eventsPath = join(expectedDir, 'events.json');
            if (existsSync(eventsPath)) expected.events = readJsonFileSafe(eventsPath);

            const invPath = join(flowPath, 'invariants.yaml');
            if (existsSync(invPath)) {
                const content = readFileSync(invPath, 'utf8');
                const parsed = yaml.load(content) as { invariants: GoldenInvariant[] };
                if (parsed && parsed.invariants) {
                    expected.invariants = parsed.invariants;
                }
            }
        }

        flows.push({
            flowId,
            name,
            path: flowPath,
            input,
            expected,
            globalInvariants
        });
    }

    return flows;
}

