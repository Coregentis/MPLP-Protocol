/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
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
    extra?: Record<string, unknown>;
}
export interface LlmGenerationResult {
    output: string;
    raw?: unknown;
}
export interface LlmClient {
    generate(request: LlmGenerationRequest): Promise<LlmGenerationResult>;
}
