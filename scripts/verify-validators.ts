
import {
    validateContext,
    validatePlan,
    validateConfirm,
    validateTrace,
    validateRole
} from '../packages/core-protocol/src/validators';

console.log('Starting Validator Verification...');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

// Context Tests
try {
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
    const res = validateContext(validContext);
    assert(res.ok === true, 'Valid Context should pass');
    if (!res.ok) console.error(res.errors);

    const invalidContext = {
        meta: { protocol_version: '1.0.0' },
        // missing context_id
        root: { domain: 'test' }
    };
    const res2 = validateContext(invalidContext);
    assert(res2.ok === false, 'Invalid Context should fail');
} catch (e) {
    console.error('Context Test Error:', e);
    failed++;
}

// Plan Tests
try {
    const validPlan = {
        meta: {
            protocol_version: '1.0.0',
            schema_version: '1.0.0',
            created_at: '2023-10-27T10:00:00Z'
        },
        plan_id: '550e8400-e29b-41d4-a716-446655440001',
        context_id: '550e8400-e29b-41d4-a716-446655440000',
        steps: [
            {
                step_id: 'step-1',
                description: 'Do something'
            }
        ]
    };
    const res = validatePlan(validPlan);
    assert(res.ok === true, 'Valid Plan should pass');
    if (!res.ok) console.error(res.errors);
} catch (e) {
    console.error('Plan Test Error:', e);
    failed++;
}

// Confirm Tests
try {
    const validConfirm = {
        meta: { protocol_version: '1.0.0', schema_version: '1.0.0', created_at: '2023-01-01T00:00:00Z' },
        confirm_id: '550e8400-e29b-41d4-a716-446655440002',
        plan_id: '550e8400-e29b-41d4-a716-446655440001',
        status: 'approved'
    };
    const res = validateConfirm(validConfirm);
    assert(res.ok === true, 'Valid Confirm should pass');
} catch (e) {
    console.error('Confirm Test Error:', e);
    failed++;
}

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
