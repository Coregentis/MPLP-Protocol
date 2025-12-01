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
 * Standard ValidationResult Types for MPLP Protocol
 *
 * These types define the canonical validation error structure across all MPLP SDKs.
 * Changes to these types constitute breaking changes and require schema version bump.
 *
 * @see docs/06-sdk/schema-mapping-standard.md Section 5
 */
export interface ValidationErrorItem {
    /**
     * Path to the failing field using dot and bracket notation
     * Examples: "meta.protocol_version", "steps[0].step_id", "root.user_id"
     */
    path: string;
    /**
     * Standard error code identifying the constraint violation
     * Possible values: "required", "type", "enum", "pattern", "format",
     * "min_length", "max_length", "minimum", "maximum", "extra_forbidden"
     */
    code: string;
    /**
     * Human-readable error message
     */
    message: string;
}
export interface ValidationResult {
    /**
     * Whether validation succeeded
     */
    ok: boolean;
    /**
     * Array of validation errors (empty if ok=true)
     */
    errors: ValidationErrorItem[];
}
