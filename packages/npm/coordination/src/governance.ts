/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * MPLP Protocol v1.0.0 — Governance Contracts
 */

/**
 * Governance policy interface for multi-agent coordination.
 */
export interface GovernancePolicy {
    id: string;
    name: string;
    rules: GovernanceRule[];
}

/**
 * Individual governance rule.
 */
export interface GovernanceRule {
    type: 'require' | 'deny' | 'allow';
    subject: string;
    action: string;
    conditions?: Record<string, unknown>;
}

/**
 * Create a governance policy.
 */
export function createGovernancePolicy(
    id: string,
    name: string,
    rules: GovernanceRule[] = []
): GovernancePolicy {
    return { id, name, rules };
}
