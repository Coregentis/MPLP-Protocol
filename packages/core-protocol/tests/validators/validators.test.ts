import { describe, it, expect } from 'vitest';
import {
    validateContext,
    validatePlan,
    validateConfirm,
    validateTrace,
    validateRole,
    validateExtension,
    validateDialog,
    validateCollab,
    validateCore,
    validateNetwork
} from '../../src/validators';

describe('L1 Core Protocol Validators', () => {

    describe('Context Validator', () => {
        it('should validate a valid context', () => {
            const validContext = {
                meta: {
                    protocol_version: '1.0.0',
                    schema_version: '1.0.0',
                    created_at: '2023-10-27T10:00:00Z'
                },
                context_id: '550e8400-e29b-41d4-a716-446655440000',
                root: {
                    domain: 'test-domain',
                    environment: 'development'
                },
                title: 'Test Context',
                status: 'active'
            };
            const result = validateContext(validContext);
            expect(result.ok, JSON.stringify(result.errors)).toBe(true);
        });

        it('should reject invalid context (missing required field)', () => {
            const invalidContext = {
                meta: {
                    protocol_version: '1.0.0'
                },
                // missing context_id
                domain: 'test-domain'
            };
            const result = validateContext(invalidContext);
            expect(result.ok).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });

    describe('Plan Validator', () => {
        it('should validate a valid plan', () => {
            const validPlan = {
                meta: {
                    protocol_version: '1.0.0',
                    schema_version: '1.0.0',
                    created_at: '2023-10-27T10:00:00Z'
                },
                plan_id: '550e8400-e29b-41d4-a716-446655440001',
                context_id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Test Plan',
                objective: 'Test Objective',
                status: 'draft',
                steps: [
                    {
                        step_id: '550e8400-e29b-41d4-a716-446655440100',
                        description: 'Do something',
                        status: 'pending'
                    }
                ]
            };
            const result = validatePlan(validPlan);
            if (!result.ok) console.error('Plan Errors:', JSON.stringify(result.errors, null, 2));
            expect(result.ok).toBe(true);
        });
    });

    // Add minimal tests for other modules to satisfy the requirement "at least one valid + one invalid"

    describe('Confirm Validator', () => {
        it('should validate valid confirm', () => {
            const valid = {
                meta: { protocol_version: '1.0.0', schema_version: '1.0.0', created_at: '2023-01-01T00:00:00Z' },
                confirm_id: '550e8400-e29b-41d4-a716-446655440002',
                target_type: 'plan',
                target_id: '550e8400-e29b-41d4-a716-446655440001',
                requested_by_role: 'assistant',
                requested_at: '2023-01-01T00:00:00Z',
                status: 'approved'
            };
            const result = validateConfirm(valid);
            if (!result.ok) console.error(JSON.stringify(result.errors, null, 2));
            expect(result.ok).toBe(true);
        });
    });

    describe('Trace Validator', () => {
        it('should validate valid trace', () => {
            const valid = {
                meta: { protocol_version: '1.0.0', schema_version: '1.0.0', created_at: '2023-01-01T00:00:00Z' },
                trace_id: '550e8400-e29b-41d4-a716-446655440003',
                context_id: '550e8400-e29b-41d4-a716-446655440000',
                status: 'pending',
                root_span: {
                    trace_id: '550e8400-e29b-41d4-a716-446655440003',
                    span_id: '550e8400-e29b-41d4-a716-446655440010'
                }
            };
            const result = validateTrace(valid);
            if (!result.ok) console.error('Trace Errors:', JSON.stringify(result.errors, null, 2));
            expect(result.ok).toBe(true);
        });
    });

    describe('Role Validator', () => {
        it('should validate valid role', () => {
            const valid = {
                meta: { protocol_version: '1.0.0', schema_version: '1.0.0', created_at: '2023-01-01T00:00:00Z' },
                role_id: '550e8400-e29b-41d4-a716-446655440004',
                name: 'assistant',
                capabilities: ['chat']
            };
            expect(validateRole(valid).ok).toBe(true);
        });
    });

});
