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
import { validateContext } from '../../src/validators';
import type { ValidationResult } from '../../src/validators';

describe('ValidationResult Structure Tests', () => {
    test('should return ok=true with empty errors for valid context', () => {
        const validContext = {
            meta: {
                protocol_version: '1.0.0',
                schema_version: '1.0.0',
                created_at: new Date().toISOString()
            },
            context_id: crypto.randomUUID(),
            root: {
                user_id: crypto.randomUUID(),
                domain: 'test-domain',
                environment: 'test-env'
            },
            title: 'Test Context',
            status: 'active'
        };

        const result = validateContext(validContext);
        if (!result.ok) {
            console.error('Validation failed:', JSON.stringify(result.errors, null, 2));
        }
        expect(result.ok).toBe(true);
        expect(result.errors).toEqual([]);
    });

    test('[required] should detect missing required field', () => {
        const invalid = {
            meta: { protocol_version: '1.0.0', schema_version: '1.0.0' },
            // missing context_id
            root: { user_id: crypto.randomUUID() },
            title: 'Test',
            status: 'active'
        };

        const result = validateContext(invalid);
        expect(result.ok).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);

        const requiredError = result.errors.find(e => e.code === 'required');
        expect(requiredError).toBeDefined();
        expect(requiredError?.path).toBe('context_id');
    });

    test('[type] should detect wrong type', () => {
        const invalid = {
            meta: {
                protocol_version: '1.0.0',
                schema_version: '1.0.0',
                created_at: new Date().toISOString()
            },
            context_id: crypto.randomUUID(),
            root: { user_id: crypto.randomUUID() },
            title: 123, // should be string
            status: 'active'
        };

        const result = validateContext(invalid);
        expect(result.ok).toBe(false);
        const typeError = result.errors.find(e => e.code === 'type');
        expect(typeError).toBeDefined();
        expect(typeError?.path).toBe('title');
    });

    test('[enum] should detect invalid enum value', () => {
        const invalid = {
            meta: {
                protocol_version: '1.0.0',
                schema_version: '1.0.0',
                created_at: new Date().toISOString()
            },
            context_id: crypto.randomUUID(),
            root: { user_id: crypto.randomUUID() },
            title: 'Test',
            status: 'INVALID_STATUS' // not in enum list
        };

        const result = validateContext(invalid);
        expect(result.ok).toBe(false);
        const enumError = result.errors.find(e => e.code === 'enum');
        expect(enumError).toBeDefined();
        expect(enumError?.path).toBe('status');
    });

    test('[pattern] should detect invalid UUID pattern', () => {
        const invalid = {
            meta: {
                protocol_version: '1.0.0',
                schema_version: '1.0.0',
                created_at: new Date().toISOString()
            },
            context_id: 'not-a-valid-uuid',
            root: { user_id: crypto.randomUUID() },
            title: 'Test',
            status: 'active'
        };

        const result = validateContext(invalid);
        expect(result.ok).toBe(false);
        const patternError = result.errors.find(e => e.code === 'pattern');
        expect(patternError).toBeDefined();
        expect(patternError?.path).toBe('context_id');
    });

    test('[format] should detect invalid date-time format', () => {
        const invalid = {
            meta: {
                protocol_version: '1.0.0',
                schema_version: '1.0.0',
                created_at: 'not-a-datetime' // invalid ISO 8601
            },
            context_id: crypto.randomUUID(),
            root: { user_id: crypto.randomUUID() },
            title: 'Test',
            status: 'active'
        };

        const result = validateContext(invalid);
        expect(result.ok).toBe(false);
        const formatError = result.errors.find(e => e.code === 'format');
        expect(formatError).toBeDefined();
        expect(formatError?.path).toBe('meta.created_at');
    });

    test('[extra_forbidden] should detect additional properties', () => {
        const invalid = {
            meta: {
                protocol_version: '1.0.0',
                schema_version: '1.0.0',
                created_at: new Date().toISOString(),
                extraField: 'not allowed' // additionalProperties: false
            },
            context_id: crypto.randomUUID(),
            root: { user_id: crypto.randomUUID() },
            title: 'Test',
            status: 'active'
        };

        const result = validateContext(invalid);
        expect(result.ok).toBe(false);
        const extraError = result.errors.find(e => e.code === 'extra_forbidden');
        expect(extraError).toBeDefined();
        expect(extraError?.path).toContain('meta');
    });

    test('ValidationErrorItem structure', () => {
        const invalid = { meta: {} }; // severely invalid

        const result: ValidationResult = validateContext(invalid);
        expect(result.ok).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);

        result.errors.forEach(error => {
            expect(error).toHaveProperty('path');
            expect(error).toHaveProperty('code');
            expect(error).toHaveProperty('message');
            expect(typeof error.path).toBe('string');
            expect(typeof error.code).toBe('string');
            expect(typeof error.message).toBe('string');
        });
    });
});
