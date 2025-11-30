import type {
    LlmHttpClientConfig,
    LlmGenerationRequest,
    LlmGenerationResult,
    LlmClient
} from "./types";

export type FetchLike = (
    input: string,
    init?: RequestInit
) => Promise<Response>;

export class HttpLlmClient implements LlmClient {
    constructor(
        private readonly config: LlmHttpClientConfig,
        private readonly fetchImpl: FetchLike
    ) { }

    async generate(request: LlmGenerationRequest): Promise<LlmGenerationResult> {
        const { baseUrl, defaultHeaders, timeoutMs } = this.config;

        const controller = new AbortController();
        const timer =
            typeof timeoutMs === "number"
                ? setTimeout(() => controller.abort(), timeoutMs)
                : undefined;

        try {
            const res = await this.fetchImpl(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(defaultHeaders ?? {})
                },
                body: JSON.stringify(request),
                signal: controller.signal
            });

            if (!res.ok) {
                throw new Error(`LLM HTTP error: ${res.status} ${res.statusText}`);
            }

            const json = (await res.json()) as any;

            // Minimal assumption: `json.output` is the generation text.
            return {
                output: json.output ?? "",
                raw: json
            };
        } finally {
            if (timer) clearTimeout(timer);
        }
    }
}
