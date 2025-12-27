"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA_NAMES = void 0;
exports.loadSchema = loadSchema;
exports.createValidator = createValidator;
exports.validate = validate;
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const fs_1 = require("fs");
const path_1 = require("path");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
/**
 * Load a schema by name
 */
function loadSchema(name) {
    const schemaPath = (0, path_1.join)(__dirname, '../schemas', `${name}.schema.json`);
    const content = (0, fs_1.readFileSync)(schemaPath, 'utf-8');
    return JSON.parse(content);
}
/**
 * Create an Ajv instance with all MPLP schemas pre-loaded
 */
function createValidator() {
    const ajv = new ajv_1.default({ strict: false, allErrors: true });
    (0, ajv_formats_1.default)(ajv);
    return ajv;
}
/**
 * Validate data against a schema
 */
function validate(schemaName, data) {
    const schema = loadSchema(schemaName);
    const ajv = createValidator();
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return { valid, errors: validate.errors || undefined };
}
// Export schema names for convenience
exports.SCHEMA_NAMES = {
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
};
