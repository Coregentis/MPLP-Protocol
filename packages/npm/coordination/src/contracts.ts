/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * MPLP Protocol v1.0.0 — Coordination Contracts
 */

/**
 * Coordination contract between agents.
 */
export interface CoordinationContract {
    id: string;
    participants: string[];
    terms: ContractTerm[];
    status: 'draft' | 'active' | 'completed' | 'terminated';
}

/**
 * Individual contract term.
 */
export interface ContractTerm {
    type: string;
    description: string;
    requirements?: Record<string, unknown>;
}

/**
 * Create a coordination contract.
 */
export function createContract(
    id: string,
    participants: string[],
    terms: ContractTerm[] = []
): CoordinationContract {
    return {
        id,
        participants,
        terms,
        status: 'draft'
    };
}
