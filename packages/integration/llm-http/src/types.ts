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
