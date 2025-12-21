"use strict";
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * MPLP Protocol v1.0.0 — Coordination Contracts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContract = createContract;
/**
 * Create a coordination contract.
 */
function createContract(id, participants, terms = []) {
    return {
        id,
        participants,
        terms,
        status: 'draft'
    };
}
