/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

export type MplpEventKind = "import.process" | "intent" | "delta-intent" | "impact-analysis" | "compensation-plan" | "methodology" | "reasoning-graph" | "pipeline.stage" | "snapshot" | "learning-sample" | "runtime.error" | "runtime.retry";
export interface MplpEventBase {
    id: string;
    kind: MplpEventKind;
    timestamp: string;
    runId: string;
    module?: string;
}
export interface ImportProcessEvent extends MplpEventBase {
    kind: "import.process";
    payload: {
        scannedPaths?: string[];
        totalFiles?: number;
        notes?: string;
    };
}
export interface IntentEvent extends MplpEventBase {
    kind: "intent";
    payload: {
        intentId: string;
        summary: string;
    };
}
export interface DeltaIntentEvent extends MplpEventBase {
    kind: "delta-intent";
    payload: {
        originalIntentId: string;
        changes: unknown[];
    };
}
export interface ImpactAnalysisEvent extends MplpEventBase {
    kind: "impact-analysis";
    payload: {
        affectedModules: string[];
        riskLevel: string;
    };
}
export interface PipelineStageEvent extends MplpEventBase {
    kind: "pipeline.stage";
    payload: {
        stage: string;
        status: "started" | "completed" | "failed";
    };
}
export interface RuntimeErrorEvent extends MplpEventBase {
    kind: "runtime.error";
    payload: {
        code: string;
        message: string;
        stack?: string;
    };
}
export interface RuntimeRetryEvent extends MplpEventBase {
    kind: "runtime.retry";
    payload: {
        attempt: number;
        maxAttempts: number;
        reason: string;
    };
}
export interface LearningSampleEvent extends MplpEventBase {
    kind: "learning-sample";
    payload: {
        sampleId: string;
        input: unknown;
        output: unknown;
        feedback?: number;
    };
}
export type MplpEvent = ImportProcessEvent | IntentEvent | DeltaIntentEvent | ImpactAnalysisEvent | PipelineStageEvent | RuntimeErrorEvent | RuntimeRetryEvent | LearningSampleEvent;
