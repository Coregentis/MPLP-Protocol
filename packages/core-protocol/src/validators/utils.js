"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajvErrorsToValidationResult = ajvErrorsToValidationResult;
/**
 * Maps Ajv error keywords to standard MPLP error codes
 */
const CODE_MAP = {
    required: 'required',
    type: 'type',
    enum: 'enum',
    pattern: 'pattern',
    format: 'format',
    minLength: 'min_length',
    maxLength: 'max_length',
    minimum: 'minimum',
    maximum: 'maximum',
    additionalProperties: 'extra_forbidden',
};
/**
 * Converts Ajv validation errors to standard ValidationResult
 *
 * @param errors - Ajv error array (null/undefined if validation passed)
 * @returns Standardized ValidationResult
 */
function ajvErrorsToValidationResult(errors) {
    if (!errors || errors.length === 0) {
        return { ok: true, errors: [] };
    }
    const items = errors.map((err) => {
        const code = CODE_MAP[err.keyword] ?? 'unknown';
        const path = normalizeAjvPath(err);
        const message = err.message ?? '';
        return { path, code, message };
    });
    return { ok: false, errors: items };
}
/**
 * Normalizes Ajv error instancePath to standard dot/bracket notation
 *
 * Examples:
 * - "/meta/protocol_version" → "meta.protocol_version"
 * - "/steps/0/step_id" → "steps[0].step_id"
 * - "" (with missingProperty) → "meta" (for required field)
 *
 * @param err - Ajv ErrorObject
 * @returns Normalized path string
 */
function normalizeAjvPath(err) {
    // Handle required field missing case
    if (err.keyword === 'required' && err.params && 'missingProperty' in err.params) {
        const missing = err.params.missingProperty;
        const basePath = err.instancePath || '';
        const baseNormalized = normalizePathSegments(basePath);
        return baseNormalized ? `${baseNormalized}.${missing}` : missing;
    }
    // Handle additionalProperties (extra_forbidden)
    if (err.keyword === 'additionalProperties' && err.params && 'additionalProperty' in err.params) {
        const extra = err.params.additionalProperty;
        const basePath = err.instancePath || '';
        const baseNormalized = normalizePathSegments(basePath);
        return baseNormalized ? `${baseNormalized}.${extra}` : extra;
    }
    // Handle regular validation errors
    const raw = err.instancePath || '';
    return normalizePathSegments(raw);
}
/**
 * Converts Ajv's slash-separated path to dot/bracket notation
 *
 * Examples:
 * - "/meta/protocol_version" → "meta.protocol_version"
 * - "/steps/0/step_id" → "steps[0].step_id"
 * - "" (with missingProperty) → "meta" (for required field)
 *
 * @param raw - Raw path like "/meta/protocol_version" or "/steps/0/step_id"
 * @returns Normalized path like "meta.protocol_version" or "steps[0].step_id"
 */
function normalizePathSegments(raw) {
    if (!raw)
        return '';
    const parts = raw.split('/').filter(Boolean); // Remove leading ""
    let path = '';
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isIndex = /^\d+$/.test(part);
        if (isIndex) {
            // Array index - use bracket notation
            path += `[${part}]`;
        }
        else {
            // Object property - use dot notation
            path += path ? `.${part}` : part;
        }
    }
    return path;
}
