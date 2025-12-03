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

export interface LlmHttpClientConfig {
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
    timeoutMs?: number;
}

export interface LlmGenerationRequest {
    model?: string;
    input: string;
    temperature?: number;
    maxTokens?: number;
    // extension-friendly: allow extra fields
    extra?: Record<string, unknown>;
}

export interface LlmGenerationResult {
    output: string;
    raw?: unknown;
}

export interface LlmClient {
    generate(
        request: LlmGenerationRequest
    ): Promise<LlmGenerationResult>;
}
