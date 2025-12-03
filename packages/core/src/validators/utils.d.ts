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
