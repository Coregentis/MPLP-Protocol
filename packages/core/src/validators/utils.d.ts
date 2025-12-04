/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
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
