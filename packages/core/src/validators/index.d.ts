/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import { ValidationResult } from './types';
export declare class MplpValidator {
    private ajv;
    private validators;
    constructor();
    private loadSchemas;
    private validate;
    validateContext(data: unknown): ValidationResult;
    validatePlan(data: unknown): ValidationResult;
    validateConfirm(data: unknown): ValidationResult;
    validateTrace(data: unknown): ValidationResult;
    validateRole(data: unknown): ValidationResult;
    validateExtension(data: unknown): ValidationResult;
    validateDialog(data: unknown): ValidationResult;
    validateCollab(data: unknown): ValidationResult;
    validateCore(data: unknown): ValidationResult;
    validateNetwork(data: unknown): ValidationResult;
}
export type { ValidationResult, ValidationErrorItem } from './types';
export declare function validateContext(data: unknown): ValidationResult;
export declare function validatePlan(data: unknown): ValidationResult;
export declare function validateConfirm(data: unknown): ValidationResult;
export declare function validateTrace(data: unknown): ValidationResult;
export declare function validateRole(data: unknown): ValidationResult;
export declare function validateExtension(data: unknown): ValidationResult;
export declare function validateDialog(data: unknown): ValidationResult;
export declare function validateCollab(data: unknown): ValidationResult;
export declare function validateCore(data: unknown): ValidationResult;
export declare function validateNetwork(data: unknown): ValidationResult;
