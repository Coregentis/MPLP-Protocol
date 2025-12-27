import Ajv from 'ajv';
/**
 * Schema loader and validator for MPLP Protocol v1.0
 */
export interface SchemaMap {
    [schemaId: string]: any;
}
/**
 * Load a schema by name
 */
export declare function loadSchema(name: string): any;
/**
 * Create an Ajv instance with all MPLP schemas pre-loaded
 */
export declare function createValidator(): Ajv;
/**
 * Validate data against a schema
 */
export declare function validate(schemaName: string, data: any): {
    valid: boolean;
    errors?: any[];
};
export declare const SCHEMA_NAMES: {
    readonly CORE: "mplp-core";
    readonly CONTEXT: "mplp-context";
    readonly PLAN: "mplp-plan";
    readonly CONFIRM: "mplp-confirm";
    readonly TRACE: "mplp-trace";
    readonly DIALOG: "mplp-dialog";
    readonly COLLAB: "mplp-collab";
    readonly NETWORK: "mplp-network";
    readonly EXTENSION: "mplp-extension";
    readonly ROLE: "mplp-role";
};
