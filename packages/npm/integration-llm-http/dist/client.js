"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLlmClient = void 0;
class HttpLlmClient {
    constructor(config, fetchImpl) {
        this.config = config;
        this.fetchImpl = fetchImpl;
    }
    async generate(request) {
        const { baseUrl, defaultHeaders, timeoutMs } = this.config;
        const controller = new AbortController();
        const timer = typeof timeoutMs === "number"
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
            const json = (await res.json());
            // Minimal assumption: `json.output` is the generation text.
            return {
                output: json.output ?? "",
                raw: json
            };
        }
        finally {
            if (timer)
                clearTimeout(timer);
        }
    }
}
exports.HttpLlmClient = HttpLlmClient;
