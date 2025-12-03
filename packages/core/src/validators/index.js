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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MplpValidator = void 0;
exports.validateContext = validateContext;
exports.validatePlan = validatePlan;
exports.validateConfirm = validateConfirm;
exports.validateTrace = validateTrace;
exports.validateRole = validateRole;
exports.validateExtension = validateExtension;
exports.validateDialog = validateDialog;
exports.validateCollab = validateCollab;
exports.validateCore = validateCore;
exports.validateNetwork = validateNetwork;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
// Validator Class
class MplpValidator {
    constructor() {
        this.validators = new Map();
        this.ajv = new ajv_1.default({ strict: false, allErrors: true });
        (0, ajv_formats_1.default)(this.ajv);
        this.loadSchemas();
    }
    loadSchemas() {
        const schemasDir = (0, path_1.join)(__dirname, '../../../../schemas/v2');
        const commonDir = (0, path_1.join)(schemasDir, 'common');
        // Load Common Schemas
        const commonFiles = [
            'identifiers.schema.json',
            'metadata.schema.json',
            'common-types.schema.json',
            'trace-base.schema.json',
            'events.schema.json',
            'learning-sample.schema.json'
        ];
        commonFiles.forEach(file => {
            const path = (0, path_1.join)(commonDir, file);
            const schema = JSON.parse((0, fs_1.readFileSync)(path, 'utf8'));
            if (!this.ajv.getSchema(schema.$id)) {
                this.ajv.addSchema(schema);
            }
        });
        // Load Module Schemas
        const modules = [
            'context', 'plan', 'confirm', 'trace', 'role',
            'extension', 'dialog', 'collab', 'core', 'network'
        ];
        modules.forEach(module => {
            const path = (0, path_1.join)(schemasDir, `mplp-${module}.schema.json`);
            try {
                const schema = JSON.parse((0, fs_1.readFileSync)(path, 'utf8'));
                if (!this.ajv.getSchema(schema.$id)) {
                    this.ajv.addSchema(schema);
                    this.validators.set(module, this.ajv.compile(schema));
                }
            }
            catch (e) {
                console.error(`Error loading schema for module ${module}:`, e);
            }
        });
    }
    validate(module, data) {
        const validateFn = this.validators.get(module);
        if (!validateFn) {
            return {
                ok: false,
                errors: [{
                        path: '',
                        code: 'unknown',
                        message: `Validator for module '${module}' not found.`
                    }]
            };
        }
        const valid = validateFn(data);
        if (valid) {
            return { ok: true, errors: [] };
        }
        return (0, utils_1.ajvErrorsToValidationResult)(validateFn.errors);
    }
    // Public Validator Methods
    validateContext(data) {
        return this.validate('context', data);
    }
    validatePlan(data) {
        return this.validate('plan', data);
    }
    validateConfirm(data) {
        return this.validate('confirm', data);
    }
    validateTrace(data) {
        return this.validate('trace', data);
    }
    validateRole(data) {
        return this.validate('role', data);
    }
    validateExtension(data) {
        return this.validate('extension', data);
    }
    validateDialog(data) {
        return this.validate('dialog', data);
    }
    validateCollab(data) {
        return this.validate('collab', data);
    }
    validateCore(data) {
        return this.validate('core', data);
    }
    validateNetwork(data) {
        return this.validate('network', data);
    }
}
exports.MplpValidator = MplpValidator;
// Export singleton instance or factory? 
// For pure functions, we can export individual functions that use a shared instance, 
// or export the class. The user requested "pure functions".
// Let's export a singleton-based functional API to keep it simple and stateless from the caller's perspective.
const validator = new MplpValidator();
function validateContext(data) { return validator.validateContext(data); }
function validatePlan(data) { return validator.validatePlan(data); }
function validateConfirm(data) { return validator.validateConfirm(data); }
function validateTrace(data) { return validator.validateTrace(data); }
function validateRole(data) { return validator.validateRole(data); }
function validateExtension(data) { return validator.validateExtension(data); }
function validateDialog(data) { return validator.validateDialog(data); }
function validateCollab(data) { return validator.validateCollab(data); }
function validateCore(data) { return validator.validateCore(data); }
function validateNetwork(data) { return validator.validateNetwork(data); }
