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
import type { RuntimeContext } from "../types/runtime-context";
import type { MplpEvent } from "@mplp/coordination";
export interface ActionExecutionLayer {
    executeAction(params: {
        module: string;
        stepId?: string;
        input: unknown;
        context: RuntimeContext;
    }): Promise<{
        output: unknown;
        events?: MplpEvent[];
    }>;
}
/**
 * InMemoryAEL
 *
 * Reference implementation used for tests and examples.
 * It does NOT call any real external systems.
 */
export declare class InMemoryAEL implements ActionExecutionLayer {
    executeAction(params: {
        module: string;
        stepId?: string;
        input: unknown;
        context: RuntimeContext;
    }): Promise<{
        output: unknown;
        events?: MplpEvent[];
    }>;
}
