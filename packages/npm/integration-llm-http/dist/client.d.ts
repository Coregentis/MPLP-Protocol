/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { LlmHttpClientConfig, LlmGenerationRequest, LlmGenerationResult, LlmClient } from "./types";
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
export declare class HttpLlmClient implements LlmClient {
    private readonly config;
    private readonly fetchImpl;
    constructor(config: LlmHttpClientConfig, fetchImpl: FetchLike);
    generate(request: LlmGenerationRequest): Promise<LlmGenerationResult>;
}
