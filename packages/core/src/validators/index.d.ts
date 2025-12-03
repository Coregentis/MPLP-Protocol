/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
