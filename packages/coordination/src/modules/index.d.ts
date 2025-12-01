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
import type { CoordinationContext } from "../types/coordination-context";
import type { MplpEvent } from "../events";
export interface ModuleExecutionResult<TOutput> {
    output: TOutput;
    events?: MplpEvent[];
}
export type EmitEvent = (event: MplpEvent) => void;
/**
 * Generic module handler signature.
 * This is a pure contract; L3 will implement the actual behavior.
 */
export interface ModuleHandler<TInput, TOutput> {
    (params: {
        input: TInput;
        ctx: CoordinationContext;
        emitEvent?: EmitEvent;
    }): ModuleExecutionResult<TOutput> | Promise<ModuleExecutionResult<TOutput>>;
}
export * from "./context";
export * from "./plan";
export * from "./confirm";
export * from "./trace";
export * from "./role";
export * from "./extension";
export * from "./dialog";
export * from "./collab";
export * from "./core";
export * from "./network";
