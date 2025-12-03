/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMAS_ROOT = path.join(__dirname, '../../schemas/v2');

function loadSchema(filename: string) {
    const schemaPath = path.join(SCHEMAS_ROOT, filename);
    const content = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(content);
}

// TypeScript field definitions (manually maintained, protected by tests)
// Core 4 modules
const TS_CONTEXT_FIELDS = [
    'meta', 'governance', 'context_id', 'root', 'title', 'summary',
    'status', 'tags', 'language', 'owner_role', 'constraints',
    'created_at', 'updated_at', 'trace', 'events'
] as const;

const TS_CONTEXT_REQUIRED = ['meta', 'context_id', 'root', 'title', 'status'] as const;

const TS_PLAN_FIELDS = [
    'meta', 'plan_id', 'context_id', 'title', 'objective',
    'status', 'steps', 'trace', 'events'
] as const;

const TS_PLAN_REQUIRED = ['meta', 'plan_id', 'context_id', 'title', 'objective', 'status', 'steps'] as const;

const TS_CONFIRM_FIELDS = [
    'meta', 'governance', 'confirm_id', 'target_type', 'target_id',
    'status', 'requested_by_role', 'requested_at', 'reason',
    'decisions', 'trace', 'events'
] as const;

const TS_CONFIRM_REQUIRED = ['meta', 'confirm_id', 'target_type', 'target_id', 'status', 'requested_by_role', 'requested_at'] as const;

const TS_TRACE_FIELDS = [
    'meta', 'governance', 'trace_id', 'context_id', 'plan_id',
    'root_span', 'status', 'started_at', 'finished_at',
    'segments', 'events'
] as const;

const TS_TRACE_REQUIRED = ['meta', 'trace_id', 'context_id', 'root_span', 'status'] as const;

describe('TypeScript Schema Alignment - Core Modules', () => {
    test('Context fields match schema', () => {
        const schema = loadSchema('mplp-context.schema.json');
        const schemaProps = new Set(Object.keys(schema.properties || {}));
        const tsFields = new Set(TS_CONTEXT_FIELDS);

        expect(tsFields).toEqual(schemaProps);
    });

    test('Context required fields match schema', () => {
        const schema = loadSchema('mplp-context.schema.json');
        const schemaRequired = new Set(schema.required || []);
        const tsRequired = new Set(TS_CONTEXT_REQUIRED);

        expect(tsRequired).toEqual(schemaRequired);
    });

    test('Plan fields match schema', () => {
        const schema = loadSchema('mplp-plan.schema.json');
        const schemaProps = new Set(Object.keys(schema.properties || {}));
        const tsFields = new Set(TS_PLAN_FIELDS);

        expect(tsFields).toEqual(schemaProps);
    });

    test('Plan required fields match schema', () => {
        const schema = loadSchema('mplp-plan.schema.json');
        const schemaRequired = new Set(schema.required || []);
        const tsRequired = new Set(TS_PLAN_REQUIRED);

        expect(tsRequired).toEqual(schemaRequired);
    });

    test('Confirm fields match schema', () => {
        const schema = loadSchema('mplp-confirm.schema.json');
        const schemaProps = new Set(Object.keys(schema.properties || {}));
        const tsFields = new Set(TS_CONFIRM_FIELDS);

        expect(tsFields).toEqual(schemaProps);
    });

    test('Confirm required fields match schema', () => {
        const schema = loadSchema('mplp-confirm.schema.json');
        const schemaRequired = new Set(schema.required || []);
        const tsRequired = new Set(TS_CONFIRM_REQUIRED);

        expect(tsRequired).toEqual(schemaRequired);
    });

    test('Trace fields match schema', () => {
        const schema = loadSchema('mplp-trace.schema.json');
        const schemaProps = new Set(Object.keys(schema.properties || {}));
        const tsFields = new Set(TS_TRACE_FIELDS);

        expect(tsFields).toEqual(schemaProps);
    });

    test('Trace required fields match schema', () => {
        const schema = loadSchema('mplp-trace.schema.json');
        const schemaRequired = new Set(schema.required || []);
        const tsRequired = new Set(TS_TRACE_REQUIRED);

        expect(tsRequired).toEqual(schemaRequired);
    });
});
