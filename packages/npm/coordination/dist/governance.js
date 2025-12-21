"use strict";
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * MPLP Protocol v1.0.0 — Governance Contracts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGovernancePolicy = createGovernancePolicy;
/**
 * Create a governance policy.
 */
function createGovernancePolicy(id, name, rules = []) {
    return { id, name, rules };
}
