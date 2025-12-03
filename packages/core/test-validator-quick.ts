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

// Quick manual verification of ValidationResult structure
import { validateContext } from './src/validators';

const invalid = {
    meta: { protocol_version: '1.0.0' },
    // missing required fields
};

const result = validateContext(invalid);
console.log(JSON.stringify(result, null, 2));
