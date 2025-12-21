"use strict";
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * MPLP v1.0 Module Interfaces & Helpers
 *
 * This package contains the 10 core module interfaces:
 * - Context, Plan, Confirm, Trace (L1)
 * - Role, Dialog, Collab, Extension, Core, Network (L2)
 *
 * Plus execution profiles (SA/MAP) and module dependency matrix.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFILES = exports.MODULE_DEPENDENCIES = void 0;
/**
 * Module Dependency Matrix
 */
exports.MODULE_DEPENDENCIES = {
    context: [],
    plan: ['context'],
    confirm: ['plan'],
    trace: ['context', 'plan'],
    role: ['context'],
    dialog: ['context'],
    collab: ['context', 'network'],
    extension: [],
    core: [],
    network: []
};
/**
 * Standard execution profiles
 */
exports.PROFILES = {
    SA: {
        name: 'SA',
        requiredModules: ['context', 'plan', 'confirm', 'trace'],
        optionalModules: ['role', 'dialog', 'extension']
    },
    MAP: {
        name: 'MAP',
        requiredModules: ['context', 'plan', 'trace', 'collab', 'network'],
        optionalModules: ['confirm', 'role', 'dialog'],
        coordinationStrategy: 'turn-taking'
    }
};
