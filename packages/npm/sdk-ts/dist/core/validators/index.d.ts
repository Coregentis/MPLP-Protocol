/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 */
export interface ValidationResult {
    ok: boolean;
    errors: any[];
}
export declare function validateContext(data: any): ValidationResult;
export declare function validatePlan(data: any): ValidationResult;
export declare function validateConfirm(data: any): ValidationResult;
export declare function validateTrace(data: any): ValidationResult;
