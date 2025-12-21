/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * MPLP Protocol v1.0.0 — Core Validators (Stub Implementation)
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 * 
 * NOTE: This is a stub implementation that always returns valid.
 * For full validation, use @mplp/schema package with JSON schemas.
 */

export interface ValidationErrorItem {
    path: string;
    code: string;
    message: string;
}

export interface ValidationResult {
    ok: boolean;
    errors: ValidationErrorItem[];
}

/**
 * Validate a Context object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateContext(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Plan object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validatePlan(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Confirm object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateConfirm(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Trace object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateTrace(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Role object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateRole(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate an Extension object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateExtension(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Dialog object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateDialog(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Collab object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateCollab(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Core object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateCore(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}

/**
 * Validate a Network object against MPLP specification.
 * @param data - The data to validate
 * @returns ValidationResult with ok=true for stub implementation
 */
export function validateNetwork(data: unknown): ValidationResult {
    return { ok: true, errors: [] };
}
