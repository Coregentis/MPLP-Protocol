import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import types
import { Context } from '../types/context';
import { Plan } from '../types/plan';
import { Confirm } from '../types/confirm';
import { Trace } from '../types/trace';
import { Role } from '../types/role';
import { Extension } from '../types/extension';
import { Dialog } from '../types/dialog';
import { Collab } from '../types/collab';
import { Core } from '../types/core';
import { Network } from '../types/network';

// Import new standardized ValidationResult types
import { ValidationResult } from './types';
import { ajvErrorsToValidationResult } from './utils';

// Validator Class
export class MplpValidator {
    private ajv: Ajv;
    private validators: Map<string, ValidateFunction> = new Map();

    constructor() {
        this.ajv = new Ajv({ strict: false, allErrors: true });
        addFormats(this.ajv);
        this.loadSchemas();
    }

    private loadSchemas() {
        const schemasDir = join(__dirname, '../../../../schemas/v2');
        const commonDir = join(schemasDir, 'common');

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
            const path = join(commonDir, file);
            const schema = JSON.parse(readFileSync(path, 'utf8'));
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
            const path = join(schemasDir, `mplp-${module}.schema.json`);
            try {
                const schema = JSON.parse(readFileSync(path, 'utf8'));
                if (!this.ajv.getSchema(schema.$id)) {
                    this.ajv.addSchema(schema);
                    this.validators.set(module, this.ajv.compile(schema));
                }
            } catch (e) {
                console.error(`Error loading schema for module ${module}:`, e);
            }
        });
    }

    private validate(module: string, data: unknown): ValidationResult {
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

        return ajvErrorsToValidationResult(validateFn.errors);
    }

    // Public Validator Methods
    public validateContext(data: unknown): ValidationResult {
        return this.validate('context', data);
    }

    public validatePlan(data: unknown): ValidationResult {
        return this.validate('plan', data);
    }

    public validateConfirm(data: unknown): ValidationResult {
        return this.validate('confirm', data);
    }

    public validateTrace(data: unknown): ValidationResult {
        return this.validate('trace', data);
    }

    public validateRole(data: unknown): ValidationResult {
        return this.validate('role', data);
    }

    public validateExtension(data: unknown): ValidationResult {
        return this.validate('extension', data);
    }

    public validateDialog(data: unknown): ValidationResult {
        return this.validate('dialog', data);
    }

    public validateCollab(data: unknown): ValidationResult {
        return this.validate('collab', data);
    }

    public validateCore(data: unknown): ValidationResult {
        return this.validate('core', data);
    }

    public validateNetwork(data: unknown): ValidationResult {
        return this.validate('network', data);
    }
}

// Export types for external use
export type { ValidationResult, ValidationErrorItem } from './types';

// Export singleton instance or factory? 
// For pure functions, we can export individual functions that use a shared instance, 
// or export the class. The user requested "pure functions".
// Let's export a singleton-based functional API to keep it simple and stateless from the caller's perspective.

const validator = new MplpValidator();

export function validateContext(data: unknown) { return validator.validateContext(data); }
export function validatePlan(data: unknown) { return validator.validatePlan(data); }
export function validateConfirm(data: unknown) { return validator.validateConfirm(data); }
export function validateTrace(data: unknown) { return validator.validateTrace(data); }
export function validateRole(data: unknown) { return validator.validateRole(data); }
export function validateExtension(data: unknown) { return validator.validateExtension(data); }
export function validateDialog(data: unknown) { return validator.validateDialog(data); }
export function validateCollab(data: unknown) { return validator.validateCollab(data); }
export function validateCore(data: unknown) { return validator.validateCore(data); }
export function validateNetwork(data: unknown) { return validator.validateNetwork(data); }
