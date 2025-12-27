/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * MPLP v1.0 Compliance & Validation
 *
 * This package provides compliance testing and validation for MPLP implementations:
 * - Golden Flow tests (Flow-01 through Flow-05)
 * - Invariant checks
 * - PSG validation
 * - Schema compliance utilities
 */
export interface ComplianceReport {
    passed: boolean;
    flowId: string;
    timestamp: string;
    results: {
        phase: string;
        passed: boolean;
        errors?: string[];
    }[];
}
export interface ValidationResult {
    valid: boolean;
    errors?: any[];
}
/**
 * Run Golden Flow 01: Single-Agent Basic
 */
export declare function runGoldenFlow01(): Promise<ComplianceReport>;
/**
 * Validate PSG structure and invariants
 */
export declare function validatePSG(psg: any): ValidationResult;
/**
 * Validate against MPLP schema
 */
export declare function validateSchema(schemaName: string, data: any): ValidationResult;
/**
 * Check all invariants for a given flow
 */
export declare function checkInvariants(flowData: any): Promise<ValidationResult>;
export declare const GOLDEN_FLOWS: {
    readonly FLOW_01: "../../tests/golden/flows/flow-01-single-agent-basic.json";
    readonly FLOW_02: "../../tests/golden/flows/flow-02-single-agent-risk-confirm.json";
    readonly FLOW_03: "../../tests/golden/flows/flow-03-multi-agent-collab.json";
    readonly FLOW_04: "../../tests/golden/flows/flow-04-role-based-dialog.json";
    readonly FLOW_05: "../../tests/golden/flows/flow-05-context-continuity.json";
};
