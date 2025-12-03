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

import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Schema loader and validator for MPLP Protocol v1.0
 */

export interface SchemaMap {
    [schemaId: string]: any;
}

/**
 * Load a schema by name
 */
export function loadSchema(name: string): any {
    const schemaPath = join(__dirname, '../schemas', `${name}.schema.json`);
    const content = readFileSync(schemaPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Create an Ajv instance with all MPLP schemas pre-loaded
 */
export function createValidator(): Ajv {
    const ajv = new Ajv({ strict: false, allErrors: true });
    addFormats(ajv);
    return ajv;
}

/**
 * Validate data against a schema
 */
export function validate(schemaName: string, data: any): { valid: boolean; errors?: any[] } {
    const schema = loadSchema(schemaName);
    const ajv = createValidator();
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return { valid, errors: validate.errors || undefined };
}

// Export schema names for convenience
export const SCHEMA_NAMES = {
    CORE: 'mplp-core',
    CONTEXT: 'mplp-context',
    PLAN: 'mplp-plan',
    CONFIRM: 'mplp-confirm',
    TRACE: 'mplp-trace',
    DIALOG: 'mplp-dialog',
    COLLAB: 'mplp-collab',
    NETWORK: 'mplp-network',
    EXTENSION: 'mplp-extension',
    ROLE: 'mplp-role',
} as const;
