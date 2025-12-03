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

/**
 * Utilities for converting Ajv validation errors to standard ValidationResult format
 *
 * @see docs/06-sdk/schema-mapping-standard.md Section 5
 */
import type { ErrorObject } from 'ajv';
import type { ValidationResult } from './types';
/**
 * Converts Ajv validation errors to standard ValidationResult
 *
 * @param errors - Ajv error array (null/undefined if validation passed)
 * @returns Standardized ValidationResult
 */
export declare function ajvErrorsToValidationResult(errors: ErrorObject[] | null | undefined): ValidationResult;
