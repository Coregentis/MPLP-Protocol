/**
 * MPLP Golden Flow Registry — Single Source of Truth (SSOT)
 * 
 * GOVERNANCE:
 *   Registry Introduced: 2026-01-15
 *   Protocol Frozen: MPLP v1.0.0 (2025-12-03)
 *   Governance: MPLP Protocol Governance Committee (MPGC)
 * 
 * TRUTH SOURCE:
 *   Flow IDs and titles are derived from tests/golden/flows/ directory names.
 *   This registry governs NAMES ONLY. Step counts, modules, and other
 *   derived information must be extracted from fixtures at runtime.
 * 
 * USAGE:
 *   All website, docs, and lab UIs MUST reference this registry for flow names.
 *   Any name drift from this registry is a bug.
 * 
 * © 2026 Bangshi Beijing Network Technology Co., Ltd.
 * Licensed under Apache License 2.0. Governed by MPGC.
 */

export type FlowCategory = 'core' | 'sa_profile' | 'map_profile';

export interface GoldenFlowEntry {
    /** Flow ID (matches directory name pattern) */
    id: string;
    /** Authoritative title - governed by registry */
    title: string;
    /** Path to source of truth (relative to repo root) */
    source_of_truth_path: string;
    /** Flow category */
    category: FlowCategory;
    /** Whether this flow is part of v1.0 compliance boundary */
    compliance_boundary: boolean;
}

/**
 * Golden Flow Registry — GOVERNED NAMES
 * 
 * These entries define authoritative flow NAMES ONLY.
 * All other metadata (modules, steps, etc.) is derived from fixtures.
 */
export const GOLDEN_FLOW_REGISTRY: GoldenFlowEntry[] = [
    // ============================================
    // Core v1.0 Compliance Boundary (FLOW-01~05)
    // ============================================
    {
        id: 'flow-01',
        title: 'Single Agent – Happy Path',
        source_of_truth_path: 'tests/golden/flows/flow-01-single-agent-plan',
        category: 'core',
        compliance_boundary: true,
    },
    {
        id: 'flow-02',
        title: 'Single Agent – Large Plan',
        source_of_truth_path: 'tests/golden/flows/flow-02-single-agent-large-plan',
        category: 'core',
        compliance_boundary: true,
    },
    {
        id: 'flow-03',
        title: 'Single Agent – With Tools',
        source_of_truth_path: 'tests/golden/flows/flow-03-single-agent-with-tools',
        category: 'core',
        compliance_boundary: true,
    },
    {
        id: 'flow-04',
        title: 'Single Agent with LLM Enrichment',
        source_of_truth_path: 'tests/golden/flows/flow-04-single-agent-llm-enrichment',
        category: 'core',
        compliance_boundary: true,
    },
    {
        id: 'flow-05',
        title: 'Single Agent with Confirm Required',
        source_of_truth_path: 'tests/golden/flows/flow-05-single-agent-confirm-required',
        category: 'core',
        compliance_boundary: true,
    },

    // ============================================
    // SA Profile-Level (SA-FLOW-01~02)
    // ============================================
    {
        id: 'sa-flow-01',
        title: 'SA Basic Execution',
        source_of_truth_path: 'tests/golden/flows/sa-flow-01-basic',
        category: 'sa_profile',
        compliance_boundary: false,
    },
    {
        id: 'sa-flow-02',
        title: 'SA Multi-Step Evaluation',
        source_of_truth_path: 'tests/golden/flows/sa-flow-02-step-evaluation',
        category: 'sa_profile',
        compliance_boundary: false,
    },

    // ============================================
    // MAP Profile-Level (MAP-FLOW-01~02)
    // ============================================
    {
        id: 'map-flow-01',
        title: 'MAP Turn-Taking Session',
        source_of_truth_path: 'tests/golden/flows/map-flow-01-turn-taking',
        category: 'map_profile',
        compliance_boundary: false,
    },
    {
        id: 'map-flow-02',
        title: 'MAP Broadcast Fan-out',
        source_of_truth_path: 'tests/golden/flows/map-flow-02-broadcast-fanout',
        category: 'map_profile',
        compliance_boundary: false,
    },
];

// ============================================
// Helper Functions
// ============================================

export function getCoreFlows(): GoldenFlowEntry[] {
    return GOLDEN_FLOW_REGISTRY.filter(f => f.category === 'core');
}

export function getSAFlows(): GoldenFlowEntry[] {
    return GOLDEN_FLOW_REGISTRY.filter(f => f.category === 'sa_profile');
}

export function getMAPFlows(): GoldenFlowEntry[] {
    return GOLDEN_FLOW_REGISTRY.filter(f => f.category === 'map_profile');
}

export function getFlowById(id: string): GoldenFlowEntry | undefined {
    return GOLDEN_FLOW_REGISTRY.find(f => f.id === id);
}

export function getComplianceBoundaryFlows(): GoldenFlowEntry[] {
    return GOLDEN_FLOW_REGISTRY.filter(f => f.compliance_boundary);
}

// ============================================
// Excluded from Registry (Internal)
// ============================================
// - tool-call-flow: Internal test, not part of Golden Flow registry
