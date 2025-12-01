/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
