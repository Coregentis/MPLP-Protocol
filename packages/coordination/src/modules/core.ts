import type { Core } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface CoreModuleInput {
    config: Record<string, unknown>;
}

export interface CoreModuleOutput {
    core: Core;
}

export type CoreModuleHandler = ModuleHandler<CoreModuleInput, CoreModuleOutput>;
